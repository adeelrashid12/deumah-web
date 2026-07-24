'use client';

import { useLocale, useTranslations } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          {/* Decorative premium radial background glow */}
          <div className="absolute inset-0 -m-10 bg-deumah-green-700/10 blur-3xl rounded-full" />
          
          {/* Branded Large 404 Display */}
          <h1 className="relative text-8xl md:text-9xl font-extrabold tracking-tight text-deumah-green-700 font-heading">
            404
          </h1>
        </div>

        <h2 className="text-xl md:text-2xl font-bold mb-3">
          {isAr ? 'عذراً، الصفحة غير موجودة!' : 'Page Not Found!'}
        </h2>

        <p className="text-deumah-gray-500 text-sm md:text-base max-w-md mb-8">
          {isAr
            ? 'يبدو أن الرابط الذي اتبعته غير صالح أو أن الصفحة قد تم نقلها أو حذفها.'
            : 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
        </p>

        <Link
          href="/"
          className="bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold px-6 py-3 rounded-deumah-sm text-sm transition shadow-sm"
        >
          {isAr ? 'العودة للرئيسية' : 'Go back home'}
        </Link>
      </main>

      <Footer />
    </div>
  );
}
