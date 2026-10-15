import { notFound } from "next/navigation";
import { resources } from "@/content/resources";
import { ButtonLink } from "@/presentation/components/ui/button-link";
import { ImagePlaceholder } from "@/presentation/components/ui/image-placeholder";
import Link from "next/link";
export function generateStaticParams(){return resources.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return{title:resources.find(r=>r.slug===slug)?.title??"Resource"}}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const article=resources.find(r=>r.slug===slug);if(!article)notFound();return <article className="container article-page"><div className="breadcrumb"><Link href="/resources">Resources</Link><span>/</span><span>{article.category}</span></div><p className="eyebrow">UMCIHCS / {article.category}</p><h1>{article.title}</h1><p className="article-deck">{article.description}</p><div className="article-visual"><ImagePlaceholder label={`${article.category} programme imagery`} /></div><div className="article-body prose">{article.paragraphs.map(p=><p key={p}>{p}</p>)}<ButtonLink href="/contact">Talk to the cooperative</ButtonLink></div><div className="article-related"><p className="eyebrow">Continue exploring</p>{resources.filter(r=>r.slug!==slug).map(r=><Link href={`/resources/${r.slug}`} key={r.slug}>{r.title}<span aria-hidden="true">↗</span></Link>)}</div></article>}
