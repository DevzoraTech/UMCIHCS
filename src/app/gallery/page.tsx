import { PageHeading } from "@/presentation/components/ui/page-heading";
import { GalleryViewer } from "@/presentation/components/gallery-viewer";
export const metadata = { title: "In pictures" };
export default function GalleryPage() { return <><PageHeading eyebrow="In pictures" title="A closer look at" accent="our community." description="People, connections and conversations. Explore photographs shared by the cooperative." /><section className="container section"><GalleryViewer/></section></>; }
