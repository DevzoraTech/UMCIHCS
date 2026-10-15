import type { ApplicantType, ApplicationStatus } from "@/modules/membership/domain/models";
export function StatusBadge({status}:{status:ApplicationStatus}){return <span className={`portal-badge status-${status}`}><i/>{status.replaceAll("_"," ")}</span>}
export function ApplicantBadge({type}:{type:ApplicantType}){return <span className={`portal-badge type-${type}`}>{type==="individual"?"Individual":"Organisation"}</span>}
