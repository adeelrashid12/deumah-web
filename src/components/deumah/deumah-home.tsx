'use client';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ActionCard} from './action-card';
import {CategoryCard} from './category-card';
import {ListingCard} from './listing-card';
import {CartIcon, HomeIcon, SearchIcon, ShieldIcon, TagIcon, TruckIcon} from './icons';
import {DeumahHeader} from './deumah-header';

const categoryIcons=[HomeIcon,HomeIcon,CartIcon,HomeIcon,ShieldIcon,TagIcon,TagIcon,HomeIcon,CartIcon,TagIcon];
const listingImages=[
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80'
];

export function DeumahHome(){
 const hero=useTranslations('Hero'), search=useTranslations('Search'), actions=useTranslations('Actions'), categories=useTranslations('Categories'), listings=useTranslations('Listings'), trust=useTranslations('Trust'), promos=useTranslations('Promos');
 const categoryKeys=['cars','properties','electronics','furniture','services','tools','fashion','kids','hobbies','more'] as const;
 return <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950"><DeumahHeader/>
  <main>
   <section className="relative isolate overflow-hidden bg-deumah-navy-950 text-white"><Image src="/hero_bg.png" alt="Sana'a skyline at sunset" fill priority className="-z-20 object-cover" sizes="100vw"/><div className="absolute inset-0 -z-10 bg-gradient-to-r from-deumah-navy-950 via-deumah-navy-950/75 to-deumah-navy-950/25 rtl:bg-gradient-to-l"/>
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"><div className="max-w-2xl"><h1 className="text-4xl font-bold tracking-tight sm:text-5xl"><span className="block">{hero('titleLine1')}</span><span className="block text-deumah-green-600">{hero('titleLine2')}</span></h1><p className="mt-4 text-lg text-white/85">{hero('subtitle')}</p></div>
    <div className="mt-8 grid gap-3 rounded-deumah-lg bg-white p-3 text-deumah-navy-950 shadow-deumah-search md:grid-cols-[180px_1fr_160px_auto]"><button className="rounded-deumah-sm border border-deumah-gray-200 px-4 py-3 text-start text-sm">{search('category')}</button><label className="flex items-center gap-3 rounded-deumah-sm px-3"><SearchIcon className="size-5 text-deumah-gray-500"/><input aria-label={search('placeholder')} placeholder={search('placeholder')} className="min-w-0 flex-1 bg-transparent py-3 outline-none"/></label><button className="rounded-deumah-sm border border-deumah-gray-200 px-4 py-3 text-start text-sm">{search('location')}</button><button className="rounded-deumah-sm bg-deumah-green-700 px-6 py-3 font-semibold text-white hover:bg-deumah-green-600">{search('button')}</button></div>
    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><ActionCard tone="rent" title={actions('rent')} description={actions('rentDescription')} icon={<HomeIcon/>}/><ActionCard tone="buy" title={actions('buy')} description={actions('buyDescription')} icon={<CartIcon/>}/><ActionCard tone="sell" title={actions('sell')} description={actions('sellDescription')} icon={<TagIcon/>}/><ActionCard tone="delivery" title={actions('delivery')} description={actions('deliveryDescription')} icon={<TruckIcon/>}/></div>
    <div className="mt-4 flex justify-end"><div className="rounded-deumah bg-deumah-navy-900/85 px-5 py-3 text-sm">{hero('trusted')}</div></div></div>
   </section>

   <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">{categories('title')}</h2><a href="#" className="text-sm font-semibold text-deumah-green-700">{categories('viewAll')}</a></div><div className="mt-5 flex overflow-x-auto gap-3 pb-3 sm:grid sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 scrollbar-none snap-x snap-mandatory">{categoryKeys.map((key)=>{return <div key={key} className="shrink-0 w-[140px] sm:w-auto snap-start"><CategoryCard label={categories(key)} icon={<img src={`/deumah/icons/${key}.svg`} alt="" className="size-8 block object-contain" />} /></div>})}</div></section>

   <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">{listings('title')}</h2><a href="#" className="text-sm font-semibold text-deumah-green-700">{listings('viewAll')}</a></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listingImages.map((image,i)=><ListingCard key={image} image={image} title={['Toyota Land Cruiser 2021','Villa in Al-Sabeen Street','Canon 80D Camera','Bicycle'][i]} price={['$85 / Day','$950 / Month','$450','$15 / Day'][i]} location="Sana'a" badge={i===2?listings('sell'):listings('rent')} badgeTone={i===2?'sell':'rent'}/>)}</div></section>

   <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"><div className="flex overflow-x-auto gap-6 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-5 rounded-deumah bg-deumah-navy-950 p-6 text-white scrollbar-none snap-x snap-mandatory">{['verified','payments','delivery','support','safe'].map(key=><div key={key} className="flex gap-3 shrink-0 w-[220px] sm:w-auto snap-start"><ShieldIcon className="size-7 shrink-0 text-deumah-gold-500"/><div><h3 className="font-semibold">{trust(key as never)}</h3><p className="mt-1 text-sm text-white/70">{trust(`${key}Description` as never)}</p></div></div>)}</div></section>

   <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8"><article className="rounded-deumah bg-deumah-green-100 p-7"><h2 className="text-2xl font-semibold text-deumah-green-700">{promos('postTitle')}</h2><p className="mt-2 text-deumah-gray-500">{promos('postDescription')}</p><button className="mt-5 rounded-deumah-sm bg-deumah-green-700 px-5 py-3 font-semibold text-white">{promos('postButton')}</button></article><article className="rounded-deumah bg-white p-7 shadow-deumah-card"><h2 className="text-2xl font-semibold">{promos('shippingTitle')}</h2><p className="mt-2 text-deumah-gray-500">{promos('shippingDescription')}</p><button className="mt-5 rounded-deumah-sm bg-deumah-green-700 px-5 py-3 font-semibold text-white">{promos('shippingButton')}</button></article></section>
  </main>
 </div>;
}
