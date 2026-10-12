import { notFound } from "next/navigation";
import Link from "next/link";
import { focusAreas } from "@/content/focus-areas";
import { PageHeading } from "@/presentation/components/ui/page-heading";
import { ImagePlaceholder } from "@/presentation/components/ui/image-placeholder";
import { CompanyPhoto } from "@/presentation/components/ui/company-photo";
import { ButtonLink } from "@/presentation/components/ui/button-link";
export function generateStaticParams() { return focusAreas.map(({slug}) => ({slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; return {title:focusAreas.find(a=>a.slug===slug)?.title ?? "Focus area"}; }
export default async function FocusDetail({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const a=focusAreas.find(a=>a.slug===slug); if(!a) notFound(); return <><PageHeading eyebrow="Our focus" title={a.title.split(" & ")[0]} accent={`& ${a.title.split(" & ")[1]}.`} description={a.description} /><section className="container section editorial-grid"><aside><p className="eyebrow">Explore our focus</p><nav className="side-nav" aria-label="Focus areas">{focusAreas.map(x=><Link aria-current={x.slug===slug?"page":undefined} key={x.slug} href={`/focus-areas/${x.slug}`}>{x.title}</Link>)}</nav></aside><div className="prose"><h2>{a.short}</h2><p className="lead">{a.body}</p><h3>Our direction</h3><ul className="feature-list">{a.points.map(p=><li key={p}>{p}</li>)}</ul>{a.slug === "advocacy" ? <CompanyPhoto index={2}/> : a.slug === "innovation" ? <CompanyPhoto index={1}/> : <ImagePlaceholder label={a.title} />}<h3>Bring your perspective</h3><p>If this area connects with your work or interests, we would like to hear from you.</p><ButtonLink href="/contact">Start a conversation</ButtonLink></div></section></>; }
