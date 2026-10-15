import { headers } from "next/headers";
import { auth } from "../infrastructure/auth";
import { hasPermission, isPortalRole, type PortalActor, type PortalPermission } from "./permissions";

const demoActor: PortalActor = { id: "local-super-admin", name: "Portal Preview", email: "preview@localhost", role: "super_admin" };

export async function currentPortalActor(): Promise<PortalActor | null> {
  if (process.env.PORTAL_DEMO_MODE === "true") return demoActor;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isPortalRole(session.user.role)) return null;
    return { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role };
  } catch {
    return null;
  }
}

export async function authorizedPortalActor(permission: PortalPermission) {
  const actor = await currentPortalActor();
  return actor && hasPermission(actor, permission) ? actor : null;
}
