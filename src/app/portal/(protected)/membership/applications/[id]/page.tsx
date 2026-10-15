import Link from "next/link";
import { notFound } from "next/navigation";
import { currentPortalActor } from "@/modules/identity/application/session";
import { hasPermission } from "@/modules/identity/application/permissions";
import { membershipRepository } from "@/modules/membership/infrastructure/repository-factory";
import { ApplicantBadge, StatusBadge } from "@/presentation/components/portal/status-badge";
import { ApplicationActions } from "@/presentation/components/portal/application-actions";

export const dynamic="force-dynamic";
const labels:Record<string,string>={full_name:"Full name",date_of_birth:"Date of birth",gender:"Gender",nationality:"Nationality",occupation:"Occupation / profession",phone_primary:"Primary phone",phone_alternative:"Alternative phone",email:"Email address",country_residence:"Country of residence",district_city:"District / city",physical_address:"Physical address",organization_name:"Registered name",trading_name:"Trading name",organization_type:"Organisation type",registration_number:"Registration number",country_registration:"Country of registration",registration_year:"Year of registration",tin:"Tax identification number",website_url:"Website",business_activities:"Primary business activities",registered_office_address:"Registered office address",operations_location:"Location of operations",representative_name:"Representative",representative_position:"Position / designation",representative_phone:"Contact phone",representative_email:"Contact email",representative_alt_phone:"Alternative phone",areas_of_interest:"Areas of interest",sector_involvement:"Current involvement",sector_experience:"Experience or expertise",heard_about:"How they heard about UMCIHCS",join_reason:"Reason for joining",membership_benefits:"Expected membership benefits",cooperative_contribution:"Proposed contribution"};
const individual=["full_name","date_of_birth","gender","nationality","occupation","phone_primary","phone_alternative","email","country_residence","district_city","physical_address"];
const organisation=["organization_name","trading_name","organization_type","registration_number","country_registration","registration_year","tin","website_url"];
const representative=["representative_name","representative_position","representative_phone","representative_email","representative_alt_phone"];
const location=["country_residence","district_city","physical_address","registered_office_address","operations_location"];
const interest=["business_activities","areas_of_interest","sector_involvement","sector_experience","heard_about","join_reason","membership_benefits","cooperative_contribution"];
function value(raw:unknown){if(Array.isArray(raw))return raw.join(", ");if(typeof raw==="boolean")return raw?"Yes":"No";return String(raw??"");}
function DetailSection({title,fields,data}:{title:string;fields:string[];data:Record<string,unknown>}){const shown=fields.filter(field=>value(data[field]).trim());if(!shown.length)return null;return <section className="portal-detail-section"><h2>{title}</h2><dl>{shown.map(field=><div key={field}><dt>{labels[field]??field.replaceAll("_"," ")}</dt><dd>{value(data[field])}</dd></div>)}</dl></section>}

export default async function ApplicationDetailPage({params}:{params:Promise<{id:string}>}){
  const actor=await currentPortalActor();if(!actor)return null;
  const item=await membershipRepository().getApplication((await params).id);if(!item)notFound();
  const date=(input:string)=>new Intl.DateTimeFormat("en-UG",{dateStyle:"medium",timeStyle:"short"}).format(new Date(input));
  return <div className="portal-application-detail">
    <header className="portal-detail-command-bar"><Link className="portal-back" href="/portal/membership/applications">← Back to Applications</Link><ApplicationActions id={item.id} canReview={hasPermission(actor,"applications:review")} canDecide={hasPermission(actor,"applications:decide")}/></header>
    <section className="portal-summary-strip portal-reference-summary"><article><i>▤</i><div><span>Application ID</span><strong>{item.reference}</strong></div></article><article><i>♟</i><div><span>Applicant Type</span><ApplicantBadge type={item.applicantType}/></div></article><article><i>◉</i><div><span>Status</span><StatusBadge status={item.status}/></div></article><article><i>▣</i><div><span>Submitted On</span><strong>{new Intl.DateTimeFormat("en-UG",{dateStyle:"medium"}).format(new Date(item.submittedAt))}</strong></div></article><article><i>♙</i><div><span>Reviewed By</span><strong>{item.reviewedAt?actor.name:"Unassigned"}</strong></div></article></section>
    <div className="portal-detail-grid"><div>
      <DetailSection title={item.applicantType==="individual"?"Applicant Information":"Applicant / Organization Information"} fields={item.applicantType==="individual"?individual:organisation} data={item.data}/>
      {item.applicantType==="organization"&&<DetailSection title="Primary Contact Person" fields={representative} data={item.data}/>}<DetailSection title="Location & Address" fields={location} data={item.data}/><DetailSection title="Membership Interest / Application Information" fields={interest} data={item.data}/>
      {item.document&&<section className="portal-detail-section"><h2>Supporting Documents</h2><a className="portal-document" href={`/api/portal/documents?key=${encodeURIComponent(item.document.key)}`}><span>PDF</span><div><strong>{item.document.name}</strong><small>{Math.ceil(item.document.size/1024)} KB · Protected document</small></div><b>⇩</b></a></section>}
    </div><aside>
      <section className="portal-detail-section portal-profile"><h2>Applicant Profile <b>⋮</b></h2><div><span>{item.applicantType==="organization"?"⌂":item.applicantName.slice(0,1).toUpperCase()}</span><div><strong>{item.applicantName}</strong><ApplicantBadge type={item.applicantType}/></div></div><p>{item.email}<br/>{item.phone||"No phone provided"}<br/>{item.location||"No location provided"}</p></section>
      <section className="portal-detail-section portal-timeline"><h2>Application timeline</h2>{item.timeline.map(event=><article key={event.id}><i/><div><strong>{event.description}</strong><span>{date(event.createdAt)}</span>{event.actorName&&<small>{event.actorName}</small>}</div></article>)}</section>
      <section className="portal-detail-section"><h2>Internal Review Notes <b>⋮</b></h2><ApplicationActions id={item.id} canReview={hasPermission(actor,"applications:review")} canDecide={false} showNotes/><div className="portal-notes">{item.notes.map(note=><article key={note.id}><strong>{note.authorName}</strong><span>{date(note.createdAt)}</span><p>{note.body}</p></article>)}{!item.notes.length&&<p>No internal notes have been added.</p>}</div></section>
      <section className="portal-detail-section portal-quick-facts"><h2>Quick Facts</h2><div><span>✉ Email verified</span><b>Yes</b></div><div><span>☎ Phone verified</span><b>{item.phone?"Yes":"No"}</b></div><div><span>▤ Documents uploaded</span><b>{item.document?"1":"0"}</b></div><div><span>♙ Existing member record</span><b>No</b></div></section>
    </aside></div>
  </div>;
}
