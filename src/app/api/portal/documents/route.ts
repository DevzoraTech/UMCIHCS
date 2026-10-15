import { NextResponse } from "next/server";
import { authorizeApi } from "@/modules/identity/application/api-authorization";
import { downloadPortalDocument } from "@/modules/shared/infrastructure/portal-storage-client";

export async function GET(request: Request) {
  const authorization = await authorizeApi(request, "applications:view");
  if ("response" in authorization) return authorization.response;
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!key.startsWith("membership/")) return NextResponse.json({ error: "Invalid document key." }, { status: 400 });
  const entry=await downloadPortalDocument(key);
  if(!entry.ok)return NextResponse.json({error:"Document not found."},{status:entry.status===404?404:503});
  return new Response(entry.body,{headers:{"Content-Type":entry.headers.get("content-type")??"application/octet-stream","Content-Disposition":entry.headers.get("content-disposition")??"attachment","Cache-Control":"private, no-store"}});
}
