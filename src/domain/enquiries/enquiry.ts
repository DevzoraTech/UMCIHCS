export const profiles = ["Grower / agricultural professional", "Researcher / academic", "Individual professional", "Business / enterprise", "Institution / partner"] as const;
export const interests = ["Research & knowledge", "Innovation & enterprise", "Advocacy & collaboration", "General membership"] as const;
export type Enquiry = { kind: "membership" | "contact"; name: string; email: string; phone: string; location: string; organisation: string; profile: string; interest: string; message: string; consent: true };
export type ValidationResult = { ok: true; value: Enquiry } | { ok: false; error: string };
export function validateEnquiry(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {ok:false,error:"Please complete the form."};
  const data = input as Record<string, unknown>;
  const required = ["name", "email", "message"];
  for (const field of required) if (typeof data[field] !== "string" || !data[field].trim()) return {ok:false,error:`Please enter your ${field}.`};
  if (data.kind !== "membership" && data.kind !== "contact") return {ok:false,error:"Please choose a valid enquiry type."};
  if (data.consent !== true) return {ok:false,error:"Please consent to being contacted about this enquiry."};
  const limits: Record<string, number> = { name:120,email:254,phone:40,location:120,organisation:160,profile:100,interest:100,message:4000 };
  const values: Record<string,string> = {};
  for (const [field,limit] of Object.entries(limits)) {
    if(data[field] !== undefined && typeof data[field] !== "string") return {ok:false,error:"Please check the form fields."};
    const value = (data[field] as string | undefined)?.trim() ?? "";
    if(value.length > limit || (field !== "message" && /[\r\n\u0000]/.test(value))) return {ok:false,error:`Please check your ${field}; the value is too long or invalid.`};
    values[field]=value;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return {ok:false,error:"Please enter a valid email address."};
  if(values.message.length<20) return {ok:false,error:"Please include at least 20 characters in your message."};
  if(data.kind === "membership") {
    if (!values.phone || !values.location) return {ok:false,error:"Please add your phone number and district or location."};
    if (!profiles.includes(values.profile as typeof profiles[number]) || !interests.includes(values.interest as typeof interests[number])) return {ok:false,error:"Please select your profile and area of interest."};
  }
  return {ok:true,value:{kind:data.kind,name:values.name,email:values.email,phone:values.phone,location:values.location,organisation:values.organisation,profile:values.profile,interest:values.interest,message:values.message,consent:true}};
}
export function enquiryText(enquiry: Enquiry): string {
  return [`UMCIHCS ${enquiry.kind === "membership" ? "membership application" : "contact enquiry"}`,"",`Name: ${enquiry.name}`,`Email: ${enquiry.email}`,`Phone: ${enquiry.phone || "Not provided"}`,`Location: ${enquiry.location || "Not provided"}`,`Organisation: ${enquiry.organisation || "Not provided"}`,`Profile: ${enquiry.profile || "Not provided"}`,`Interest: ${enquiry.interest || "Not provided"}`,"Message:",enquiry.message,"","Consent: The sender agrees to be contacted about this enquiry."].join("\n");
}
