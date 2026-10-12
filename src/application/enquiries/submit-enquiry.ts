import type { Enquiry } from "@/domain/enquiries/enquiry";
export interface EnquiryDelivery { send(enquiry: Enquiry, idempotencyKey: string): Promise<void>; }
export async function submitEnquiry(enquiry: Enquiry, idempotencyKey: string, delivery: EnquiryDelivery): Promise<void> {
  await delivery.send(enquiry, idempotencyKey);
}
