type OutgoingEmail = { to: string | string[]; subject: string; text: string; replyTo?: string; senderName?: string };

const cleanHeader = (value: string) => value.replace(/[\r\n]/g, " ").trim();

export function emailDeliveryIsConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(input: OutgoingEmail) {
  if (!emailDeliveryIsConfigured()) return { delivered: false as const, reason: "Email delivery is not configured." };
  const fromAddress = cleanHeader(process.env.EMAIL_FROM!);
  const senderName = cleanHeader(input.senderName ?? "UMCIHCS");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${senderName} <${fromAddress}>`,
      to: Array.isArray(input.to) ? input.to : [input.to],
      reply_to: input.replyTo ? cleanHeader(input.replyTo) : undefined,
      subject: cleanHeader(input.subject),
      text: input.text,
    }),
    cache: "no-store",
  });
  if (!response.ok) return { delivered: false as const, reason: "The email service could not deliver this message." };
  return { delivered: true as const };
}
