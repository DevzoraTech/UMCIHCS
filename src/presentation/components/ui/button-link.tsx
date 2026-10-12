import Link from "next/link";
import { Arrow } from "./arrow";
export function ButtonLink({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return <Link className={`button ${secondary ? "button-secondary" : ""}`} href={href}>{children}<Arrow diagonal /></Link>;
}
