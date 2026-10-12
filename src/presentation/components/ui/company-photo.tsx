import Image from "next/image";
import { galleryImages } from "@/content/gallery";
export function CompanyPhoto({index=0,caption=true}:{index?:number;caption?:boolean}){const photo=galleryImages[index];return <figure className="company-photo"><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width:760px) 100vw, 65vw"/>{caption&&<figcaption><span>{photo.title}</span><span>UMCIHCS / In pictures</span></figcaption>}</figure>}
