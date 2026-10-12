export const applicantTypes = ["individual", "organization"] as const;
export const organizationTypes = [
  "Limited Liability Company",
  "Cooperative Society",
  "Research / Academic Institution",
  "Non-Governmental Organization",
  "Other Registered Legal Entity",
] as const;
export const sectorInterests = [
  "Medical Cannabis Research and Development",
  "Industrial Hemp Cultivation and Production",
  "Agriculture and Farming",
  "Pharmaceuticals and Medicine",
  "Processing and Manufacturing",
  "Investment and Business Development",
  "Trade and Marketing",
  "Policy, Legal and Regulatory Affairs",
  "Education and Capacity Building",
  "Other",
] as const;
export const sectorInvolvement = ["Currently Active", "Planning to Enter the Sector", "Research / Academic Interest", "General Interest"] as const;
export const discoverySources = ["Existing Member", "Friend / Colleague", "Social Media", "Cooperative Website", "Meeting / Event", "Other"] as const;

type ApplicantType = typeof applicantTypes[number];
type Result = { ok: true } | { ok: false; error: string; field?: string };

function text(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "string" ? data[key].trim() : "";
}

function required(data: Record<string, unknown>, fields: Array<[string, string]>): Result {
  for (const [field, label] of fields) if (!text(data, field)) return { ok: false, error: `Please complete ${label}.`, field };
  return { ok: true };
}

export function validateMembershipApplication(data: Record<string, unknown>): Result {
  const applicantType = text(data, "applicant_type") as ApplicantType;
  if (!applicantTypes.includes(applicantType)) return { ok: false, error: "Please choose the type of applicant.", field: "applicant_type" };

  const individualFields: Array<[string, string]> = [
    ["full_name", "your full name"], ["date_of_birth", "your date of birth"], ["nationality", "your nationality"],
    ["occupation", "your occupation or profession"], ["phone_primary", "your primary phone number"], ["email", "your email address"],
    ["country_residence", "your country of residence"], ["district_city", "your district or city"], ["physical_address", "your physical address"],
  ];
  const organizationFields: Array<[string, string]> = [
    ["organization_name", "the registered organization name"], ["organization_type", "the organization type"],
    ["registration_number", "the registration number"], ["country_registration", "the country of registration"],
    ["registration_year", "the year of registration"], ["business_activities", "the primary business activities"],
    ["registered_office_address", "the registered office address"], ["operations_location", "the location of operations"],
    ["representative_name", "the representative’s full name"], ["representative_position", "the representative’s position"],
    ["representative_phone", "the representative’s phone number"], ["representative_email", "the representative’s email address"],
  ];
  const categoryResult = required(data, applicantType === "individual" ? individualFields : organizationFields);
  if (!categoryResult.ok) return categoryResult;

  const email = text(data, applicantType === "individual" ? "email" : "representative_email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address.", field: applicantType === "individual" ? "email" : "representative_email" };
  const phoneFields = applicantType === "individual" ? ["phone_primary", "phone_alternative"] : ["representative_phone", "representative_alt_phone"];
  for (const field of phoneFields) {
    const phone = text(data, field);
    if (phone && !/^\+?[0-9\s().-]{7,24}$/.test(phone)) return { ok: false, error: "Please enter a valid international phone number.", field };
  }
  if (applicantType === "organization") {
    if (!organizationTypes.includes(text(data, "organization_type") as typeof organizationTypes[number])) return { ok: false, error: "Please select a valid organization type.", field: "organization_type" };
    const year = Number(text(data, "registration_year"));
    if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()) return { ok: false, error: "Please enter a valid registration year.", field: "registration_year" };
    if (data.authorization_declaration !== true) return { ok: false, error: "The authorized representative must confirm their authority to apply.", field: "authorization_declaration" };
  }

  const interests = Array.isArray(data.areas_of_interest) ? data.areas_of_interest.filter((value): value is string => typeof value === "string") : [];
  if (!interests.length || interests.some((value) => !sectorInterests.includes(value as typeof sectorInterests[number]))) return { ok: false, error: "Please select at least one primary area of interest.", field: "areas_of_interest" };
  if (interests.includes("Other") && !text(data, "area_interest_other")) return { ok: false, error: "Please specify your other area of interest.", field: "area_interest_other" };
  if (!sectorInvolvement.includes(text(data, "sector_involvement") as typeof sectorInvolvement[number])) return { ok: false, error: "Please select your current involvement in the sector.", field: "sector_involvement" };
  if (!discoverySources.includes(text(data, "heard_about") as typeof discoverySources[number])) return { ok: false, error: "Please tell us how you learned about UMCIHCS.", field: "heard_about" };
  if (text(data, "heard_about") === "Other" && !text(data, "heard_about_other")) return { ok: false, error: "Please specify how you learned about UMCIHCS.", field: "heard_about_other" };
  if (text(data, "join_reason").length < 20) return { ok: false, error: "Please tell us why you wish to join in at least 20 characters.", field: "join_reason" };
  for (const field of ["declaration_accurate", "declaration_bylaws", "declaration_review", "declaration_privacy"]) {
    if (data[field] !== true) return { ok: false, error: "Please accept all mandatory declarations before submitting.", field };
  }
  return { ok: true };
}
