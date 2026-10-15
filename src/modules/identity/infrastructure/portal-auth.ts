import { createHmac, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getStore } from "@netlify/blobs";
import type { PortalActor, PortalRole } from "../application/permissions";

const scrypt=promisify(scryptCallback);const usersKey="identity/users.json";const cookieName="umcihcs_portal_session";const store=()=>getStore({name:"umcihcs-portal",consistency:"strong"});
type PortalUser={id:string;name:string;email:string;role:PortalRole;passwordHash:string;createdAt:string};
const secret=()=>process.env.BETTER_AUTH_SECRET??"";
function encode(input:string){return Buffer.from(input).toString("base64url");}function decode(input:string){return Buffer.from(input,"base64url").toString();}
function sign(input:string){return createHmac("sha256",secret()).update(input).digest("base64url");}
export async function passwordHash(password:string){const salt=randomUUID();const digest=await scrypt(password,salt,64) as Buffer;return `${salt}:${digest.toString("base64url")}`;}
async function matches(password:string,stored:string){const[salt,hash]=stored.split(":");if(!salt||!hash)return false;const digest=await scrypt(password,salt,64) as Buffer;const expected=Buffer.from(hash,"base64url");return expected.length===digest.length&&timingSafeEqual(expected,digest);}
async function readUsers(){const record=await store().getWithMetadata(usersKey,{type:"json"});return{users:(record?.data as PortalUser[]|undefined)??[],etag:record?.etag};}
async function saveUsers(users:PortalUser[],etag?:string){return store().setJSON(usersKey,users,etag?{onlyIfMatch:etag}:{onlyIfNew:true});}
async function ensureSeed(){for(let attempt=0;attempt<4;attempt+=1){const{users,etag}=await readUsers();if(users.length)return users;const email=process.env.PORTAL_SUPERADMIN_EMAIL?.trim().toLowerCase();const name=process.env.PORTAL_SUPERADMIN_NAME?.trim();const password=process.env.PORTAL_SUPERADMIN_PASSWORD;if(!email||!name||!password)throw new Error("The portal administrator has not been configured.");const seeded:PortalUser={id:randomUUID(),name,email,role:"super_admin",passwordHash:await passwordHash(password),createdAt:new Date().toISOString()};if((await saveUsers([seeded],etag)).modified)return[seeded];}throw new Error("The portal administrator could not be initialised.");}
function actor(user:PortalUser):PortalActor{return{id:user.id,name:user.name,email:user.email,role:user.role};}
export async function signIn(email:string,password:string){if(!secret())throw new Error("The portal signing secret is not configured.");const users=await ensureSeed();const user=users.find(item=>item.email===email.trim().toLowerCase());if(!user||!await matches(password,user.passwordHash))return null;const payload=encode(JSON.stringify({id:user.id,exp:Date.now()+8*60*60*1000}));return{actor:actor(user),token:`${payload}.${sign(payload)}`};}
export async function actorFromToken(token:string|undefined){if(!token||!secret())return null;const[payload,signature]=token.split(".");if(!payload||!signature||signature.length!==sign(payload).length||!timingSafeEqual(Buffer.from(signature),Buffer.from(sign(payload))))return null;try{const session=JSON.parse(decode(payload)) as{id:string;exp:number};if(!session.id||session.exp<Date.now())return null;const users=await ensureSeed();const user=users.find(item=>item.id===session.id);return user?actor(user):null;}catch{return null;}}
export async function changePassword(actorId:string,currentPassword:string,nextPassword:string){const{users,etag}=await readUsers();const user=users.find(item=>item.id===actorId);if(!user||!await matches(currentPassword,user.passwordHash))return false;user.passwordHash=await passwordHash(nextPassword);return(await saveUsers(users,etag)).modified;}
export function sessionCookie(token:string){return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${8*60*60}`;}
export function expiredSessionCookie(){return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;}
export {cookieName};
