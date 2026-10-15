import type { Pool, PoolClient, QueryResultRow } from "pg";
import { getPool } from "@/infrastructure/database/pool";
import type { MembershipRepository } from "../application/repository";
import type { ApplicationFilters, ApplicationStats, ApplicationStatus, Member, MembershipApplicationDetail, MembershipApplicationSummary, NewApplication, NewMember } from "../domain/models";

function application(row: QueryResultRow): MembershipApplicationSummary {
  return { id: row.id, reference: row.reference, applicantType: row.applicant_type, applicantName: row.applicant_name, email: row.email, phone: row.phone ?? "", location: row.location ?? "", status: row.status, submittedAt: new Date(row.submitted_at).toISOString(), reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null };
}

function member(row: QueryResultRow): Member {
  return { id: row.id, memberNumber: row.member_number, memberType: row.member_type, displayName: row.display_name, email: row.email, phone: row.phone ?? "", location: row.location ?? "", status: row.status, admittedAt: new Date(row.admitted_at).toISOString() };
}

async function nextMemberNumber(client: Pool | PoolClient) {
  const { rows } = await client.query("select nextval('member_number_seq') as value");
  return `UMC-${new Date().getFullYear()}-${String(rows[0].value).padStart(5, "0")}`;
}

export class PostgresMembershipRepository implements MembershipRepository {
  constructor(private readonly pool = getPool()) {}

  async applicationStats(): Promise<ApplicationStats> {
    const stats: ApplicationStats = { all: 0, pending: 0, under_review: 0, clarification_requested: 0, approved: 0, rejected: 0 };
    const { rows } = await this.pool.query("select status, count(*)::int as count from membership_applications group by status");
    for (const row of rows) { stats[row.status as ApplicationStatus] = row.count; stats.all += row.count; }
    return stats;
  }

  async listApplications(filters: ApplicationFilters = {}) {
    const values: unknown[] = [];
    const conditions: string[] = [];
    if (filters.status) { values.push(filters.status); conditions.push(`status = $${values.length}`); }
    if (filters.applicantType) { values.push(filters.applicantType); conditions.push(`applicant_type = $${values.length}`); }
    if (filters.query) { values.push(`%${filters.query}%`); conditions.push(`(applicant_name ilike $${values.length} or email ilike $${values.length} or phone ilike $${values.length} or reference ilike $${values.length})`); }
    const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
    const { rows } = await this.pool.query(`select * from membership_applications ${where} order by submitted_at desc limit 500`, values);
    return rows.map(application);
  }

  async getApplication(id: string): Promise<MembershipApplicationDetail | null> {
    const { rows } = await this.pool.query("select * from membership_applications where id = $1 or reference = $1 limit 1", [id]);
    if (!rows[0]) return null;
    const [notes, events] = await Promise.all([
      this.pool.query("select * from application_review_notes where application_id = $1 order by created_at desc", [rows[0].id]),
      this.pool.query("select * from application_events where application_id = $1 order by created_at asc", [rows[0].id]),
    ]);
    return {
      ...application(rows[0]),
      data: rows[0].application_data ?? {},
      document: rows[0].document_key ? { key: rows[0].document_key, name: rows[0].document_name, type: rows[0].document_type, size: rows[0].document_size } : null,
      notes: notes.rows.map(row => ({ id: row.id, body: row.body, authorName: row.author_name, createdAt: new Date(row.created_at).toISOString() })),
      timeline: events.rows.map(row => ({ id: row.id, eventType: row.event_type, description: row.description, actorName: row.actor_name, createdAt: new Date(row.created_at).toISOString() })),
    };
  }

  async createApplication(input: NewApplication) {
    const { rows } = await this.pool.query(
      `insert into membership_applications (reference, applicant_type, applicant_name, email, phone, location, status, submitted_at, application_data, document_key, document_name, document_type, document_size)
       values ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12)
       on conflict (reference) do update set application_data = excluded.application_data
       returning id, reference`,
      [input.reference, input.applicantType, input.applicantName, input.email, input.phone, input.location, input.submittedAt, JSON.stringify(input.data), input.document?.key ?? null, input.document?.name ?? null, input.document?.type ?? null, input.document?.size ?? null],
    );
    await this.pool.query("insert into application_events (application_id, event_type, description) values ($1,'submitted','Application submitted') on conflict do nothing", [rows[0].id]);
    return rows[0];
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus, actorId: string, actorName: string) {
    const { rows } = await this.pool.query("update membership_applications set status=$2, reviewed_at=now(), reviewed_by=$3, updated_at=now() where id=$1 returning id", [id, status, actorId]);
    if (!rows[0]) throw new Error("Application not found");
    await this.pool.query("insert into application_events (application_id,event_type,description,actor_id,actor_name) values ($1,'status_changed',$2,$3,$4)", [id, `Status changed to ${status.replaceAll("_", " ")}`, actorId, actorName]);
  }

  async addReviewNote(id: string, body: string, actorId: string, actorName: string) {
    await this.pool.query("insert into application_review_notes (application_id,body,author_id,author_name) values ($1,$2,$3,$4)", [id, body, actorId, actorName]);
    await this.pool.query("insert into application_events (application_id,event_type,description,actor_id,actor_name) values ($1,'note_added','Internal review note added',$2,$3)", [id, actorId, actorName]);
  }

  async approveApplication(id: string, actorId: string, actorName: string) {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await client.query("select * from membership_applications where id=$1 for update", [id]);
      const row = result.rows[0];
      if (!row) throw new Error("Application not found");
      const existing = await client.query("select * from members where source_application_id=$1", [id]);
      let created: Member;
      if (existing.rows[0]) created = member(existing.rows[0]);
      else {
        const number = await nextMemberNumber(client);
        const inserted = await client.query("insert into members (member_number,member_type,display_name,email,phone,location,status,source_application_id,created_by) values ($1,$2,$3,$4,$5,$6,'active',$7,$8) returning *", [number, row.applicant_type, row.applicant_name, row.email, row.phone, row.location, id, actorId]);
        created = member(inserted.rows[0]);
      }
      await client.query("update membership_applications set status='approved',reviewed_at=now(),reviewed_by=$2,updated_at=now() where id=$1", [id, actorId]);
      await client.query("insert into application_events (application_id,event_type,description,actor_id,actor_name) values ($1,'approved','Application approved and member record created',$2,$3)", [id, actorId, actorName]);
      await client.query("commit");
      return created;
    } catch (error) { await client.query("rollback"); throw error; }
    finally { client.release(); }
  }

  async listMembers(query = "") {
    const values = query ? [`%${query}%`] : [];
    const where = query ? "where display_name ilike $1 or email ilike $1 or phone ilike $1 or member_number ilike $1" : "";
    const { rows } = await this.pool.query(`select * from members ${where} order by admitted_at desc limit 1000`, values);
    return rows.map(member);
  }

  async createMember(input: NewMember, actorId: string) {
    const number = input.memberNumber || await nextMemberNumber(this.pool);
    const { rows } = await this.pool.query("insert into members (member_number,member_type,display_name,email,phone,location,status,admitted_at,created_by) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *", [number, input.memberType, input.displayName, input.email, input.phone, input.location, input.status, input.admittedAt ?? new Date().toISOString(), actorId]);
    return member(rows[0]);
  }
}
