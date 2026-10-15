import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/modules/identity/application/api-authorization";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";

const statusInput = z.object({ status: z.enum(["pending", "under_review", "clarification_requested", "approved", "rejected"]) });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeApi(request, "applications:view");
  if ("response" in authorization) return authorization.response;
  const item = await membershipRepository().getApplication((await params).id);
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Application not found." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "The request body is invalid." }, { status: 400 }); }
  const parsed = statusInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid application status." }, { status: 400 });
  const permission = parsed.data.status === "approved" || parsed.data.status === "rejected" ? "applications:decide" : "applications:review";
  const authorization = await authorizeApi(request, permission);
  if ("response" in authorization) return authorization.response;
  const id = (await params).id;
  if (parsed.data.status === "approved") await membershipRepository().approveApplication(id, authorization.actor.id, authorization.actor.name);
  else await membershipRepository().updateApplicationStatus(id, parsed.data.status, authorization.actor.id, authorization.actor.name);
  return NextResponse.json({ ok: true });
}
