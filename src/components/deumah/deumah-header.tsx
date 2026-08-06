'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { HeartIcon, MenuIcon, PinIcon } from './icons';
import { supabase } from '@/lib/supabase';
import { NotificationDropdown } from './notification-dropdown';

const CITIES_MAP: Record<string, { en: string; ar: string }> = {
  sanaa_city: { en: "Sana'a City", ar: "أمانة العاصمة" },
  sanaa: { en: "Sana'a", ar: "صنعاء" },
  aden: { en: "Aden", ar: "عدن" },
  taiz: { en: "Taiz", ar: "تعز" },
  ibb: { en: "Ibb", ar: "إب" },
  hadhramaut: { en: "Hadhramaut", ar: "حضرموت" },
  al_hudaydah: { en: "Al Hudaydah", ar: "الحديدة" },
  al_mahrah: { en: "Al Mahrah", ar: "المهرة" },
  al_jawf: { en: "Al Jawf", ar: "الجوف" },
  al_bayda: { en: "Al Bayda", ar: "البيضاء" },
  dhamar: { en: "Dhamar", ar: "ذمار" },
  hajjah: { en: "Hajjah", ar: "حجة" },
  lahij: { en: "Lahij", ar: "لحج" },
  marib: { en: "Marib", ar: "مأرب" },
  sadah: { en: "Sa'dah", ar: "صعدة" },
  shabwah: { en: "Shabwah", ar: "شبوة" },
  abyan: { en: "Abyan", ar: "أبين" },
  al_dhalee: { en: "Al Dhale'e", ar: "الضالع" },
  amran: { en: "Amran", ar: "عمران" },
  raymah: { en: "Raymah", ar: "ريمة" },
  al_mahwit: { en: "Al Mahwit", ar: "المحويت" },
  socotra: { en: "Socotra", ar: "سقطرى" }
};

export function DeumahHeader() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const activeCityName = CITIES_MAP[cityParam]
    ? (locale === 'ar' ? CITIES_MAP[cityParam].ar : CITIES_MAP[cityParam].en)
    : (locale === 'ar' ? 'صنعاء' : "Sana'a");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial authentication state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for authentication changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = `/${locale}/login`;
  };

  return (
    <header className="bg-deumah-navy-950 text-white relative z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <img 
            src={locale === 'ar' ? '/arabic logo without bg.png' : '/final logo without bg.png'} 
            alt="Deumah" 
            className="h-10 sm:h-12 w-auto object-contain" 
          />
        </Link>
        
        <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Primary">
          <Link href="/listings?type=rent">{t('rent')}</Link>
          <Link href="/listings?type=sell">{t('buy')}</Link>
          <Link href="/post-ad">{t('sell')}</Link>
          <Link href="/listings?delivery=true">{t('delivery')}</Link>
          <Link href="/listings?category=services">{t('services')}</Link>
          <Link href="/listings">{t('more')}</Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-deumah-sm border border-white/15 px-3 py-2 text-sm md:flex">
            <PinIcon className="size-4"/>{activeCityName}
          </button>
          
          <Link href={pathname} locale={locale === 'ar' ? 'en' : 'ar'} className="rounded-deumah-sm border border-white/15 px-3 py-2 text-sm">
            {locale === 'ar' ? 'English' : 'العربية'}
          </Link>
          
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <NotificationDropdown userId={user.id} />
              
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 bg-deumah-green-700 hover:bg-deumah-green-600 px-4 py-2 rounded-deumah-sm text-sm font-bold text-white transition shadow-sm"
              >
                <span>👤</span>
                <span>{user.user_metadata?.full_name || (locale === 'ar' ? 'لوحة التحكم' : 'Dashboard')}</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-deumah-sm border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition cursor-pointer"
              >
                {locale === 'ar' ? 'خروج' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-deumah-sm border border-white/20 px-4 py-2 text-sm md:block">
                {t('login')}
              </Link>
              
              <Link href="/register" className="hidden rounded-deumah-sm bg-deumah-green-700 px-4 py-2 text-sm font-semibold md:block">
                {t('signup')}
              </Link>
            </>
          )}

          <button 
            aria-label="Menu" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 hover:bg-white/10 lg:hidden"
          >
            <MenuIcon className="size-6"/>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-72 bg-deumah-navy-950 border-l rtl:border-l-0 rtl:border-r border-white/10 p-6 z-50 shadow-deumah-search flex flex-col justify-between lg:hidden transition-transform animate-slide-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="font-bold font-heading text-lg">
                  {locale === 'ar' ? 'القائمة' : 'Menu'}
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/60 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-4 text-sm font-semibold">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition flex items-center gap-2 border-b border-white/10 pb-3">
                  🏠 {locale === 'ar' ? 'الرئيسية' : 'Home'}
                </Link>
                <Link href="/listings?type=rent" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition">
                  {t('rent')}
                </Link>
                <Link href="/listings?type=sell" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition">
                  {t('buy')}
                </Link>
                <Link href="/post-ad" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition">
                  {t('sell')}
                </Link>
                <Link href="/listings?delivery=true" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition">
                  {t('delivery')}
                </Link>
                <Link href="/listings?category=services" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition">
                  {t('services')}
                </Link>
                <Link href="/listings" onClick={() => setMobileMenuOpen(false)} className="hover:text-deumah-green-600 transition">
                  {t('more')}
                </Link>
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center w-full rounded-deumah-sm bg-deumah-green-700 py-2.5 text-sm font-bold"
                  >
                    👤 {user.user_metadata?.full_name || (locale === 'ar' ? 'لوحة التحكم' : 'Dashboard')}
                  </Link>
                  <button 
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="block text-center w-full rounded-deumah-sm border border-white/20 py-2.5 text-sm font-bold text-white/80 hover:text-white"
                  >
                    {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center w-full rounded-deumah-sm border border-white/20 py-2.5 text-sm font-bold"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center w-full rounded-deumah-sm bg-deumah-green-700 py-2.5 text-sm font-bold"
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
