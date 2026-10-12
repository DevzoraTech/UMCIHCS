"use client";

import Link from "next/link";
import { Arrow } from "@/presentation/components/ui/arrow";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container section empty-state error-state">
      <p className="eyebrow">Something went wrong</p>
      <h1>
        Let&apos;s find a<br />
        <em>way forward.</em>
      </h1>
      <p>We couldn&apos;t complete that request. Try again, or return to the cooperative homepage.</p>
      <div className="error-actions">
        <button className="button" type="button" onClick={reset}>
          Try again <Arrow diagonal />
        </button>
        <Link className="text-link" href="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
