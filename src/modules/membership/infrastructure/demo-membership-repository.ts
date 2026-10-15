import type { MembershipRepository } from "../application/repository";
import type { ApplicationFilters, ApplicationStats, ApplicationStatus, Member, MembershipApplicationDetail, NewApplication, NewMember, PortalMessage } from "../domain/models";

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const demoApplications: MembershipApplicationDetail[] = [
  { id:"demo-1",reference:"DEMO-APP-001",applicantType:"individual",applicantName:"Sample Individual",email:"individual@example.invalid",phone:"+256 700 000 001",location:"Kampala",status:"pending",submittedAt:daysAgo(1),reviewedAt:null,data:{full_name:"Sample Individual",occupation:"Agricultural professional",areas_of_interest:["Education and Capacity Building"],join_reason:"Demonstration record for portal layout review."},document:null,notes:[],timeline:[{id:"event-1",eventType:"submitted",description:"Demonstration application submitted",actorName:null,createdAt:daysAgo(1)}]},
  { id:"demo-2",reference:"DEMO-APP-002",applicantType:"organization",applicantName:"Sample Organisation Ltd",email:"organisation@example.invalid",phone:"+256 700 000 002",location:"Wakiso",status:"under_review",submittedAt:daysAgo(3),reviewedAt:daysAgo(2),data:{organization_name:"Sample Organisation Ltd",organization_type:"Limited Liability Company",registration_number:"DEMO-REG-002",representative_name:"Sample Representative",business_activities:"Demonstration organisation record."},document:null,notes:[{id:"note-1",body:"Demonstration note for interface review.",authorName:"Portal Preview",createdAt:daysAgo(2)}],timeline:[{id:"event-2",eventType:"submitted",description:"Demonstration application submitted",actorName:null,createdAt:daysAgo(3)},{id:"event-3",eventType:"status_changed",description:"Status changed to under review",actorName:"Portal Preview",createdAt:daysAgo(2)}]},
];
const demoMembers: Member[] = [{id:"member-1",memberNumber:"DEMO-MEM-001",memberType:"individual",displayName:"Sample Approved Member",email:"member@example.invalid",phone:"+256 700 000 003",location:"Jinja",status:"active",admittedAt:daysAgo(20)}];

export class DemoMembershipRepository implements MembershipRepository {
  async applicationStats(): Promise<ApplicationStats> { const result:ApplicationStats={all:demoApplications.length,pending:0,under_review:0,clarification_requested:0,approved:0,rejected:0};for(const item of demoApplications)result[item.status]++;return result; }
  async listApplications(filters:ApplicationFilters={}) { return demoApplications.filter(item=>(!filters.status||item.status===filters.status)&&(!filters.applicantType||item.applicantType===filters.applicantType)&&(!filters.query||`${item.reference} ${item.applicantName} ${item.email}`.toLowerCase().includes(filters.query.toLowerCase()))); }
  async getApplication(id:string){return demoApplications.find(item=>item.id===id||item.reference===id)??null;}
  async createApplication(input:NewApplication){return{id:"demo-created",reference:input.reference};}
  async updateApplicationStatus(id:string,status:ApplicationStatus){const item=demoApplications.find(x=>x.id===id);if(item)item.status=status;}
  async addReviewNote(id:string,body:string,_actorId:string,actorName:string){const item=demoApplications.find(x=>x.id===id);item?.notes.unshift({id:crypto.randomUUID(),body,authorName:actorName,createdAt:new Date().toISOString()});}
  async addApplicationMessage(id:string,message:PortalMessage){const item=demoApplications.find(x=>x.id===id);if(!item)throw new Error("Application not found");(item.messages??=[]).unshift(message);}
  async approveApplication(id:string){const item=demoApplications.find(x=>x.id===id);if(!item)throw new Error("Application not found");item.status="approved";return demoMembers[0];}
  async listMembers(query=""){return demoMembers.filter(item=>!query||`${item.memberNumber} ${item.displayName} ${item.email}`.toLowerCase().includes(query.toLowerCase()));}
  async getMember(id:string){return demoMembers.find(item=>item.id===id||item.memberNumber===id)??null;}
  async createMember(input:NewMember){const created:Member={...input,id:crypto.randomUUID(),memberNumber:input.memberNumber??`DEMO-MEM-${demoMembers.length+1}`,admittedAt:input.admittedAt??new Date().toISOString()};demoMembers.unshift(created);return created;}
  async addMemberMessage(id:string,message:PortalMessage){const item=demoMembers.find(x=>x.id===id);if(!item)throw new Error("Member not found");(item.messages??=[]).unshift(message);}
}
