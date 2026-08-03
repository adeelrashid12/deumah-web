'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ActionCard } from './action-card';
import { CategoryCard } from './category-card';
import { ListingCard } from './listing-card';
import { CartIcon, HomeIcon, SearchIcon, ShieldIcon, TagIcon, TruckIcon } from './icons';
import { DeumahHeader } from './deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

const YEMEN_CITIES = [
  { id: 'sanaa_city', en: "Sana'a City (Capital Municipality)", ar: "أمانة العاصمة" },
  { id: 'sanaa', en: "Sana'a", ar: "صنعاء" },
  { id: 'aden', en: "Aden", ar: "عدن" },
  { id: 'taiz', en: "Taiz", ar: "تعز" },
  { id: 'ibb', en: "Ibb", ar: "إب" },
  { id: 'hadhramaut', en: "Hadhramaut", ar: "حضرموت" },
  { id: 'al_hudaydah', en: "Al Hudaydah", ar: "الحديدة" },
  { id: 'al_mahrah', en: "Al Mahrah", ar: "المهرة" },
  { id: 'al_jawf', en: "Al Jawf", ar: "الجوف" },
  { id: 'al_bayda', en: "Al Bayda", ar: "البيضاء" },
  { id: 'dhamar', en: "Dhamar", ar: "ذمار" },
  { id: 'hajjah', en: "Hajjah", ar: "حجة" },
  { id: 'lahij', en: "Lahij", ar: "لحج" },
  { id: 'marib', en: "Marib", ar: "مأرب" },
  { id: 'sadah', en: "Sa'dah", ar: "صعدة" },
  { id: 'shabwah', en: "Shabwah", ar: "شبوة" },
  { id: 'abyan', en: "Abyan", ar: "أبين" },
  { id: 'al_dhalee', en: "Al Dhale'e", ar: "الضالع" },
  { id: 'amran', en: "Amran", ar: "عمران" },
  { id: 'raymah', en: "Raymah", ar: "ريمة" },
  { id: 'al_mahwit', en: "Al Mahwit", ar: "المحويت" },
  { id: 'socotra', en: "Socotra", ar: "سقطرى" }
];

export function DeumahHome() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const hero = useTranslations('Hero');
  const search = useTranslations('Search');
  const actions = useTranslations('Actions');
  const categories = useTranslations('Categories');
  const listings = useTranslations('Listings');
  const trust = useTranslations('Trust');
  const promos = useTranslations('Promos');

  const categoryKeys = ['cars', 'properties', 'electronics', 'furniture', 'services', 'tools', 'fashion', 'kids', 'hobbies', 'wedding_halls', 'chalets', 'more'] as const;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [shippingModalOpen, setShippingModalOpen] = useState(false);

  // Live Supabase Approved Listings State
  const [liveListings, setLiveListings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchApprovedListings() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .in('status', ['approved', 'active'])
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setLiveListings(data);
        }
      } catch (e) {
        console.error('Homepage fetch error:', e);
      }
    }
    fetchApprovedListings();
  }, []);

  const searchUrl = `/listings?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&city=${encodeURIComponent(city)}`;

  // Default fallback static items
  const fallbackListings = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
      title: isAr ? 'تويوتا لاند كروزر 2021' : 'Toyota Land Cruiser 2021',
      price: isAr ? '٨٥ دولار / يوم' : '$85 / Day',
      location: isAr ? 'صنعاء' : "Sana'a",
      badge: listings('rent'),
      badgeTone: 'rent' as const
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
      title: isAr ? 'فيلا في شارع السبعين' : 'Villa in Al-Sabeen Street',
      price: isAr ? '٩٥٠ دولار / شهر' : '$950 / Month',
      location: isAr ? 'صنعاء' : "Sana'a",
      badge: listings('rent'),
      badgeTone: 'rent' as const
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
      title: isAr ? 'كاميرا كانون 80D' : 'Canon 80D Camera',
      price: isAr ? '٤٥٠ دولار' : '$450',
      location: isAr ? 'صنعاء' : "Sana'a",
      badge: listings('sell'),
      badgeTone: 'sell' as const
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
      title: isAr ? 'دراجة هوائية' : 'Bicycle',
      price: isAr ? '١٥ دولار / يوم' : '$15 / Day',
      location: isAr ? 'صنعاء' : "Sana'a",
      badge: listings('rent'),
      badgeTone: 'rent' as const
    }
  ];

  const displayListings = liveListings.map(item => ({
    id: item.id,
    image: item.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    title: isAr ? (item.title_ar || item.title_en) : item.title_en,
    price: item.type === 'rent' ? `${item.price} ${item.currency || 'USD'} / ${isAr ? 'يوم' : 'Day'}` : `${item.price} ${item.currency || 'USD'}`,
    location: item.governorate === 'sanaa_city' ? (isAr ? 'أمانة العاصمة' : "Sana'a City") : (isAr ? 'صنعاء' : "Sana'a"),
    badge: item.type === 'sell' ? listings('sell') : listings('rent'),
    badgeTone: (item.type === 'sell' ? 'sell' : 'rent') as 'sell' | 'rent'
  }));

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950">
      <DeumahHeader />

      <main>
        {/* HERO SECTION MATCHING EXACT DEPLOYMENT VERCEL HTML/CSS */}
        <section className="relative isolate overflow-hidden bg-deumah-navy-950 text-white">
          <Image
            src="/hero_bg.png"
            alt="Sana'a skyline at sunset"
            fill
            sizes="100vw"
            priority
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-deumah-navy-950 via-deumah-navy-950/75 to-deumah-navy-950/25 rtl:bg-gradient-to-l" />

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            
            {/* Headline */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading">
                <span className="block">{hero('titleLine1')}</span>
                <span className="block text-deumah-green-600">{hero('titleLine2')}</span>
              </h1>
              <p className="mt-4 text-lg text-white/85">
                {hero('subtitle')}
              </p>
            </div>

            {/* SEARCH BAR (ALL CATEGORIES -> INPUT -> CITY -> SEARCH BUTTON) */}
            <div className="mt-8 grid gap-3 rounded-deumah-lg bg-white p-3 text-deumah-navy-950 shadow-deumah-search md:grid-cols-[180px_1fr_160px_auto]">
              
              {/* Category Select */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-deumah-sm border border-deumah-gray-200 px-4 py-3 text-sm bg-transparent outline-none cursor-pointer focus:border-deumah-green-600 transition"
              >
                <option value="">{search('allCategories')}</option>
                {categoryKeys.filter(k => k !== 'more').map((cat) => (
                  <option key={cat} value={cat}>{categories(cat)}</option>
                ))}
              </select>

              {/* Text Input */}
              <label className="flex items-center gap-3 rounded-deumah-sm px-3 border border-deumah-gray-200 md:border-none">
                <SearchIcon className="size-5 text-deumah-gray-500 shrink-0" />
                <input
                  aria-label={search('placeholder')}
                  placeholder={search('placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                />
              </label>

              {/* City Select */}
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-deumah-sm border border-deumah-gray-200 px-4 py-3 text-sm bg-transparent outline-none cursor-pointer focus:border-deumah-green-600 transition"
              >
                <option value="">{isAr ? 'المدينة' : 'City'}</option>
                {YEMEN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>{isAr ? c.ar : c.en}</option>
                ))}
              </select>

              {/* Search Button */}
              <Link
                href={searchUrl}
                className="rounded-deumah-sm bg-deumah-green-700 px-6 py-3 font-semibold text-white hover:bg-deumah-green-600 text-center flex items-center justify-center transition font-heading"
              >
                {search('button')}
              </Link>
            </div>

            {/* 4 ACTION BUTTON CARDS */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <ActionCard
                title={actions('rentTitle')}
                description={actions('rentDescription')}
                icon={<HomeIcon className="size-6" />}
                tone="rent"
              />
              <ActionCard
                title={actions('buyTitle')}
                description={actions('buyDescription')}
                icon={<CartIcon className="size-6" />}
                tone="buy"
              />
              <ActionCard
                title={actions('sellTitle')}
                description={actions('sellDescription')}
                icon={<TagIcon className="size-6" />}
                tone="sell"
              />
              <ActionCard
                title={actions('delivery')}
                description={actions('deliveryDescription')}
                icon={<TruckIcon className="size-6" />}
                tone="delivery"
              />
            </div>

            {/* Trusted Pill */}
            <div className="mt-4 flex justify-end">
              <div className="rounded-deumah bg-deumah-navy-900/85 px-5 py-3 text-sm">
                {hero('trusted')}
              </div>
            </div>

          </div>
        </section>

        {/* BROWSE CATEGORIES SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{categories('title')}</h2>
            <Link href="/listings" className="text-sm font-semibold text-deumah-green-700">
              {categories('viewAll')}
            </Link>
          </div>
          <div className="mt-5 flex overflow-x-auto gap-3 pb-3 sm:grid sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12 scrollbar-none snap-x snap-mandatory">
            {categoryKeys.map((key) => {
              const categoryUrl = key === 'more' ? '/listings' : `/listings?category=${key}`;
              return (
                <Link href={categoryUrl} key={key} className="shrink-0 w-[140px] sm:w-auto snap-start block">
                  <CategoryCard label={categories(key)} icon={<img src={`/deumah/icons/${key}.svg`} alt="" className="size-8 block object-contain" />} />
                </Link>
              );
            })}
          </div>
        </section>

        {/* FEATURED LISTINGS GRID (DYNAMICAL FROM SUPABASE) */}
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{listings('title')}</h2>
            <Link href="/listings" className="text-sm font-semibold text-deumah-green-700">
              {listings('viewAll')}
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayListings.length === 0 ? (
              <div className="col-span-full bg-white border border-deumah-gray-200 rounded-deumah p-8 text-center space-y-2 shadow-xs">
                <span className="text-3xl block">📦</span>
                <h3 className="text-sm font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'لا توجد إعلانات نشطة حالياً' : 'No active listings currently available'}
                </h3>
                <p className="text-xs text-deumah-gray-500 font-medium">
                  {isAr ? 'الإعلانات الموقوفة مؤقتاً تم إخفاؤها بنجاح.' : 'Paused or pending listings are hidden from public view until resumed or approved.'}
                </p>
              </div>
            ) : (
              displayListings.map((item) => (
                <div key={item.id} className="block hover:-translate-y-1 transition duration-300">
                  <ListingCard 
                    id={item.id}
                    image={item.image} 
                    title={item.title} 
                    price={item.price} 
                    location={item.location} 
                    badge={item.badge} 
                    badgeTone={item.badgeTone}
                    locale={locale}
                  />
                </div>
              ))
            )}
          </div>
        </section>

        {/* TRUST BANNER BAR */}
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-6 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-5 rounded-deumah bg-deumah-navy-950 p-6 text-white scrollbar-none snap-x snap-mandatory">
            {['verified', 'payments', 'delivery', 'support', 'safe'].map(key => (
              <div key={key} className="flex gap-3 shrink-0 w-[220px] sm:w-auto snap-start">
                <ShieldIcon className="size-7 shrink-0 text-deumah-gold-500" />
                <div>
                  <h3 className="font-semibold">{trust(key as never)}</h3>
                  <p className="mt-1 text-sm text-white/70">{trust(`${key}Description` as never)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMO CARDS */}
        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-deumah bg-deumah-green-100 p-7">
            <h2 className="text-2xl font-semibold text-deumah-green-700">{promos('postTitle')}</h2>
            <p className="mt-2 text-deumah-gray-500">{promos('postDescription')}</p>
            <Link href="/post-ad" className="mt-5 inline-block rounded-deumah-sm bg-deumah-green-700 px-5 py-3 font-semibold text-white text-center hover:bg-deumah-green-600 transition">
              {promos('postButton')}
            </Link>
          </article>
          
          <article className="rounded-deumah bg-white p-7 shadow-deumah-card">
            <h2 className="text-2xl font-semibold">{promos('shippingTitle')}</h2>
            <p className="mt-2 text-deumah-gray-500">{promos('shippingDescription')}</p>
            <button 
              onClick={() => setShippingModalOpen(true)}
              className="mt-5 rounded-deumah-sm bg-deumah-green-700 px-5 py-3 font-semibold text-white hover:bg-deumah-green-600 transition cursor-pointer"
            >
              {promos('shippingButton')}
            </button>
          </article>
        </section>
      </main>

      {/* Shipping Partners Modal */}
      {shippingModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 transition-opacity"
            onClick={() => setShippingModalOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-4 top-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-white rounded-deumah p-6 z-50 shadow-deumah-search overflow-y-auto max-h-[85vh] flex flex-col justify-between animate-scale-up">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-deumah-gray-100">
                <h3 className="font-extrabold text-lg text-deumah-navy-950 font-heading">
                  {isAr ? 'شركاء الشحن الدوليين' : 'International Shipping Partners'}
                </h3>
                <button 
                  onClick={() => setShippingModalOpen(false)}
                  className="text-deumah-gray-400 hover:text-deumah-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-4">
                <p className="text-xs text-deumah-gray-500 leading-relaxed font-medium">
                  {isAr 
                    ? 'منصة ديومة تتعاون مع أسرع واأمن شركات الشحن اللوجستي لنقل البضائع والمركبات والمعدات داخل وخارج اليمن:' 
                    : 'Deumah platform partners with top shipping and logistics operators for cargo, vehicle, and package shipping in Yemen:'}
                </p>

                <div className="space-y-2.5">
                  {[
                    { name: 'DHL Express Yemen', desc: isAr ? 'شحن جوي سريع دولي للمستندات والطلب الصغير' : 'International air express for documents & packages' },
                    { name: 'FedEx / Sab Express', desc: isAr ? 'شحن جوي وبري للبضائع التجارية' : 'Air & express freight for commercial goods' },
                    { name: 'Aramex Yemen', desc: isAr ? 'حلول التوصيل السريع والنقل اللوجستي المحلي' : 'Express courier and local logistics solutions' },
                    { name: 'Yemen Post (البريد اليمني)', desc: isAr ? 'خدمات النقل والشحن المحلي بجميع المحافظات' : 'Domestic postal and parcel services across governorates' }
                  ].map((partner, idx) => (
                    <div key={idx} className="p-3 bg-deumah-gray-50 border border-deumah-gray-200 rounded-deumah-sm flex items-start gap-3">
                      <span className="text-lg">🚚</span>
                      <div>
                        <h4 className="text-xs font-bold text-deumah-navy-950">{partner.name}</h4>
                        <p className="text-[10px] text-deumah-gray-500 font-medium">{partner.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-deumah-gray-100 flex justify-end">
              <button 
                onClick={() => setShippingModalOpen(false)}
                className="bg-deumah-navy-950 text-white text-xs font-bold px-5 py-2.5 rounded-deumah-sm hover:bg-deumah-navy-900 transition cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
