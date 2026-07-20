'use client';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

const categoryKeys = [
  'vehicles',
  'properties',
  'electronics',
  'furniture',
  'services',
  'tools',
  'fashion',
  'kids',
  'sports',
  'more'
] as const;

// Inline SVG components for categories
function getCategoryIcon(key: string) {
  const baseClass = "h-10 w-10 shrink-0 transition duration-300 text-gray-800 group-hover:text-deumah-green";

  switch (key) {
    case 'vehicles':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11v6m0 0a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 0H5m4 4h.01M15 15h.01M9 7l1-3h4l1 3M5 11L3.6 13a1 1 0 00-.2.6V17a1 1 0 001 1H5m14-6l1.4 2a1 1 0 01.2.6V17a1 1 0 01-1 1h-1" />
        </svg>
      );
    case 'properties':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'electronics':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
          <circle cx="12" cy="18" r="1" />
          <line x1="10" y1="5" x2="14" y2="5" />
        </svg>
      );
    case 'furniture':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm0 0V6a2 2 0 012-2h12a2 2 0 012 2v3m-16 7h16M6 18v2m12-2v2" />
        </svg>
      );
    case 'services':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'tools':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 15.3l5.5-5.5a2.1 2.1 0 00-3-3l-5.5 5.5m3 3l-8.5 8.5H3v-3.2l8.5-8.5m3 3L12 12M9 5l3 3-6 6-3-3 6-6z" />
        </svg>
      );
    case 'fashion':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 2a2 2 0 00-2 2v2.5L4.5 8a1.5 1.5 0 00-.5 1.1V13a1 1 0 001 1h1.5v6a2 2 0 002 2h7a2 2 0 002-2v-6H19a1 1 0 001-1V9.1A1.5 1.5 0 0019.5 8L17 6.5V4a2 2 0 00-2-2H9zm3 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      );
    case 'kids':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 14.5a4 4 0 008 0M9.5 10v.01M14.5 10v.01M12 2a10 10 0 00-5.5 1.6M12 2a10 10 0 015.5 1.6" />
        </svg>
      );
    case 'sports':
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="9" cy="9" r="5" />
          <circle cx="15" cy="15" r="5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a5 5 0 010 8m6-8a5 5 0 010 8" />
        </svg>
      );
    case 'more':
    default:
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
        </svg>
      );
  }
}

export function Categories() {
  const t = useTranslations('categories');
  const homeT = useTranslations('home');
  const locale = useLocale();

  const isAr = locale === 'ar';

  const gridContent = (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-5 ${isAr ? 'col-span-3' : 'col-span-4 md:grid-cols-10'}`}>
      {categoryKeys.map((key) => (
        <button 
          key={key} 
          className="group flex flex-col items-center justify-center p-4 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:border-deumah-green hover:shadow-md transition duration-300 cursor-pointer h-[120px]"
        >
          {getCategoryIcon(key)}
          <span className="mt-3 text-xs font-bold text-gray-800 text-center tracking-tight truncate max-w-full">
            {t(key)}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <section className="container-shell py-10 bg-transparent">
      {/* Title Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-gray-400 font-semibold">
            {t('subtitle')}
          </p>
        </div>
        
        <Link href="/categories" className="flex items-center gap-1 text-sm font-bold text-deumah-green hover:text-deumah-green-soft transition duration-200">
          <span>{homeT('actions.rent.title') === 'Rent' ? 'View all categories' : 'عرض جميع التصنيفات'}</span>
          <svg className="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* Categories Grid (Col-Span-3 or 4 depending on locale) */}
        {gridContent}

        {/* Promo sidebar widget (Only rendered in Arabic version) */}
        {isAr && (
          <div className="col-span-1 rounded-3xl bg-[#f0fdf4] border border-emerald-200/50 p-6 flex flex-col justify-between relative overflow-hidden shadow-sm min-h-[120px]">
            {/* Background design accents */}
            <div className="absolute -bottom-8 -end-8 w-24 h-24 rounded-full bg-emerald-500/10 shrink-0"></div>
            
            <div className="z-10">
              <h3 className="text-lg font-black text-emerald-950 leading-tight">
                {isAr ? 'سجل سلعتك اليوم!' : 'List Your Item Today!'}
              </h3>
              <p className="mt-1.5 text-xs font-bold text-emerald-700/80 leading-relaxed">
                {isAr 
                  ? 'تواصل مع مستأجرين موثوقين في صنعاء والمحافظات الأخرى فوراً.'
                  : 'Connect with verified renters in Sana\'a and other cities instantly.'}
              </p>
            </div>
            
            <Link 
              href="/register" 
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-deumah-green hover:bg-deumah-green-soft px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition duration-200 cursor-pointer w-full text-center"
            >
              {isAr ? 'ابدأ الآن' : 'Get Started'}
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
