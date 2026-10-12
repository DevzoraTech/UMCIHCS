import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? "brand-light" : ""}`} aria-label="UMCIHCS home"><Image src="/images/umcihcs-badge.jpg" alt="" width={60} height={60} /><span><strong>{site.name}</strong><small>Uganda Medical Cannabis &amp;<br />Industrial Hemp Cooperative Society</small></span></Link>;
}
