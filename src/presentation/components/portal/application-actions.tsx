"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ApplicationStatus } from "@/modules/membership/domain/models";

export function ApplicationActions({id,canReview,canDecide,showNotes=false}:{id:string;canReview:boolean;canDecide:boolean;showNotes?:boolean}){
  const router=useRouter();const[busy,setBusy]=useState("");const[message,setMessage]=useState("");
  async function status(next:ApplicationStatus){setBusy(next);setMessage("");const response=await fetch(`/api/portal/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});const data=await response.json();if(!response.ok)setMessage(data.error??"The status could not be updated.");else router.refresh();setBusy("");}
  async function note(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy("note");const form=event.currentTarget;const body=String(new FormData(form).get("body"));const response=await fetch(`/api/portal/applications/${id}/notes`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body})});if(response.ok){form.reset();router.refresh();}else setMessage("The note could not be saved.");setBusy("");}
  return <>{!showNotes&&<div className="portal-detail-actions">{canReview&&<button onClick={()=>status("under_review")} disabled={!!busy}>Mark under review</button>}{canReview&&<button className="clarify" onClick={()=>status("clarification_requested")} disabled={!!busy}>Request clarification</button>}{canDecide&&<button className="reject" onClick={()=>status("rejected")} disabled={!!busy}>Reject</button>}{canDecide&&<button className="approve" onClick={()=>status("approved")} disabled={!!busy}>Approve application</button>}</div>}{showNotes&&canReview&&<form className="portal-note-form" onSubmit={note}><textarea name="body" required minLength={3} maxLength={2000} placeholder="Add a private review note…"/><button disabled={!!busy}>{busy==="note"?"Saving…":"Add note"}</button></form>}{message&&<p className="portal-form-error" role="alert">{message}</p>}</>;
}
