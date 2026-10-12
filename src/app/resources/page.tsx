import { PageHeading } from "@/presentation/components/ui/page-heading";
import { ResourceBrowser } from "@/presentation/components/resource-browser";
export const metadata={title:"Resources & insights"};
export default function ResourcesPage(){return <><PageHeading eyebrow="Resources & insights" title="Explore the ideas." accent="See the bigger picture." description="An introduction to the cooperative, our approach and the membership journey. A growing space for useful perspectives."/><section className="container section"><ResourceBrowser/></section></>}
