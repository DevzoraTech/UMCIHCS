import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/modules/identity/application/api-authorization";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";

const noteInput = z.object({ body: z.string().trim().min(3).max(2000) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeApi(request, "applications:review");
  if ("response" in authorization) return authorization.response;
  const parsed = noteInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Write a review note between 3 and 2,000 characters." }, { status: 400 });
  await membershipRepository().addReviewNote((await params).id, parsed.data.body, authorization.actor.id, authorization.actor.name);
  return NextResponse.json({ ok: true }, { status: 201 });
}
