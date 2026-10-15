import test from "node:test";
import assert from "node:assert/strict";
import { hasPermission, isPortalRole, roleLabel } from "../src/modules/identity/application/permissions.ts";

const actor = role => ({ id: role, name: role, email: `${role}@example.invalid`, role });

test("recognises only configured portal roles", () => {
  for (const role of ["super_admin","membership_admin","reviewer","viewer"]) assert.equal(isPortalRole(role), true);
  assert.equal(isPortalRole("admin"), false);
  assert.equal(isPortalRole(null), false);
});

test("super administrator has every portal permission", () => {
  for (const permission of ["dashboard:view","applications:view","applications:review","applications:decide","members:view","members:create","members:export","settings:view","users:manage"]) assert.equal(hasPermission(actor("super_admin"), permission), true);
  assert.equal(roleLabel("super_admin"), "Super Administrator");
});

test("reviewers and viewers cannot approve applications or create members", () => {
  assert.equal(hasPermission(actor("reviewer"), "applications:review"), true);
  assert.equal(hasPermission(actor("reviewer"), "applications:decide"), false);
  assert.equal(hasPermission(actor("reviewer"), "members:create"), false);
  assert.equal(hasPermission(actor("viewer"), "applications:review"), false);
  assert.equal(hasPermission(actor("viewer"), "applications:view"), true);
});
