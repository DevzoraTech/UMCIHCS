import { NextResponse } from "next/server";
import { authorizedPortalActor } from "./session";
import type { PortalPermission } from "./permissions";

export async function authorizeApi(request: Request, permission: PortalPermission) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    let requestHost = "";
    try { requestHost = origin ? new URL(origin).host : ""; } catch { requestHost = ""; }
    if (!requestHost || !host || requestHost !== host) return { response: NextResponse.json({ error: "Invalid request origin." }, { status: 403 }) } as const;
  }
  const actor = await authorizedPortalActor(permission);
  if (!actor) return { response: NextResponse.json({ error: "You are not authorized to perform this action." }, { status: 403 }) } as const;
  return { actor } as const;
}
