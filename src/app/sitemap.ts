import type { MetadataRoute } from "next";
import { focusAreas } from "@/content/focus-areas";
import { resources } from "@/content/resources";
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,"");if(!base)return [];return ["","/about","/leadership","/gallery","/focus-areas","/membership","/membership/apply","/resources","/contact","/privacy",...focusAreas.map(a=>`/focus-areas/${a.slug}`),...resources.map(a=>`/resources/${a.slug}`)].map(path=>({url:`${base}${path}`}));}
