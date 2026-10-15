import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/modules/identity/application/api-authorization";

export async function GET(request: Request) {
  const authorization = await authorizeApi(request, "applications:view");
  if ("response" in authorization) return authorization.response;
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!key.startsWith("membership/")) return NextResponse.json({ error: "Invalid document key." }, { status: 400 });
  const entry = await getStore({ name: "membership-documents", consistency: "strong" }).getWithMetadata(key, { type: "arrayBuffer" });
  if (!entry) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const metadata = entry.metadata as { name?: string; type?: string };
  return new Response(entry.data, { headers: { "Content-Type": metadata.type ?? "application/octet-stream", "Content-Disposition": `attachment; filename="${(metadata.name ?? "document").replaceAll('"','')}"`, "Cache-Control": "private, no-store" } });
}
