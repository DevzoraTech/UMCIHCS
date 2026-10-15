import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authorizedPortalActor } from "@/modules/identity/application/session";
import { hasPermission } from "@/modules/identity/application/permissions";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";
import { ApplicantBadge } from "@/presentation/components/portal/status-badge";
import { EmailReplyForm } from "@/presentation/components/portal/email-reply-form";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = { full_name: "Full name", date_of_birth: "Date of birth", gender: "Gender", nationality: "Nationality", occupation: "Occupation / profession", phone_primary: "Primary phone", email: "Email address", country_residence: "Country of residence", district_city: "District / city", physical_address: "Physical address", organization_name: "Registered name", organization_type: "Organisation type", registration_number: "Registration number", country_registration: "Country of registration", registration_year: "Year of registration", business_activities: "Primary business activities", registered_office_address: "Registered office address", operations_location: "Location of operations", representative_name: "Representative", representative_position: "Position / designation", representative_phone: "Contact phone", representative_email: "Contact email", areas_of_interest: "Areas of interest", sector_involvement: "Current involvement", sector_experience: "Experience or expertise", join_reason: "Reason for joining", membership_benefits: "Expected membership benefits", cooperative_contribution: "Proposed contribution" };
const individualFields = ["full_name", "date_of_birth", "gender", "nationality", "occupation", "phone_primary", "email", "country_residence", "district_city", "physical_address"];
const organisationFields = ["organization_name", "organization_type", "registration_number", "country_registration", "registration_year", "business_activities", "registered_office_address", "operations_location", "representative_name", "representative_position", "representative_phone", "representative_email"];
const applicationFields = ["areas_of_interest", "sector_involvement", "sector_experience", "join_reason", "membership_benefits", "cooperative_contribution"];
function text(value: unknown) { return Array.isArray(value) ? value.join(", ") : String(value ?? ""); }
function DetailSection({ title, fields, data }: { title: string; fields: string[]; data: Record<string, unknown> }) { const shown = fields.filter(field => text(data[field]).trim()); if (!shown.length) return null; return <section className="portal-detail-section"><h2>{title}</h2><dl>{shown.map(field => <div key={field}><dt>{labels[field] ?? field.replaceAll("_", " ")}</dt><dd>{text(data[field])}</dd></div>)}</dl></section>; }

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizedPortalActor("members:view"); if (!actor) redirect("/portal/login");
  const repository = membershipRepository(); const member = await repository.getMember((await params).id); if (!member) notFound();
  const application = await repository.getApplication(member.id);
  const date = (value: string) => new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return <div className="portal-member-detail">
    <header className="portal-detail-command-bar"><Link className="portal-back" href="/portal/membership/members">← Back to Members</Link></header>
    <section className="portal-summary-strip portal-reference-summary portal-member-summary"><article><i>♙</i><div><span>Member number</span><strong>{member.memberNumber}</strong></div></article><article><i>♟</i><div><span>Member type</span><ApplicantBadge type={member.memberType} /></div></article><article><i>◉</i><div><span>Status</span><strong>{member.status}</strong></div></article><article><i>▣</i><div><span>Admitted on</span><strong>{new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" }).format(new Date(member.admittedAt))}</strong></div></article></section>
    <div className="portal-detail-grid"><div>
      <section className="portal-detail-section"><h2>Member profile</h2><dl><div><dt>Name</dt><dd>{member.displayName}</dd></div><div><dt>Email</dt><dd>{member.email}</dd></div><div><dt>Phone</dt><dd>{member.phone || "Not provided"}</dd></div><div><dt>Location</dt><dd>{member.location || "Not provided"}</dd></div></dl></section>
      {application ? <><DetailSection title={member.memberType === "individual" ? "Original applicant information" : "Organisation information"} fields={member.memberType === "individual" ? individualFields : organisationFields} data={application.data} /><DetailSection title="Membership interest" fields={applicationFields} data={application.data} /></> : <section className="portal-detail-section"><h2>Application record</h2><p className="portal-section-message">This member was registered directly in the portal, so there is no linked public application.</p></section>}
    </div><aside>
      <section className="portal-detail-section portal-profile"><h2>Member profile</h2><div><span>{member.memberType === "organization" ? "⌂" : member.displayName.slice(0, 1).toUpperCase()}</span><div><strong>{member.displayName}</strong><ApplicantBadge type={member.memberType} /></div></div><p>{member.email}<br />{member.phone || "No phone provided"}<br />{member.location || "No location provided"}</p></section>
      {hasPermission(actor, "members:create") && <section className="portal-detail-section"><h2>Email member</h2><EmailReplyForm endpoint={`/api/portal/members/${member.id}/reply`} recipient={member.email} /><div className="portal-notes">{(member.messages ?? []).map(message => <article key={message.id}><strong>{message.authorName} → {message.recipientEmail}</strong><span>{date(message.createdAt)}</span><p>{message.body}</p></article>)}{!(member.messages ?? []).length && <p>No emails have been sent from the portal.</p>}</div></section>}
    </aside></div>
  </div>;
}
