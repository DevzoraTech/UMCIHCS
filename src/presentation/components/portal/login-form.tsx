"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/modules/identity/infrastructure/auth-client";

export function PortalLoginForm() {
  const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const data=new FormData(event.currentTarget);const result=await authClient.signIn.email({email:String(data.get("email")),password:String(data.get("password")),rememberMe:Boolean(data.get("remember"))});if(result.error){setError("The email address or password is incorrect.");setBusy(false);return;}router.replace("/portal/dashboard");router.refresh();}
  return <form onSubmit={submit} className="portal-login-form"><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="name@umcihcs.org"/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><label className="portal-check"><input name="remember" type="checkbox"/><span>Keep me signed in on this device</span></label>{error&&<p className="portal-form-error" role="alert">{error}</p>}<button type="submit" disabled={busy}>{busy?"Signing in…":"Sign in to portal"}</button></form>;
}
