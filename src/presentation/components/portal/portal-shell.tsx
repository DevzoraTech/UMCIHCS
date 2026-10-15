"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PortalActor } from "@/modules/identity/application/permissions";
import { hasPermission, roleLabel } from "@/modules/identity/application/permissions";
import { authClient } from "@/modules/identity/infrastructure/auth-client";

const links = [
  { href: "/portal/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/portal/membership/applications", label: "Applications", icon: "file" },
  { href: "/portal/membership/members", label: "Members", icon: "people" },
  { href: "/portal/membership/register", label: "Register member", icon: "plus" },
  { href: "/portal/settings", label: "Settings", icon: "settings" },
] as const;

function PortalIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.4-4 2.4-6 6-6s5.6 2 6 6M15 15c3 0 5 1.5 5.5 4.5"/></>,
    plus: <><circle cx="10" cy="8" r="3"/><path d="M4 20c.4-4 2.4-6 6-6M18 13v8M14 17h8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function PortalShell({ actor, children }: { actor: PortalActor; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search,setSearch]=useState("");
  const applicationDetail=path.includes("/membership/applications/");
  const pageTitle=path==="/portal/dashboard"?"Dashboard":applicationDetail?"Application Details":path.includes("/membership/members")?"Members":path.includes("/membership/register")?"Register Member":path.includes("/settings")?"Settings":"Membership Applications";
  const pageSubtitle=path==="/portal/dashboard"?"A concise view of membership activity.":applicationDetail?"Membership Applications  /  Application Details":path.includes("/membership/members")?"View and manage the cooperative membership register":path.includes("/membership/register")?"Create a direct membership record":path.includes("/settings")?"Portal configuration and account security.":"Review, process and manage membership applications for UMCIHCS.";
  async function signOut() { await authClient.signOut(); router.replace("/portal/login"); router.refresh(); }
  function globalSearch(event:FormEvent){event.preventDefault();const value=search.trim();router.push(`/portal/membership/applications${value?`?q=${encodeURIComponent(value)}`:""}`);}
  return <div className="portal-root">
    <aside className={open ? "portal-sidebar is-open" : "portal-sidebar"}>
      <div className="portal-brand"><Image src="/images/umcihcs-badge.jpg" alt="UMCIHCS" width={76} height={76}/><span><strong>UMCIHCS</strong><small>Uganda Medical Cannabis<br/>and Industrial Hemp<br/>Cooperative Society</small></span></div>
      <nav aria-label="Portal navigation">
        <Link href={links[0].href} onClick={()=>setOpen(false)} aria-current={path.startsWith(links[0].href)?"page":undefined}><PortalIcon name={links[0].icon}/>{links[0].label}</Link>
        {links.slice(1,3).map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)} aria-current={path.startsWith(link.href)?"page":undefined}><PortalIcon name={link.icon}/>{link.label}</Link>)}
        {hasPermission(actor,"members:create")&&<Link href={links[3].href} onClick={()=>setOpen(false)} aria-current={path.startsWith(links[3].href)?"page":undefined}><PortalIcon name={links[3].icon}/>{links[3].label}</Link>}
        {hasPermission(actor,"settings:view")&&<Link href={links[4].href} onClick={()=>setOpen(false)} aria-current={path.startsWith(links[4].href)?"page":undefined}><PortalIcon name={links[4].icon}/>{links[4].label}</Link>}
      </nav>
      <div className="portal-sidebar-note"><strong>Legal People.<br/>Sustainable Plants.<br/>A Healthier Uganda.</strong><i/><small>Cooperatives for<br/>People, Plants and Prosperity.</small></div>
    </aside>
    <div className="portal-workspace">
      <header className="portal-topbar">
        <button className="portal-menu" type="button" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>☰</button>
        <div className="portal-top-title"><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div>
        <div className="portal-topbar-spacer"/>
        <form className="portal-global-search" onSubmit={globalSearch}><span>⌕</span><input aria-label="Search portal" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search members, applications or keywords…"/></form>
        <button className="portal-bell" type="button" aria-label="Notifications">♧<b>3</b></button>
        <div className="portal-user"><span>{actor.name.split(/\s+/).map(word=>word[0]).join("").slice(0,2).toUpperCase()}</span><div><strong>{actor.name}</strong><small>{roleLabel(actor.role)}</small></div></div>
        <button className="portal-signout" type="button" onClick={signOut}>⌄<span className="sr-only">Sign out</span></button>
      </header>
      <main className="portal-main" id="portal-main">{children}</main>
    </div>
    {open&&<button className="portal-overlay" aria-label="Close navigation" onClick={()=>setOpen(false)}/>} 
  </div>;
}
