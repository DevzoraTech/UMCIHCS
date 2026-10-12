"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="global-error-shell">
          <div className="global-error-card">
            <p className="global-error-brand">UMCIHCS</p>
            <p className="global-error-label">Something went wrong</p>
            <h1>
              Let&apos;s find a<br />
              <em>way forward.</em>
            </h1>
            <p className="global-error-copy">
              The website encountered an unexpected problem. Try loading it again, or return to the homepage.
            </p>
            <div className="global-error-actions">
              <button type="button" onClick={reset}>Try again ↗</button>
              <Link href="/">Back to home</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
