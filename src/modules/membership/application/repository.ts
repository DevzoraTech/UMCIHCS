import type { ApplicationFilters, ApplicationStats, ApplicationStatus, Member, MembershipApplicationDetail, MembershipApplicationSummary, NewApplication, NewMember } from "../domain/models";

export interface MembershipRepository {
  applicationStats(): Promise<ApplicationStats>;
  listApplications(filters?: ApplicationFilters): Promise<MembershipApplicationSummary[]>;
  getApplication(id: string): Promise<MembershipApplicationDetail | null>;
  createApplication(application: NewApplication): Promise<{ id: string; reference: string }>;
  updateApplicationStatus(id: string, status: ApplicationStatus, actorId: string, actorName: string): Promise<void>;
  addReviewNote(id: string, body: string, actorId: string, actorName: string): Promise<void>;
  approveApplication(id: string, actorId: string, actorName: string): Promise<Member>;
  listMembers(query?: string): Promise<Member[]>;
  createMember(member: NewMember, actorId: string): Promise<Member>;
}
