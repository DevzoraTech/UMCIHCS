import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

const json={"Content-Type":"application/json","Cache-Control":"no-store"};
const allowedStores=new Set(["umcihcs-portal"]);
function allowed(request:Request){const supplied=request.headers.get("x-umcihcs-portal-key")??"";const configured=process.env.PORTAL_STORAGE_KEY??"";if(!supplied||!configured||supplied.length!==configured.length)return false;return timingSafeEqual(Buffer.from(supplied),Buffer.from(configured));}
function bad(message:string,status=400){return new Response(JSON.stringify({error:message}),{status,headers:json});}

export default async function handler(request:Request){
  if(request.method!=="POST")return bad("Method not allowed.",405);
  if(!allowed(request))return bad("Unauthorized.",401);
  const type=request.headers.get("content-type")??"";
  if(type.includes("multipart/form-data")){
    const form=await request.formData();const action=form.get("action");const key=form.get("key");const metadata=form.get("metadata");const file=form.get("file");
    if(action!=="write-document"||typeof key!=="string"||!key.startsWith("membership/")||typeof metadata!=="string"||!(file instanceof File))return bad("Invalid document request.");
    await getStore("membership-documents").set(key,file,{metadata:JSON.parse(metadata)});
    return new Response(JSON.stringify({ok:true}),{headers:json});
  }
  const input=await request.json().catch(()=>null) as {action?:string;store?:string;key?:string;data?:unknown;etag?:string;onlyIfNew?:boolean}|null;
  if(!input||typeof input.action!=="string"||typeof input.key!=="string")return bad("Invalid storage request.");
  if(input.action==="read-document"){
    if(!input.key.startsWith("membership/"))return bad("Invalid document key.");
    const record=await getStore("membership-documents").getWithMetadata(input.key,{type:"arrayBuffer"});
    if(!record)return bad("Document not found.",404);const metadata=record.metadata as {name?:string;type?:string};
    return new Response(record.data,{headers:{"Content-Type":metadata.type??"application/octet-stream","Content-Disposition":`attachment; filename="${(metadata.name??"document").replaceAll('"',"")}"`,"Cache-Control":"private, no-store"}});
  }
  if(!input.store||!allowedStores.has(input.store))return bad("Invalid store.");
  const store=getStore(input.store);
  if(input.action==="read-json"){
    const record=await store.getWithMetadata(input.key,{type:"json"});
    return new Response(JSON.stringify({data:record?.data??null,etag:record?.etag}),{headers:json});
  }
  if(input.action==="write-json"){
    const result=await store.setJSON(input.key,input.data,input.etag?{onlyIfMatch:input.etag}:{onlyIfNew:Boolean(input.onlyIfNew)});
    return new Response(JSON.stringify(result),{headers:json});
  }
  return bad("Invalid storage action.");
}

export const config={path:"/api/internal/portal-storage"};
