export const applicationStatuses = ["pending", "under_review", "clarification_requested", "approved", "rejected"] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type ApplicantType = "individual" | "organization";

export type MembershipApplicationSummary = {
  id: string;
  reference: string;
  applicantType: ApplicantType;
  applicantName: string;
  email: string;
  phone: string;
  location: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
};

export type ReviewNote = { id: string; body: string; authorName: string; createdAt: string };
export type ApplicationEvent = { id: string; eventType: string; description: string; actorName: string | null; createdAt: string };
export type ApplicationDocument = { key: string; name: string; type: string; size: number };

export type MembershipApplicationDetail = MembershipApplicationSummary & {
  data: Record<string, unknown>;
  document: ApplicationDocument | null;
  notes: ReviewNote[];
  timeline: ApplicationEvent[];
};

export type Member = {
  id: string;
  memberNumber: string;
  memberType: ApplicantType;
  displayName: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive";
  admittedAt: string;
};

export type ApplicationFilters = { query?: string; status?: ApplicationStatus; applicantType?: ApplicantType };
export type ApplicationStats = Record<ApplicationStatus | "all", number>;
export type NewApplication = Omit<MembershipApplicationSummary, "id" | "status" | "reviewedAt"> & { data: Record<string, unknown>; document: ApplicationDocument | null };
export type NewMember = Omit<Member, "id" | "memberNumber" | "admittedAt"> & { memberNumber?: string; admittedAt?: string };
