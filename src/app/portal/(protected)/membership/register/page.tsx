import { redirect } from "next/navigation";
import { authorizedPortalActor } from "@/modules/identity/application/session";
import { MemberRegisterForm } from "@/presentation/components/portal/member-register-form";
export default async function RegisterMemberPage(){if(!await authorizedPortalActor("members:create"))redirect("/portal/membership/members");return <div className="portal-narrow"><header className="portal-page-head"><div><p>Membership</p><h1>Register a member</h1><span>Add an already approved individual or organisation to the register.</span></div></header><MemberRegisterForm/></div>}
