'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function MobileBottomNav() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const pathname = usePathname();

  const navItems = [
    {
      label: isAr ? 'الرئيسية' : 'Home',
      href: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: isAr ? 'بيع' : 'Sell',
      href: '/post-ad?type=sell',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: isAr ? 'بحث' : 'Search',
      href: '/listings',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      label: isAr ? 'تأجير' : 'Rent',
      href: '/post-ad?type=rent',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    },
    {
      label: isAr ? 'حسابي' : 'My Account',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-deumah-gray-200 z-50 px-2 py-2 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <ul className="flex justify-between items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]));
          return (
            <li key={item.label} className="flex-1 flex justify-center">
              <Link 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${
                  isActive ? 'text-deumah-green-700' : 'text-deumah-gray-500 hover:text-deumah-navy-950'
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-deumah-green-700' : 'text-deumah-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
