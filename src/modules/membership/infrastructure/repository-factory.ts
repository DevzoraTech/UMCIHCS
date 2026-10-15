import type { MembershipRepository } from "../application/repository";
import { DemoMembershipRepository } from "./demo-membership-repository";
import { PostgresMembershipRepository } from "./postgres-membership-repository";

let repository: MembershipRepository | undefined;
export function membershipRepository() {
  if (!repository) repository = process.env.PORTAL_DEMO_MODE === "true" ? new DemoMembershipRepository() : new PostgresMembershipRepository();
  return repository;
}
