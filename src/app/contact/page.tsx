import { PageHeading } from "@/presentation/components/ui/page-heading";
import { EnquiryForm } from "@/presentation/components/forms/enquiry-form";
import { site } from "@/config/site";
export const metadata={title:"Contact"};
export default function ContactPage(){return <><PageHeading eyebrow="Contact" title="Good things begin" accent="with a conversation." description="Membership, collaboration or a question about the cooperative—we would like to hear from you."/><section className="container section editorial-grid form-layout"><div><p className="eyebrow">Connect with us</p><h2>Let’s find<br/><em>common ground.</em></h2><p className="section-description">Share what brings you here. Your enquiry will help us connect you with the right conversation.</p><div className="contact-cards"><div><h3>Email</h3><a href={`mailto:${site.email}`}>{site.email}</a></div><div><h3>Our home</h3><p>Uganda, East Africa</p></div></div></div><EnquiryForm kind="contact"/></section></>}
