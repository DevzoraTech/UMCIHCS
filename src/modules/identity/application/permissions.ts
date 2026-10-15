export const portalRoles = ["super_admin", "membership_admin", "reviewer", "viewer"] as const;
export type PortalRole = (typeof portalRoles)[number];

export const portalPermissions = [
  "dashboard:view",
  "applications:view",
  "applications:review",
  "applications:decide",
  "members:view",
  "members:create",
  "members:export",
  "settings:view",
  "users:manage",
] as const;
export type PortalPermission = (typeof portalPermissions)[number];

const grants: Record<PortalRole, readonly PortalPermission[]> = {
  super_admin: portalPermissions,
  membership_admin: ["dashboard:view", "applications:view", "applications:review", "applications:decide", "members:view", "members:create", "members:export"],
  reviewer: ["dashboard:view", "applications:view", "applications:review", "members:view"],
  viewer: ["dashboard:view", "applications:view", "members:view"],
};

export type PortalActor = { id: string; name: string; email: string; role: PortalRole };

export function isPortalRole(value: unknown): value is PortalRole {
  return typeof value === "string" && portalRoles.includes(value as PortalRole);
}

export function hasPermission(actor: PortalActor, permission: PortalPermission) {
  return grants[actor.role].includes(permission);
}

export function roleLabel(role: PortalRole) {
  return ({ super_admin: "Super Administrator", membership_admin: "Membership Administrator", reviewer: "Application Reviewer", viewer: "Read-only User" } as const)[role];
}
