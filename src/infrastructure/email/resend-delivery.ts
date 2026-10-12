import type { EnquiryDelivery } from "@/application/enquiries/submit-enquiry";
import { enquiryText, type Enquiry } from "@/domain/enquiries/enquiry";
import { site } from "@/config/site";
export function emailDeliveryConfigured() { return Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_FROM_EMAIL); }
export class ResendDelivery implements EnquiryDelivery {
  async send(enquiry: Enquiry, idempotencyKey: string) {
    if(!emailDeliveryConfigured()) throw new Error("Email service unavailable");
    const response = await fetch("https://api.resend.com/emails", {
      method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":idempotencyKey},
      body:JSON.stringify({from:process.env.ENQUIRY_FROM_EMAIL,to:[process.env.ENQUIRY_TO_EMAIL || site.email],reply_to:enquiry.email,subject:`UMCIHCS ${enquiry.kind === "membership" ? "membership application" : "enquiry"} — ${enquiry.name}`,text:enquiryText(enquiry)}),
      signal:AbortSignal.timeout(12000),
    });
    if(!response.ok) throw new Error("Email delivery failed");
  }
}
