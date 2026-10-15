import { redirect } from "next/navigation";
import { currentPortalActor } from "@/modules/identity/application/session";
import { PortalShell } from "@/presentation/components/portal/portal-shell";

export default async function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
  const actor = await currentPortalActor();
  if (!actor) redirect("/portal/login");
  return <PortalShell actor={actor}>{children}</PortalShell>;
}
