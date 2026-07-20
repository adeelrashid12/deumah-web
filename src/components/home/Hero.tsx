'use client';
import {useLocale, useTranslations} from 'next-intl';

export function Hero() {
  const t = useTranslations('home');
  const locale = useLocale();
  const title = t('title');
  const lines = title.split('\n');

  return (
    <section 
      className="relative w-full bg-cover bg-center overflow-hidden border-b border-deumah-border shadow-deumah"
      style={{ backgroundImage: `url('/hero_bg.png')` }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 rtl:bg-gradient-to-l"></div>

      {/* Centered content shell */}
      <div className="relative z-10 container-shell px-4 py-16 sm:py-20 lg:py-24">
        
        {/* Main Grid: Left Column holds Title, Search, and 4 Cards; Right Column holds Trusted Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-end w-full">
          
          {/* Left Column (Takes 4/5 width, perfectly aligned with the search bar) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Titles */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-tight">
                {lines[0]}
                {lines[1] && (
                  <span className="block text-[#22c55e] mt-1 lg:mt-2">
                    {lines[1]}
                  </span>
                )}
              </h1>
              <p className="mt-4 max-w-xl text-base text-gray-300 sm:text-lg font-bold">
                {t('subtitle')}
              </p>
            </div>

            {/* Search Form (Matches width of the 4 cards below) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center rounded-2xl bg-white p-2 text-deumah-navy gap-2 shadow-lg w-full">
              {/* Category Selector */}
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer shrink-0">
                <svg className="h-4.5 w-4.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 3h-11A1.5 1.5 0 005 4.5v16.5l7-4 7 4V4.5A1.5 1.5 0 0017.5 3z" />
                </svg>
                <span className="text-xs sm:text-sm font-black text-gray-700 whitespace-nowrap">{t('categories')}</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Input field */}
              <div className="flex-1 flex items-center min-w-0 px-2">
                <input 
                  aria-label={t('searchPlaceholder')} 
                  placeholder={t('searchPlaceholder')} 
                  className="w-full bg-transparent px-1 py-2 outline-none text-gray-800 placeholder-gray-400 text-xs sm:text-sm font-bold"
                />
              </div>

              {/* Location selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 cursor-pointer shrink-0">
                <svg className="h-4.5 w-4.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-black text-gray-700 whitespace-nowrap">Sana'a</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dark Forest Green Search Button */}
              <button 
                type="button" 
                className="rounded-xl bg-[#0a5c36] hover:bg-[#084a2b] px-8 py-3.5 text-xs sm:text-sm font-black text-white shadow-md transition duration-200 cursor-pointer shrink-0"
              >
                {t('search')}
              </button>
            </div>

            {/* 4 Action Cards (Width aligns perfectly with the search bar) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
              
              {/* Rent Card */}
              <button className="flex items-center gap-3 bg-[#0a5c36] border border-emerald-500/10 p-3.5 sm:p-4 rounded-2xl shadow-deumah hover:scale-[1.02] transition duration-200 text-start cursor-pointer group h-20">
                <svg className="h-9 w-9 text-white shrink-0 opacity-95 group-hover:opacity-100 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6" />
                </svg>
                <div>
                  <strong className="block text-sm sm:text-base font-extrabold text-white leading-none">{t('actions.rent.title')}</strong>
                  <span className="mt-1.5 block text-[10px] sm:text-xs text-white/90 font-medium leading-tight max-w-[130px]">{t('actions.rent.subtitle')}</span>
                </div>
              </button>

              {/* Buy Card */}
              <button className="flex items-center gap-3 bg-[#0c2340] border border-blue-500/10 p-3.5 sm:p-4 rounded-2xl shadow-deumah hover:scale-[1.02] transition duration-200 text-start cursor-pointer group h-20">
                <svg className="h-9 w-9 text-white shrink-0 opacity-95 group-hover:opacity-100 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                <div>
                  <strong className="block text-sm sm:text-base font-extrabold text-white leading-none">{t('actions.buy.title')}</strong>
                  <span className="mt-1.5 block text-[10px] sm:text-xs text-white/90 font-medium leading-tight max-w-[130px]">{t('actions.buy.subtitle')}</span>
                </div>
              </button>

              {/* Sell Card with Slanted Tag Icon */}
              <button className="flex items-center gap-3 bg-[#b45309] border border-amber-500/10 p-3.5 sm:p-4 rounded-2xl shadow-deumah hover:scale-[1.02] transition duration-200 text-start cursor-pointer group h-20">
                <svg className="h-9 w-9 text-white shrink-0 opacity-95 group-hover:opacity-100 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5l-6-6a2.25 2.25 0 010-3.18l3.18-3.18a2.25 2.25 0 013.18 0l6 6a2.25 2.25 0 01.66 1.6v4.5A2.25 2.25 0 0114.25 16h-4.5a2.25 2.25 0 01-1.6-.66z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                <div>
                  <strong className="block text-sm sm:text-base font-extrabold text-white leading-none">{t('actions.sell.title')}</strong>
                  <span className="mt-1.5 block text-[10px] sm:text-xs text-white/90 font-medium leading-tight max-w-[130px]">{t('actions.sell.subtitle')}</span>
                </div>
              </button>

              {/* Delivery Card */}
              <button className="flex items-center gap-3 bg-[#3b0764] border border-purple-500/10 p-3.5 sm:p-4 rounded-2xl shadow-deumah hover:scale-[1.02] transition duration-200 text-start cursor-pointer group h-20">
                <svg className="h-9 w-9 text-white shrink-0 opacity-95 group-hover:opacity-100 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div>
                  <strong className="block text-sm sm:text-base font-extrabold text-white leading-none">{t('actions.delivery.title')}</strong>
                  <span className="mt-1.5 block text-[10px] sm:text-xs text-white/90 font-medium leading-tight max-w-[130px]">{t('actions.delivery.subtitle')}</span>
                </div>
              </button>

            </div>
          </div>

          {/* Right Column (Takes 1/5 width, aligns at the bottom next to the cards) */}
          <div className="lg:col-span-1 w-full flex flex-col justify-end">
            
            {/* Trusted Users Badge */}
            <div className="bg-[#0f243b]/65 border border-deumah-border/80 rounded-2xl p-5 flex flex-row items-center justify-between gap-3 shadow-deumah w-full h-20">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider leading-tight">{locale === 'en' ? 'Trusted by thousands' : 'موثوق من آلاف'}</span>
                <span className="text-[10px] font-bold text-gray-500 leading-tight mt-0.5">{locale === 'en' ? 'of users' : 'المستخدمين'}</span>
              </div>
              
              <div className="flex items-center -space-x-3.5 rtl:space-x-reverse shrink-0">
                <img className="h-7 w-7 rounded-full border border-[#0c2340] object-cover shrink-0" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User 1" />
                <img className="h-7 w-7 rounded-full border border-[#0c2340] object-cover shrink-0" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User 2" />
                <img className="h-7 w-7 rounded-full border border-[#0c2340] object-cover shrink-0" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User 3" />
                <img className="h-7 w-7 rounded-full border border-[#0c2340] object-cover shrink-0" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="User 4" />
              </div>
              
              <svg className="h-6 w-6 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
          </div>

        </div>

      </div>

    </section>
  );
}
