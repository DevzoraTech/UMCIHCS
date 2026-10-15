"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { Brand } from "./brand";
import { Arrow } from "../ui/arrow";
export function Footer() {
  const path = usePathname();
  if (path.startsWith("/portal")) return null;
  return <footer className="site-footer"><div className="container">
    <div className="footer-top"><div className="footer-brand"><Brand light /><p>Building the foundations for a responsible, inclusive and sustainable Ugandan industry.</p><span className="motto">{site.motto}</span></div>
      <div><h2>The cooperative</h2><Link href="/about">About UMCIHCS</Link><Link href="/leadership">Leadership &amp; people</Link><Link href="/focus-areas">Our work</Link><Link href="/gallery">In pictures</Link></div>
      <div><h2>Get involved</h2><Link href="/membership">Membership</Link><Link href="/membership/apply">Apply to join</Link><Link href="/resources">Resources &amp; insights</Link><Link href="/contact">Partnership enquiries</Link></div>
      <div className="footer-contact"><h2>Let’s connect</h2><a href={`mailto:${site.email}`}>{site.email}<Arrow diagonal /></a><a href={site.social.x} target="_blank" rel="noreferrer">Follow UMCIHCS on X <Arrow diagonal /></a><a href={site.social.tiktok} target="_blank" rel="noreferrer">Watch UMCIHCS on TikTok <Arrow diagonal /></a><p>Uganda · East Africa</p><Link className="footer-contact-link" href="/contact">Contact the cooperative <Arrow /></Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} UMCIHCS</span><span>Research. Innovation. Advocacy. Member empowerment.</span><Link href="/privacy">Privacy notice</Link></div>
  </div></footer>;
}
