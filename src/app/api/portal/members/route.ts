import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/modules/identity/application/api-authorization";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";

const memberInput = z.object({ memberType:z.enum(["individual","organization"]),displayName:z.string().trim().min(2).max(180),email:z.string().email().max(254),phone:z.string().trim().max(40).default(""),location:z.string().trim().max(180).default(""),status:z.enum(["active","inactive"]).default("active") });
export async function GET(request: Request) {
  const authorization = await authorizeApi(request, "members:view");
  if ("response" in authorization) return authorization.response;
  const items = await membershipRepository().listMembers(new URL(request.url).searchParams.get("q") ?? "");
  return NextResponse.json({ items });
}
export async function POST(request: Request) {
  const authorization = await authorizeApi(request, "members:create");
  if ("response" in authorization) return authorization.response;
  const parsed = memberInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the required member details." }, { status: 400 });
  const item = await membershipRepository().createMember(parsed.data, authorization.actor.id);
  return NextResponse.json({ item }, { status: 201 });
}
