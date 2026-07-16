"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

// Flat Vector SVG Icons
const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="w-3.5 h-3.5 text-blue-600 fill-none stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-8 h-8 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SupportIcon = () => (
  <svg className="w-8 h-8 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M5.636 5.636l3.536 3.536m0 5.656l-3.536 3.536M9.172 9.172a4 4 0 115.656 5.656 4 4 0 01-5.656-5.656z" />
  </svg>
);

const CATEGORIES = [
  { id: 'vehicles', nameEn: 'Cars', nameAr: 'سيارات', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=80' },
  { id: 'properties', nameEn: 'Apartments', nameAr: 'شقق وعقارات', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80' },
  { id: 'electronics', nameEn: 'Electronics', nameAr: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80' },
  { id: 'clothing', nameEn: 'Events', nameAr: 'فعاليات ومناسبات', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&auto=format&fit=crop&q=80' },
  { id: 'tools', nameEn: 'Tools', nameAr: 'أدوات ومعدات', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80' },
];

const MOCK_LISTINGS = [
  {
    id: 1,
    titleEn: "Tesla Model Y Performance",
    titleAr: "تسلا موديل Y أداء عالي",
    type: "rent",
    category: "vehicles",
    price: 99,
    pricePeriodEn: "day",
    pricePeriodAr: "يوم",
    locationEn: "Downtown Dubai",
    locationAr: "وسط مدينة دبي",
    distance: 2.4,
    rating: 4.9,
    verified: true,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    titleEn: "BMW M4 Competition",
    titleAr: "بي إم دبليو M4 كومبتيشن",
    type: "rent",
    category: "vehicles",
    price: 199,
    pricePeriodEn: "day",
    pricePeriodAr: "يوم",
    locationEn: "Jumeirah, Dubai",
    locationAr: "جميرا، دبي",
    distance: 3.5,
    rating: 5.0,
    verified: true,
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    titleEn: "Range Rover Sport HSE",
    titleAr: "رينج روفر سبورت HSE",
    type: "rent",
    category: "vehicles",
    price: 150,
    pricePeriodEn: "day",
    pricePeriodAr: "يوم",
    locationEn: "Marina, Dubai",
    locationAr: "مرسى دبي",
    distance: 5.1,
    rating: 4.8,
    verified: false,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    titleEn: "Yamaha R1 Superbike",
    titleAr: "دراجة ياماها R1 نارية سريعة",
    type: "rent",
    category: "vehicles",
    price: 60,
    pricePeriodEn: "day",
    pricePeriodAr: "يوم",
    locationEn: "Deira, Dubai",
    locationAr: "ديرة، دبي",
    distance: 6.0,
    rating: 4.85,
    verified: true,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    titleEn: "Cozy Studio Near Metro",
    titleAr: "استوديو مريح بالقرب من المترو",
    type: "rent",
    category: "properties",
    price: 35,
    pricePeriodEn: "day",
    pricePeriodAr: "يوم",
    locationEn: "Al Barsha, Dubai",
    locationAr: "البرشاء، دبي",
    distance: 1.1,
    rating: 4.6,
    verified: false,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    titleEn: "Modern Luxury Apartment",
    titleAr: "شقة عصرية فاخرة",
    type: "rent",
    category: "properties",
    price: 120,
    pricePeriodEn: "day",
    pricePeriodAr: "يوم",
    locationEn: "Palm Jumeirah",
    locationAr: "نخلة جميرا",
    distance: 8.7,
    rating: 4.75,
    verified: true,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=80"
  }
];

export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<'rent' | 'sale'>('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  const filteredListings = MOCK_LISTINGS.filter(item => {
    const matchesTab = item.type === activeTab;
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    
    const title = locale === 'en' ? item.titleEn.toLowerCase() : item.titleAr;
    const location = locale === 'en' ? item.locationEn.toLowerCase() : item.locationAr;
    const matchesSearch = searchQuery 
      ? (title.includes(searchQuery.toLowerCase()) || location.includes(searchQuery.toLowerCase()))
      : true;

    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-[#0F172A] w-full max-w-full overflow-x-hidden">
      
      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800/60 shadow-md w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo with official brand mark */}
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={locale === 'ar' ? '/arabic logo without bg.png' : '/final logo without bg.png'} 
              alt="Deumah Logo" 
              className="h-10 sm:h-18 w-auto object-contain brightness-100" 
            />
          </div>

          {/* Navigation Menu - Explicit text-white on each link for maximum brightness */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold">
            <a href="#" className="text-white hover:text-[#10B981] transition-colors">{locale === 'en' ? 'Home' : 'الرئيسية'}</a>
            <a href="#" className="text-white hover:text-[#10B981] transition-colors">{locale === 'en' ? 'Rent' : 'تأجير'}</a>
            <a href="#" className="text-white hover:text-[#10B981] transition-colors">{locale === 'en' ? 'Buy' : 'شراء'}</a>
            <a href="#" className="text-white hover:text-[#10B981] transition-colors">{locale === 'en' ? 'Sell' : 'بيع'}</a>
            <a href="#" className="text-white hover:text-[#10B981] transition-colors">{locale === 'en' ? 'Services' : 'الخدمات'}</a>
            <a href="#" className="text-white hover:text-[#10B981] transition-colors">{locale === 'en' ? 'About Us' : 'من نحن'}</a>
          </nav>

          {/* Action Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-[#162238] text-[10px] sm:text-xs font-bold text-[#10B981] hover:bg-[#1f2f4c] transition cursor-pointer"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </button>

            <button className="px-3.5 py-2 rounded-lg bg-[#10B981] hover:bg-[#0ea572] text-white text-[10px] sm:text-xs font-black tracking-wide shadow-sm hover:-translate-y-0.5 transition cursor-pointer">
              {locale === 'en' ? 'Sign In' : 'تسجيل الدخول'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section 
        className="relative bg-cover bg-center text-white pt-20 pb-32 sm:py-28 sm:pb-40 border-b border-slate-900 overflow-hidden"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&auto=format&fit=crop&q=80')" 
        }}
      >
        {/* Dark Navy Tint Overlay (70% opacity for high-contrast text prominence) */}
        <div className="absolute inset-0 bg-[#0F172A]/70 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight text-white">
              {locale === 'en' ? (
                <>Everything<br/>you need,<br/>anytime, anywhere.</>
              ) : (
                <>كل ما تحتاجه،<br/>في أي وقت،<br/>وفي أي مكان.</>
              )}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white font-medium leading-relaxed max-w-lg">
              {locale === 'en' ? (
                <>Rent anything. Buy with confidence.<br/>Sell easily. We deliver.</>
              ) : (
                <>استأجر أي شيء. اشتري بثقة.<br/>بع بسهولة. نحن نوصل.</>
              )}
            </p>

            {/* Search form */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 max-w-lg">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white rounded-xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400 shadow-md"
              />
              <button className="px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#0ea572] active:scale-95 text-white text-sm font-extrabold shadow-md transition-all cursor-pointer">
                {locale === 'en' ? 'Search' : 'ابحث'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 flex flex-col gap-16 relative w-full max-w-full overflow-x-hidden">
        
        {/* Quick action buttons */}
        <div className="-mt-16 sm:-mt-24 w-full min-w-0 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#e2e8f0] shadow-xl relative z-25 grid grid-cols-4 divide-x rtl:divide-x-reverse divide-[#e2e8f0] overflow-hidden">
          
          {/* Rent */}
          <div className="group py-5 sm:py-10 px-2 sm:px-6 flex flex-col items-center text-center gap-1 sm:gap-2 hover:bg-slate-50/50 transition duration-200 cursor-pointer">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-[0.75rem] sm:rounded-[1.25rem] bg-emerald-50 text-[#10B981] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#10B981] group-hover:text-white transition duration-300">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 11L9 4h6l2 7M4 11h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM6 19v2M18 19v2" />
                <circle cx="6" cy="15" r="1.2" fill="currentColor" />
                <circle cx="18" cy="15" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xs sm:text-base font-extrabold text-[#0F172A] mt-1.5 sm:mt-3">{locale === 'en' ? 'Rent' : 'تأجير'}</h3>
            <p className="hidden sm:block text-xs text-slate-700 font-semibold max-w-[170px] leading-relaxed mt-1">{locale === 'en' ? 'Rent anything you need' : 'استأجر أي شيء تحتاجه'}</p>
          </div>

          {/* Buy */}
          <div className="group py-5 sm:py-10 px-2 sm:px-6 flex flex-col items-center text-center gap-1 sm:gap-2 hover:bg-slate-50/50 transition duration-200 cursor-pointer">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-[0.75rem] sm:rounded-[1.25rem] bg-emerald-50 text-[#10B981] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#10B981] group-hover:text-white transition duration-300">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
            </div>
            <h3 className="text-xs sm:text-base font-extrabold text-[#0F172A] mt-1.5 sm:mt-3">{locale === 'en' ? 'Buy' : 'شراء'}</h3>
            <p className="hidden sm:block text-xs text-slate-700 font-semibold max-w-[170px] leading-relaxed mt-1">{locale === 'en' ? 'Buy with confidence' : 'اشتري بكل ثقة وأمان'}</p>
          </div>

          {/* Sell */}
          <div className="group py-5 sm:py-10 px-2 sm:px-6 flex flex-col items-center text-center gap-1 sm:gap-2 hover:bg-slate-50/50 transition duration-200 cursor-pointer">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-[0.75rem] sm:rounded-[1.25rem] bg-emerald-50 text-[#10B981] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#10B981] group-hover:text-white transition duration-300">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
              </svg>
            </div>
            <h3 className="text-xs sm:text-base font-extrabold text-[#0F172A] mt-1.5 sm:mt-3">{locale === 'en' ? 'Sell' : 'بيع'}</h3>
            <p className="hidden sm:block text-xs text-slate-700 font-semibold max-w-[170px] leading-relaxed mt-1">{locale === 'en' ? 'List and sell easily' : 'اعرض أشيائك وبعها بسهولة'}</p>
          </div>

          {/* Delivery */}
          <div className="group py-5 sm:py-10 px-2 sm:px-6 flex flex-col items-center text-center gap-1 sm:gap-2 hover:bg-slate-50/50 transition duration-200 cursor-pointer">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-[0.75rem] sm:rounded-[1.25rem] bg-emerald-50 text-[#10B981] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#10B981] group-hover:text-white transition duration-300">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3 className="text-xs sm:text-base font-extrabold text-[#0F172A] mt-1.5 sm:mt-3">{locale === 'en' ? 'Delivery' : 'توصيل'}</h3>
            <p className="hidden sm:block text-xs text-slate-700 font-semibold max-w-[170px] leading-relaxed mt-1">{locale === 'en' ? 'Fast and safe delivery' : 'توصيل سريع وآمن'}</p>
          </div>
        </div>

        {/* Category filtering tab control */}
        <div className="flex justify-center mt-6">
          <div className="bg-slate-100 p-1.5 rounded-[1.25rem] sm:rounded-[1.5rem] flex gap-1 border border-slate-200/60 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('rent');
                setSelectedCategory(null);
              }}
              className={`px-6 sm:px-10 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'rent'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('forRent')}
            </button>
            <button
              onClick={() => {
                setActiveTab('sale');
                setSelectedCategory(null);
              }}
              className={`px-6 sm:px-10 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'sale'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('forSale')}
            </button>
          </div>
        </div>

        {/* Popular Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">
              {locale === 'en' ? 'Popular Categories' : 'الفئات الأكثر شعبية'}
            </h2>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm font-bold text-[#10B981] hover:underline cursor-pointer"
            >
              {locale === 'en' ? 'View all' : 'عرض الكل'}
            </button>
          </div>

          <div className="w-full min-w-0 flex md:grid md:grid-cols-5 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`group bg-white rounded-2xl border overflow-hidden flex flex-col cursor-pointer transition duration-300 w-[140px] sm:w-[170px] md:w-auto flex-shrink-0 snap-start ${
                  selectedCategory === cat.id
                    ? 'border-[#10B981] ring-4 ring-[#10B981]/15 shadow-md shadow-emerald-500/5'
                    : 'border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#10B981]/40 hover:shadow-emerald-500/5'
                }`}
              >
                {/* Category Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={locale === 'en' ? cat.nameEn : cat.nameAr}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                {/* Category Name Area */}
                <div className="py-3 px-4 text-center border-t border-slate-100/60 bg-white">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    {locale === 'en' ? cat.nameEn : cat.nameAr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Listings */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-black text-slate-900">
            {locale === 'en' ? 'Featured Items' : 'العروض المميزة'}
          </h2>

          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-[#F8FAFC] rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-bold text-sm">
                {locale === 'en' ? 'No items found matching your filters.' : 'لم نجد أي إعلانات تطابق خيارات البحث.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map((item) => (
                <div key={item.id} className="group flex flex-col bg-white overflow-hidden cursor-pointer rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
                  
                  {/* Clean Image Card */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={locale === 'en' ? item.titleEn : item.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Rating badge */}
                    <div className={`absolute top-3 ${locale === 'ar' ? 'left-3' : 'right-3'} bg-white py-1 px-2 rounded-lg flex items-center gap-1 shadow-sm`}>
                      <StarIcon />
                      <span className="text-[11px] font-extrabold text-slate-900">{item.rating}</span>
                    </div>

                    {/* Transaction tag */}
                    <div className={`absolute bottom-3 ${locale === 'ar' ? 'right-3' : 'left-3'} bg-white py-1 px-2 rounded-lg text-[10px] font-bold text-slate-800 border border-slate-100 shadow-sm uppercase`}>
                      {item.type === 'rent' ? t('forRent') : t('forSale')}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      {/* Verified Badge */}
                      {item.verified && (
                        <div className="inline-flex items-center gap-1 text-[#10B981] text-xs font-bold mb-1">
                          <VerifiedIcon />
                          <span>{t('verified')}</span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#10B981] transition-colors">
                        {locale === 'en' ? item.titleEn : item.titleAr}
                      </h3>
                      
                      {/* Location */}
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                        <LocationIcon />
                        <span>{locale === 'en' ? item.locationEn : item.locationAr}</span>
                        <span>•</span>
                        <span>{t('distance', { distance: item.distance })}</span>
                      </div>

                      {/* Dynamic 5-Star Rating System */}
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const starValue = index + 1;
                            const isFilled = starValue <= Math.round(item.rating);
                            return (
                              <svg
                                key={index}
                                className={`w-3.5 h-3.5 ${isFilled ? 'fill-current text-amber-500' : 'text-slate-200 fill-current'}`}
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500">({item.rating})</span>
                      </div>
                    </div>

                    {/* Price and Details button */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-lg font-black text-slate-900">
                          {locale === 'en' ? `$${item.price}` : `د.إ ${item.price}`}
                        </span>
                        {item.type === 'rent' && (
                          <span className="text-[10px] font-bold text-slate-400 ml-1 mr-1 uppercase">
                            / {locale === 'en' ? t('day') : 'يوم'}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                        <span>{locale === 'en' ? 'View Details' : 'التفاصيل'}</span>
                        <span className="group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform duration-200">
                          {locale === 'en' ? '→' : '←'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Page Footer */}
      <footer className="bg-[#0F172A] text-white border-t border-slate-800/80 py-16">
        
        {/* Security & Support badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-[#1e293b] md:divide-x rtl:divide-x-reverse">
            
            {/* Trusted & Secure */}
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 11 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white leading-snug">{locale === 'en' ? 'Trusted & Secure' : 'موثوق وآمن'}</h4>
                <p className="text-xs text-white mt-0.5 leading-relaxed">{locale === 'en' ? 'Your safety is our priority.' : 'أمانك هو أولويتنا.'}</p>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white leading-snug">{locale === 'en' ? '24/7 Support' : 'دعم 24/7'}</h4>
                <p className="text-xs text-white mt-0.5 leading-relaxed">{locale === 'en' ? "We're here to help you anytime." : 'نحن هنا لمساعدتك في أي وقت.'}</p>
              </div>
            </div>

            {/* Secure Payments */}
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#10B981] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white leading-snug">{locale === 'en' ? 'Secure Payments' : 'مدفوعات آمنة'}</h4>
                <p className="text-xs text-white mt-0.5 leading-relaxed">{locale === 'en' ? 'Pay safely with multiple options.' : 'ادفع بأمان عبر خيارات متعددة.'}</p>
              </div>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-2xl font-black tracking-tight">Deumah</span>
            <p className="text-xs text-white leading-relaxed">
              {locale === 'en' ? 'Rent or buy anything you need, or list your items for extra income.' : 'استأجر أو اشتري أي شيء تحتاجه، أو اعرض أشيائك لدخل إضافي.'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4">{locale === 'en' ? 'Company' : 'الشركة'}</h4>
            <ul className="space-y-2 text-xs text-white">
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'About Us' : 'من نحن'}</a></li>
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Careers' : 'الوظائف'}</a></li>
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Blog' : 'المدونة'}</a></li>
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Press' : 'الصحافة'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4">{locale === 'en' ? 'Support' : 'الدعم'}</h4>
            <ul className="space-y-2 text-xs text-white">
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Help Center' : 'مركز المساعدة'}</a></li>
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Contact Us' : 'اتصل بنا'}</a></li>
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Terms of Service' : 'شروط الخدمة'}</a></li>
              <li><a href="#" className="hover:text-[#10B981] transition">{locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4">{locale === 'en' ? 'Follow Us' : 'تابعنا'}</h4>
            <div className="flex gap-3">
              {/* Facebook */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-[#10B981] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              
              {/* Twitter / X */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-[#10B981] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-[#10B981] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-[#10B981] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 Deumah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
