import { PageHeading } from "@/presentation/components/ui/page-heading";
import { MembershipApplicationForm } from "@/presentation/components/forms/membership-application-form";
export const metadata={title:"Apply for membership"};
export default function ApplyPage(){return <><PageHeading eyebrow="Membership application" title="A new connection" accent="starts with you." description="Complete the appropriate application for yourself or a registered organization. The cooperative will review your submission and contact you about the next steps."/><section className="container section registration-page"><MembershipApplicationForm/></section></>}
