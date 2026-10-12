import Link from "next/link";
import { focusAreas } from "@/content/focus-areas";
import { PageHeading } from "@/presentation/components/ui/page-heading";
import { Arrow } from "@/presentation/components/ui/arrow";
import { MembershipCta } from "@/presentation/components/ui/membership-cta";
export const metadata = { title: "Our focus areas" };
export default function FocusPage() { return <><PageHeading eyebrow="Our focus" title="Connected priorities." accent="Collective progress." description="Research, innovation and advocacy form the foundation of our approach to Uganda’s medical cannabis and industrial hemp sector." /><section className="container section focus-list">{focusAreas.map(a => <article key={a.slug}><span className="focus-number">{a.number}</span><div><p className="eyebrow">{a.short}</p><h2>{a.title}</h2><p>{a.description}</p><div className="tags">{a.topics.map(t => <span key={t}>{t}</span>)}</div></div><Link className="circle-link" href={`/focus-areas/${a.slug}`} aria-label={`Explore ${a.title}`}><Arrow diagonal /></Link></article>)}</section><MembershipCta /></>; }
