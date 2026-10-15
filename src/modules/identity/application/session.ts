import { cookies } from "next/headers";
import { actorFromToken, cookieName } from "../infrastructure/portal-auth";
import { hasPermission, isPortalRole, type PortalActor, type PortalPermission } from "./permissions";

const demoActor: PortalActor = { id: "local-super-admin", name: "Portal Preview", email: "preview@localhost", role: "super_admin" };

export async function currentPortalActor(): Promise<PortalActor | null> {
  if (process.env.PORTAL_DEMO_MODE === "true") return demoActor;
  try {
    const actor = await actorFromToken((await cookies()).get(cookieName)?.value);
    if (!actor || !isPortalRole(actor.role)) return null;
    return actor;
  } catch {
    return null;
  }
}

export async function authorizedPortalActor(permission: PortalPermission) {
  const actor = await currentPortalActor();
  return actor && hasPermission(actor, permission) ? actor : null;
}
