import type { Metadata } from "next";
import { site } from "@/config/site";
import { Header } from "@/presentation/components/layout/header";
import { Footer } from "@/presentation/components/layout/footer";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: `${site.name} — Rooted in purpose. Growing together.`, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: "/images/umcihcs-badge.jpg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main id="main-content">{children}</main><Footer /></body></html>;
}
