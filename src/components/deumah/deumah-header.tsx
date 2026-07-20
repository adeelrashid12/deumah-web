'use client';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {HeartIcon, MenuIcon, PinIcon} from './icons';

export function DeumahHeader() {
 const t=useTranslations('Nav'); const locale=useLocale();
 return <header className="bg-deumah-navy-950 text-white"><div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
  <a href={`/${locale}`} className="shrink-0">
    <img 
      src={locale === 'ar' ? '/arabic logo without bg.png' : '/final logo without bg.png'} 
      alt="Deumah" 
      className="h-10 sm:h-12 w-auto object-contain" 
    />
  </a>
  <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Primary"><a href="#">{t('rent')}</a><a href="#">{t('buy')}</a><a href="#">{t('sell')}</a><a href="#">{t('delivery')}</a><a href="#">{t('services')}</a><a href="#">{t('more')}</a></nav>
  <div className="ms-auto flex items-center gap-2"><button className="hidden items-center gap-2 rounded-deumah-sm border border-white/15 px-3 py-2 text-sm md:flex"><PinIcon className="size-4"/>Sana'a</button><a href={`/${locale==='ar'?'en':'ar'}`} className="rounded-deumah-sm border border-white/15 px-3 py-2 text-sm">{locale==='ar'?'English':'العربية'}</a><button aria-label={t('favorites')} className="hidden rounded-full p-2 hover:bg-white/10 sm:block"><HeartIcon className="size-5"/></button><a href="#" className="hidden rounded-deumah-sm border border-white/20 px-4 py-2 text-sm md:block">{t('login')}</a><a href="#" className="hidden rounded-deumah-sm bg-deumah-green-700 px-4 py-2 text-sm font-semibold md:block">{t('signup')}</a><button aria-label="Menu" className="rounded-full p-2 hover:bg-white/10 lg:hidden"><MenuIcon className="size-6"/></button></div>
 </div></header>;
}
