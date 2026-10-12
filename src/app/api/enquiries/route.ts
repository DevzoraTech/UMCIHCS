import { createHash } from "node:crypto";
import { validateEnquiry } from "@/domain/enquiries/enquiry";
import { submitEnquiry } from "@/application/enquiries/submit-enquiry";
import { emailDeliveryConfigured, ResendDelivery } from "@/infrastructure/email/resend-delivery";
export const runtime="nodejs";
const attempts = new Map<string,{count:number;expires:number}>();
function limited(key:string){const now=Date.now();for(const[k,v]of attempts)if(v.expires<now)attempts.delete(k);const current=attempts.get(key);if(current){current.count++;return current.count>5;}if(attempts.size>=1000)return true;attempts.set(key,{count:1,expires:now+60000});return false;}
export async function POST(request: Request) {
  const origin=request.headers.get("origin");
  if(!origin || origin!==new URL(request.url).origin) return Response.json({error:"Please submit using this website’s form."},{status:403});
  if(!request.headers.get("content-type")?.includes("application/json")) return Response.json({error:"Unsupported request format."},{status:415});
  const client=request.headers.get("x-nf-client-connection-ip") || "local";
  if(limited(client)) return Response.json({error:"Please wait a minute before trying again."},{status:429,headers:{"Retry-After":"60"}});
  let input:unknown;
  try {
    const reader=request.body?.getReader();if(!reader)throw new Error();let size=0;const chunks:Uint8Array[]=[];
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();return Response.json({error:"Your message is too large."},{status:413});}chunks.push(value);}
    input=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {return Response.json({error:"Please check your form and try again."},{status:400});}
  if(input && typeof input==="object" && "website" in input && input.website) return Response.json({error:"Unable to accept this request."},{status:400});
  const result=validateEnquiry(input);
  if(!result.ok)return Response.json({error:result.error},{status:400});
  if(!emailDeliveryConfigured())return Response.json({error:"Direct delivery is not available yet. Please use the email option below."},{status:503});
  const idempotencyKey=createHash("sha256").update(JSON.stringify(result.value)+Math.floor(Date.now()/86400000)).digest("hex");
  try {await submitEnquiry(result.value,idempotencyKey,new ResendDelivery());return Response.json({message:"Your request has been sent to the cooperative. The team will contact you about next steps."});}
  catch{return Response.json({error:"We couldn’t confirm delivery. Your entries are still here. Please try again or use the email option below."},{status:502});}
}
