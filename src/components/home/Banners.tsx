'use client';
import {useLocale, useTranslations} from 'next-intl';

export function Banners() {
  const t = useTranslations('home');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="container-shell pb-16 bg-transparent flex flex-col gap-10">
      
      {/* 1. Dark Features Bar */}
      <div className="bg-deumah-panel border border-deumah-border rounded-3xl p-6 shadow-deumah grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-deumah-border/80">
        
        {/* Badge 1 */}
        <div className="flex items-center gap-3.5 p-2 md:p-0 md:justify-center">
          <svg className="h-8 w-8 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'بائعين موثوقين' : 'Verified Sellers'}</h4>
            <p className="text-[10px] sm:text-xs text-white font-bold mt-0.5">{isAr ? 'تم التحقق من هويتهم' : 'Trusted & verified sellers'}</p>
          </div>
        </div>

        {/* Badge 2 */}
        <div className="flex items-center gap-3.5 p-2 md:p-0 md:justify-center pt-4 md:pt-0">
          <svg className="h-8 w-8 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'دفع آمن' : 'Secure Payments'}</h4>
            <p className="text-[10px] sm:text-xs text-white font-bold mt-0.5">{isAr ? 'حماية لجميع طرق الدفع' : 'Your payments are protected'}</p>
          </div>
        </div>

        {/* Badge 3 */}
        <div className="flex items-center gap-3.5 p-2 md:p-0 md:justify-center pt-4 md:pt-0">
          <svg className="h-8 w-8 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'توصيل سريع' : 'Fast Delivery'}</h4>
            <p className="text-[10px] sm:text-xs text-white font-bold mt-0.5">{isAr ? 'توصيل سريع وموثوق' : 'Quick & reliable delivery'}</p>
          </div>
        </div>

        {/* Badge 4 */}
        <div className="flex items-center gap-3.5 p-2 md:p-0 md:justify-center pt-4 md:pt-0">
          <svg className="h-8 w-8 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'دعم على مدار الساعة' : '24/7 Support'}</h4>
            <p className="text-[10px] sm:text-xs text-white font-bold mt-0.5">{isAr ? 'فريقنا جاهز لمساعدتك' : "We're here to help you"}</p>
          </div>
        </div>

        {/* Badge 5 */}
        <div className="flex items-center gap-3.5 p-2 md:p-0 md:justify-center pt-4 md:pt-0">
          <svg className="h-8 w-8 text-[#eab308] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">{isAr ? 'أمن وموثوق' : 'Safe & Secure'}</h4>
            <p className="text-[10px] sm:text-xs text-white font-bold mt-0.5">{isAr ? 'تجربة آمنة للجميع' : 'A safe experience for everyone'}</p>
          </div>
        </div>

      </div>

      {/* 2. Post Your Ad Banner */}
      <div className="rounded-3xl bg-[#f0fdf4]/50 border border-emerald-100/30 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 leading-tight">
            {isAr ? 'انشر إعلانك مجاناً وتواصل مع آلاف المشترين' : 'Post Your Ad for Free and Reach Thousands of Buyers'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-400 leading-relaxed">
            {isAr ? 'انضم إلى آلاف الأشخاص الذين يبيعون ويشترون على دومه.' : 'Join thousands of people who are already buying and selling on Deumah.'}
          </p>
        </div>
        
        <button className="flex items-center gap-2 rounded-xl bg-deumah-green hover:bg-deumah-green-soft px-6 py-3 font-extrabold text-white shadow-md transition duration-200 cursor-pointer text-xs sm:text-sm shrink-0">
          <span>{isAr ? '+ انشر إعلانك الآن' : '+ Post Your Ad'}</span>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* 3. International Shipping Services Banner (Only rendered on LTR English layout) */}
      {!isAr && (
        <div className="rounded-3xl bg-slate-50 border border-slate-200/60 p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-start z-10">
            <img src="/globe.svg" alt="Globe" className="h-16 w-auto object-contain shrink-0" />
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 leading-tight">
                International Shipping Services
              </h3>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-400 leading-relaxed">
                View trusted international shipping companies and their contact information.
              </p>
            </div>
          </div>
          
          <button className="rounded-xl bg-deumah-green hover:bg-deumah-green-soft px-6 py-3 font-extrabold text-white shadow-md transition duration-200 cursor-pointer text-xs sm:text-sm z-10 shrink-0">
            View Companies
          </button>
        </div>
      )}

    </section>
  );
}
