import { ApplicationList } from "@/presentation/components/portal/application-list";
import { applicationStatuses, type ApplicantType, type ApplicationStatus } from "@/modules/membership/domain/models";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";
import { authorizedPortalActor } from "@/modules/identity/application/session";
import { hasPermission } from "@/modules/identity/application/permissions";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";
export default async function ApplicationsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const actor=await authorizedPortalActor("applications:view");if(!actor)redirect("/portal/login");const search=await searchParams;const statusValue=typeof search.status==="string"?search.status:"";const typeValue=typeof search.type==="string"?search.type:"";const status=applicationStatuses.includes(statusValue as ApplicationStatus)?statusValue as ApplicationStatus:undefined;const applicantType=typeValue==="individual"||typeValue==="organization"?typeValue as ApplicantType:undefined;const repository=membershipRepository();const[items,stats]=await Promise.all([repository.listApplications({query:typeof search.q==="string"?search.q:undefined,status,applicantType}),repository.applicationStats()]);return <ApplicationList items={items} stats={stats} canCreateMember={hasPermission(actor,"members:create")}/>}
