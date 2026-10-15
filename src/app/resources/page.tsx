import { PageHeading } from "@/presentation/components/ui/page-heading";
import { ResourceBrowser } from "@/presentation/components/resource-browser";
export const metadata={title:"Resources & insights"};
export default function ResourcesPage(){return <><PageHeading eyebrow="Resources & insights" title="Learn clearly." accent="Build responsibly." description="Practical introductions to the cooperative, its developing programme and the membership process. This library will grow as verified guidance becomes available."/><section className="container section"><ResourceBrowser/></section></>}
