import { NextResponse } from "next/server";
import { authorizeApi } from "@/modules/identity/application/api-authorization";
import { applicationStatuses, type ApplicantType, type ApplicationStatus } from "@/modules/membership/domain/models";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";

export async function GET(request: Request) {
  const authorization = await authorizeApi(request, "applications:view");
  if ("response" in authorization) return authorization.response;
  const url = new URL(request.url);
  const statusValue = url.searchParams.get("status");
  const typeValue = url.searchParams.get("type");
  const status = applicationStatuses.includes(statusValue as ApplicationStatus) ? statusValue as ApplicationStatus : undefined;
  const applicantType = typeValue === "individual" || typeValue === "organization" ? typeValue as ApplicantType : undefined;
  const repository = membershipRepository();
  const [items, stats] = await Promise.all([repository.listApplications({ query: url.searchParams.get("q") ?? undefined, status, applicantType }), repository.applicationStats()]);
  return NextResponse.json({ items, stats });
}
