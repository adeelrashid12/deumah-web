'use client';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  const navT = useTranslations('nav');
  const catT = useTranslations('categories');
  const locale = useLocale();

  const isAr = locale === 'ar';

  return (
    <footer className="border-t border-deumah-border bg-deumah-navy py-12 text-sm text-white">
      <div className="container-shell">
        
        {/* Main Grid: 6 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 xl:gap-8 pb-10">
          
          {/* Column 1: Logo & Description */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center shrink-0">
              <img 
                src={isAr ? '/arabic logo without bg.png' : '/final logo without bg.png'} 
                alt="Deumah" 
                className="h-10 w-auto object-contain brightness-100" 
              />
            </Link>
            <p className="text-xs text-white leading-relaxed font-semibold">
              {isAr ? 'دومه هي منصتك المتكاملة لتأجير وشراء وبيع كل شيء في اليمن بسهولة وأمان.' : 'Deumah is your all-in-one platform to rent, buy, sell, and get things delivered easily and safely.'}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-white text-sm tracking-tight whitespace-nowrap">{isAr ? 'روابط سريعة' : 'Quick Links'}</h3>
            <div className="flex flex-col gap-2 font-bold text-white">
              <Link href="/listings?type=rent" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{navT('rent')}</Link>
              <Link href="/listings?type=buy" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{navT('buy')}</Link>
              <Link href="/listings?type=sell" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{navT('sell')}</Link>
              <Link href="/delivery" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{navT('delivery')}</Link>
              <Link href="/services" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{navT('services')}</Link>
            </div>
          </div>

          {/* Column 3: Categories */}
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-white text-sm tracking-tight whitespace-nowrap">{isAr ? 'التصنيفات' : 'Categories'}</h3>
            <div className="flex flex-col gap-2 font-bold text-white">
              <Link href="/listings?category=vehicles" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{catT('vehicles')}</Link>
              <Link href="/listings?category=properties" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{catT('properties')}</Link>
              <Link href="/listings?category=electronics" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{catT('electronics')}</Link>
              <Link href="/listings?category=furniture" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{catT('furniture')}</Link>
              <Link href="/categories" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{catT('more')}</Link>
            </div>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-white text-sm tracking-tight whitespace-nowrap">{isAr ? 'الشركة' : 'Company'}</h3>
            <div className="flex flex-col gap-2 font-bold text-white">
              <Link href="/about" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('company.one')}</Link>
              <Link href="/how-it-works" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('company.two')}</Link>
              <Link href="/terms" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link>
              <Link href="/privacy" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
            </div>
          </div>

          {/* Column 5: Support */}
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-white text-sm tracking-tight whitespace-nowrap">{isAr ? 'المساعدة' : 'Support'}</h3>
            <div className="flex flex-col gap-2 font-bold text-white">
              <Link href="/help" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('support.one')}</Link>
              <Link href="/safety" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('support.two')}</Link>
              <Link href="/contact" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{isAr ? 'اتصل بنا' : 'Contact Us'}</Link>
              <Link href="/sitemap" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{isAr ? 'خريطة الموقع' : 'Sitemap'}</Link>
            </div>
          </div>

          {/* Column 6: Follow & Apps */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-extrabold text-white text-sm tracking-tight">{isAr ? 'تابعنا' : 'Follow Us'}</h3>
              <div className="flex items-center gap-3.5 text-white">
                <a href="#" className="hover:text-deumah-green transition duration-200" aria-label="Facebook">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="hover:text-deumah-green transition duration-200" aria-label="Instagram">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="hover:text-deumah-green transition duration-200" aria-label="Twitter">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="hover:text-deumah-green transition duration-200" aria-label="YouTube">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-1">
              <a href="#" className="hover:opacity-90 transition shrink-0" aria-label="Download on App Store">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8 w-auto" />
              </a>
              <a href="#" className="hover:opacity-90 transition shrink-0" aria-label="Download on Google Play">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8 w-auto" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="mt-8 pt-8 border-t border-deumah-border text-center text-xs font-bold text-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>{isAr ? '© ٢٠٢٤ دومه. جميع الحقوق محفوظة.' : '© 2024 Deumah. All rights reserved.'}</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('legal.one')}</Link>
            <Link href="/privacy" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('legal.two')}</Link>
            <Link href="/cookies" className="hover:text-deumah-green transition duration-200 whitespace-nowrap">{t('legal.three')}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
