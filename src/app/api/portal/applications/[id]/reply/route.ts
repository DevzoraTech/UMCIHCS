import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/modules/identity/application/api-authorization";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";
import { sendEmail } from "@/modules/notifications/infrastructure/email";

const input = z.object({ body: z.string().trim().min(3).max(4000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeApi(request, "applications:review");
  if ("response" in authorization) return authorization.response;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a message between 3 and 4,000 characters." }, { status: 400 });
  const repository = membershipRepository();
  const application = await repository.getApplication((await params).id);
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  const delivery = await sendEmail({
    to: application.email,
    subject: `UMCIHCS membership application — ${application.reference}`,
    text: `Dear ${application.applicantName},\n\n${parsed.data.body}\n\nKind regards,\n${authorization.actor.name}\nUMCIHCS Ltd`,
    senderName: authorization.actor.name,
    replyTo: authorization.actor.email,
  });
  if (!delivery.delivered) return NextResponse.json({ error: "Email delivery is not configured or is temporarily unavailable. The message was not sent." }, { status: 503 });
  const createdAt = new Date().toISOString();
  await repository.addApplicationMessage(application.id, { id: crypto.randomUUID(), body: parsed.data.body, authorName: authorization.actor.name, authorEmail: authorization.actor.email, recipientEmail: application.email, createdAt });
  return NextResponse.json({ ok: true }, { status: 201 });
}
