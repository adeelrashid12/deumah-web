'use client';
import {useLocale, useTranslations} from 'next-intl';
import {ListingCard} from '@/components/listings/ListingCard';

const itemImages = [
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=80', // Toyota
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop&q=80', // Villa
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80', // Canon
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80', // Bicycle
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=80', // Apartment
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80', // iPhone
];

export function FeaturedListings() {
  const t = useTranslations('featured');
  const locale = useLocale();

  const isAr = locale === 'ar';

  const data = [0, 1, 2, 3, 4, 5].map((i) => ({
    title: t(`items.${i}.title`),
    price: t(`items.${i}.price`),
    location: t(`items.${i}.location`),
    category: t(`items.${i}.category`),
    image: itemImages[i],
  }));

  const gridContent = (
    <div className={`grid gap-5 grid-cols-2 ${isAr ? 'col-span-3 sm:grid-cols-3' : 'col-span-4 sm:grid-cols-3 lg:grid-cols-6'}`}>
      {data.map((x, i) => (
        <ListingCard key={i} listing={x} />
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

        <button className="flex items-center gap-1 text-sm font-bold text-deumah-green hover:text-deumah-green-soft transition duration-200 cursor-pointer">
          <span>{isAr ? 'عرض جميع الإعلانات' : 'View all listings'}</span>
          <svg className="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* Listings Grid */}
        {gridContent}

        {/* Sidebar Widgets (Only rendered in Arabic RTL view) */}
        {isAr && (
          <div className="col-span-1 flex flex-col gap-6">
            
            {/* Widget 1: Most Searched Tags */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-2 mb-3">
                الأكثر بحثاً
              </h3>
              <div className="flex flex-wrap gap-2">
                {['سيارات', 'شقق للإيجار', 'أجهزة إلكترونية', 'أدوات', 'ملابس', 'موبايلات', 'دراجات', 'عقارات', 'ألعاب'].map((tag) => (
                  <button key={tag} className="px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] sm:text-xs font-bold text-gray-600 border border-gray-200/50 hover:bg-emerald-50 hover:text-deumah-green hover:border-emerald-250 transition duration-200 cursor-pointer">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget 2: International Shipping Banner */}
            <div className="bg-[#f8fafc] border border-gray-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between items-center text-center gap-3">
              <img src="/globe.svg" alt="Globe" className="h-14 w-auto object-contain shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-gray-800">
                  خدمات الشحن الدولية
                </h4>
                <p className="mt-1 text-[11px] text-gray-400 font-bold leading-relaxed">
                  تصفح شركات الشحن الدولية الموثوقة والمدعومة في اليمن.
                </p>
              </div>
              <button className="w-full rounded-xl bg-deumah-green hover:bg-deumah-green-soft py-2 text-xs font-black text-white shadow-md transition duration-200 cursor-pointer">
                عرض الشركات
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
