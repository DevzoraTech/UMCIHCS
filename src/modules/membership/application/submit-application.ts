import { uploadPortalDocument } from "@/modules/shared/infrastructure/portal-storage-client";
import { validateMembershipApplication } from "@/domain/membership/application";
import type { ApplicationDocument, NewApplication } from "../domain/models";
import { membershipRepository } from "../infrastructure/repository-factory";

const checkboxNames = ["authorization_declaration", "declaration_accurate", "declaration_bylaws", "declaration_review", "declaration_privacy", "newsletter_consent"];

export function applicationDataFromForm(form: FormData) {
  const data: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (key === "registration_certificate" || key === "form-name" || key === "subject") continue;
    data[key] = typeof value === "string" ? value.trim() : value;
  }
  data.areas_of_interest = form.getAll("areas_of_interest").filter((value): value is string => typeof value === "string");
  for (const name of checkboxNames) data[name] = form.get(name) === "on" || form.get(name) === "true";
  return data;
}

async function storeDocument(reference: string, file: File): Promise<ApplicationDocument | null> {
  if (!file.size) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error("The registration certificate must be 5 MB or smaller.");
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) throw new Error("The registration certificate must be a PDF, JPG or PNG file.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
  const key = `membership/${reference}/${crypto.randomUUID()}-${safeName}`;
  await uploadPortalDocument(key,file,{name:file.name,type:file.type,reference});
  return { key, name: file.name, type: file.type, size: file.size };
}

export async function submitMembershipApplication(form: FormData) {
  if (String(form.get("website") ?? "")) return { accepted: true, reference: "" };
  const data = applicationDataFromForm(form);
  const validation = validateMembershipApplication(data);
  if (!validation.ok) throw new Error(validation.error);
  const applicantType = data.applicant_type === "organization" ? "organization" : "individual";
  const reference = String(data.application_reference || `UMCIHCS-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,8).toUpperCase()}`);
  const file = form.get("registration_certificate");
  const document = file instanceof File ? await storeDocument(reference, file) : null;
  const input: NewApplication = {
    reference,
    applicantType,
    applicantName: String(applicantType === "individual" ? data.full_name : data.organization_name),
    email: String(applicantType === "individual" ? data.email : data.representative_email),
    phone: String(applicantType === "individual" ? data.phone_primary : data.representative_phone),
    location: String(applicantType === "individual" ? data.district_city : data.operations_location),
    submittedAt: String(data.submission_date || new Date().toISOString()),
    data,
    document,
  };
  return { accepted: true, ...(await membershipRepository().createApplication(input)) };
}
