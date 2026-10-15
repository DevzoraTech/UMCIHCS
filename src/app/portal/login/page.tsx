import Image from "next/image";
import { redirect } from "next/navigation";
import { currentPortalActor } from "@/modules/identity/application/session";
import { PortalLoginForm } from "@/presentation/components/portal/login-form";

export default async function PortalLoginPage(){if(await currentPortalActor())redirect("/portal/dashboard");return <div className="portal-login"><section className="portal-login-brand"><div><Image src="/images/umcihcs-badge.jpg" alt="UMCIHCS" width={78} height={78}/><strong>UMCIHCS</strong><span>Membership administration</span></div><blockquote>Responsible growth.<br/>Shared prosperity.</blockquote><p>Uganda Medical Cannabis and Industrial Hemp Cooperative Society</p></section><section className="portal-login-panel"><div><p className="portal-kicker">Secure administration portal</p><h1>Welcome back.</h1><p>Sign in to review applications and manage the cooperative membership register.</p><PortalLoginForm/><small>Access is limited to authorised UMCIHCS administrators.</small></div></section></div>}
