"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ApplicationStats, MembershipApplicationSummary } from "@/modules/membership/domain/models";
import { ApplicantBadge, StatusBadge } from "./status-badge";

const statusCards=[
  ["all","All applications","Every submitted request","tone-green"],
  ["pending","Pending","Awaiting initial review","tone-gold"],
  ["under_review","Under review","Assessment in progress","tone-blue"],
  ["approved","Approved","Admitted to membership","tone-mint"],
  ["rejected","Rejected","Not approved","tone-red"],
] as const;

export function ApplicationList({items,stats,canCreateMember}:{items:MembershipApplicationSummary[];stats:ApplicationStats;canCreateMember:boolean}){
  const router=useRouter();const params=useSearchParams();const[query,setQuery]=useState(params.get("q")??"");const active=params.get("status")??"all";
  function navigate(updates:Record<string,string>){const next=new URLSearchParams(params);Object.entries(updates).forEach(([key,value])=>value?next.set(key,value):next.delete(key));router.push(`/portal/membership/applications?${next}`);}
  function search(event:FormEvent){event.preventDefault();navigate({q:query.trim()});}
  return <><section className="portal-stats">{statusCards.map(([key,label,caption,tone])=><button key={key} className={`${tone} ${active===key?"is-active":""}`} onClick={()=>navigate({status:key==="all"?"":key})}><span>{label}</span><strong>{stats[key]}</strong><small>{caption}</small></button>)}</section><section className="portal-panel portal-table-panel"><div className="portal-toolbar"><form onSubmit={search} className="portal-search"><span>⌕</span><input aria-label="Search applications" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, email, phone or reference"/><button>Search</button></form><select aria-label="Applicant type" value={params.get("type")??""} onChange={e=>navigate({type:e.target.value})}><option value="">All applicant types</option><option value="individual">Individuals</option><option value="organization">Organisations</option></select>{canCreateMember&&<Link className="portal-primary-button" href="/portal/membership/register">+ Register member</Link>}</div><div className="portal-tabs"><button className={!params.get("status")?"is-active":""} onClick={()=>navigate({status:""})}>All <span>{stats.all}</span></button><button className={active==="pending"?"is-active":""} onClick={()=>navigate({status:"pending"})}>Pending <span>{stats.pending}</span></button><button className={active==="under_review"?"is-active":""} onClick={()=>navigate({status:"under_review"})}>Under review <span>{stats.under_review}</span></button><button className={active==="approved"?"is-active":""} onClick={()=>navigate({status:"approved"})}>Approved <span>{stats.approved}</span></button><button className={active==="rejected"?"is-active":""} onClick={()=>navigate({status:"rejected"})}>Rejected <span>{stats.rejected}</span></button></div><div className="portal-table-wrap"><table><thead><tr><th>Application</th><th>Applicant</th><th>Type</th><th>Location</th><th>Submitted</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong className="portal-reference">{item.reference}</strong></td><td><strong>{item.applicantName}</strong><small>{item.email}</small></td><td><ApplicantBadge type={item.applicantType}/></td><td>{item.location||"—"}</td><td>{new Intl.DateTimeFormat("en-UG",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(item.submittedAt))}</td><td><StatusBadge status={item.status}/></td><td><Link className="portal-view-button" href={`/portal/membership/applications/${item.id}`}>View</Link></td></tr>)}{!items.length&&<tr><td colSpan={7}><div className="portal-empty"><strong>No applications found</strong><span>New submissions will appear here when they match these filters.</span></div></td></tr>}</tbody></table></div><footer className="portal-table-footer">Showing {items.length} application{items.length===1?"":"s"}</footer></section></>;
}
