import Image from 'next/image';
import {HeartIcon, PinIcon} from './icons';

type Props = {title:string; price:string; location:string; image:string; badge:string; badgeTone?:'rent'|'sell'};
export function ListingCard({title, price, location, image, badge, badgeTone='rent'}: Props) {
 return <article className="overflow-hidden rounded-deumah border border-deumah-gray-200 bg-white shadow-deumah-card">
   <div className="relative aspect-[4/3] overflow-hidden bg-deumah-gray-200"><Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 80vw, 240px"/><span className={`absolute bottom-2 start-2 rounded-md px-2 py-1 text-xs font-semibold text-white ${badgeTone==='sell'?'bg-deumah-orange-600':'bg-deumah-green-700'}`}>{badge}</span></div>
   <div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="line-clamp-2 font-medium">{title}</h3><button type="button" aria-label="Add to favorites" className="shrink-0 rounded-full p-1 hover:bg-deumah-gray-50"><HeartIcon className="size-5"/></button></div><p className="mt-2 font-semibold">{price}</p><p className="mt-3 flex items-center gap-1 text-sm text-deumah-gray-500"><PinIcon className="size-4"/>{location}</p></div>
 </article>;
}
