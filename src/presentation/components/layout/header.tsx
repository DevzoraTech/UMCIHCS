"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/config/site";
import { Brand } from "./brand";
import { Arrow } from "../ui/arrow";
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function close(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="utility-bar"><div className="container utility-inner"><span>Uniting stakeholders. Building responsibly.</span><Link href="/leadership">Our people <Arrow diagonal /></Link></div></div>
    <header className="site-header"><div className="container header-inner"><Brand />
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "×" : "☰"}</span></button>
      <nav id="primary-navigation" aria-label="Main navigation" className={open ? "navigation is-open" : "navigation"}>
        {navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={path.startsWith(item.href) ? "page" : undefined}>{item.label}</Link>)}
        <Link className="nav-join" href="/membership/apply" onClick={() => setOpen(false)}>Join the cooperative <Arrow diagonal /></Link>
      </nav>
    </div></header>
  </>;
}
