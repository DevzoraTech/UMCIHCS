import { NextResponse } from "next/server";
import { submitMembershipApplication } from "@/modules/membership/application/submit-application";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const result = await submitMembershipApplication(form);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit the application.";
    const unavailable = message.includes("not configured");
    return NextResponse.json({ error: message }, { status: unavailable ? 503 : 400 });
  }
}
