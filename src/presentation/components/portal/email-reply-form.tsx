"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function EmailReplyForm({ endpoint, recipient }: { endpoint: string; recipient: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") ?? "");
    setBusy(true); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The email could not be sent.");
      form.reset(); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The email could not be sent."); }
    finally { setBusy(false); }
  }

  return <form className="portal-reply-form" onSubmit={submit}>
    <p>Send an email to <strong>{recipient}</strong>. The recipient can reply directly to the signed-in administrator.</p>
    <textarea name="body" required minLength={3} maxLength={4000} placeholder="Write your message…" />
    <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send email"}</button>
    {message && <p className="portal-form-error" role="alert">{message}</p>}
  </form>;
}
