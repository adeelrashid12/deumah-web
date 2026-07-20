'use client';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname, useRouter} from '@/i18n/navigation';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const other = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, {locale: other});
  };

  return (
    <header className="border-b border-deumah-border bg-deumah-navy/95 sticky top-0 z-50 backdrop-blur-sm shadow-md">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img 
            src={locale === 'ar' ? '/arabic logo without bg.png' : '/final logo without bg.png'} 
            alt="Deumah" 
            className="h-10 sm:h-12 w-auto object-contain brightness-100" 
          />
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white">
          <Link href="/" className="text-white hover:text-deumah-green transition duration-200">
            {t('home')}
          </Link>
          <Link href="/listings?type=rent" className="text-white hover:text-deumah-green transition duration-200">
            {t('rent')}
          </Link>
          <Link href="/listings?type=buy" className="text-white hover:text-deumah-green transition duration-200">
            {t('buy')}
          </Link>
          <Link href="/listings?type=sell" className="text-white hover:text-deumah-green transition duration-200">
            {t('sell')}
          </Link>
          <Link href="/delivery" className="text-white hover:text-deumah-green transition duration-200">
            {t('delivery')}
          </Link>
          <Link href="/services" className="text-white hover:text-deumah-green transition duration-200">
            {t('services')}
          </Link>
          <div className="flex items-center gap-1 hover:text-deumah-green cursor-pointer transition duration-200">
            <span>{t('more')}</span>
            <svg className="h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </nav>

        {/* Right Side: Options & Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-xl border border-deumah-border bg-deumah-panel/60 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:border-gray-500 transition duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.003 9.003 0 008.367-13.011M12 21a9.003 9.003 0 01-8.367-13.011m16.734 0a9 9 0 00-16.734 0m16.734 0a9.003 9.003 0 01-8.367 3.011M12 2a9 9 0 018.367 6.011M12 2a9 9 0 00-8.367 6.011" />
            </svg>
            <span className="hidden sm:inline">{locale === 'en' ? 'English' : 'العربية'}</span>
            <svg className="h-3.5 w-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Location Pin */}
          <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-white hover:text-deumah-green transition duration-200 cursor-pointer">
            <svg className="h-4.5 w-4.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('sanaa')}</span>
          </div>

          {/* Wishlist */}
          <Link href="/favorites" className="text-white hover:text-deumah-green transition duration-200" aria-label="Favorites">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>

          {/* Notifications */}
          <Link href="/messages" className="text-white hover:text-deumah-green transition duration-200 relative" aria-label="Notifications">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-deumah-green shrink-0"></span>
          </Link>

          {/* Log In & Sign Up buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/login" 
              className="flex items-center justify-center rounded-xl border border-deumah-border bg-deumah-panel/40 px-4.5 py-2.5 text-xs sm:text-sm font-bold text-white hover:border-gray-500 transition duration-200 cursor-pointer"
            >
              {t('login')}
            </Link>
            <Link 
              href="/register" 
              className="rounded-xl bg-deumah-green px-4.5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-deumah-green-soft transition duration-200 shadow-md"
            >
              {t('signup')}
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}
