import '../globals.css';
import type {Metadata} from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Poppins } from 'next/font/google';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Deumah Marketplace',
  description: 'Rent, buy and sell in Yemen.'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: Readonly<{children: React.ReactNode; params: Promise<{locale: string}>}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir} className={`${poppins.className} h-full antialiased overflow-x-hidden`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window._appLoadError = false;
              window.onerror = function(msg, url, line, col, err) {
                if (msg.toLowerCase().indexOf('syntax') > -1 || msg.toLowerCase().indexOf('unexpected') > -1) {
                  window._appLoadError = true;
                }
              };
              document.addEventListener('DOMContentLoaded', function() {
                if (window._appLoadError) {
                  document.body.innerHTML = '<div style="padding: 30px; text-align: center; font-family: sans-serif; background: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;"><h1 style="color: #E11D48; font-size: 24px; margin-bottom: 10px;">متصفح غير مدعوم</h1><p style="color: #475569; font-size: 16px; margin-bottom: 30px;">عذراً، متصفحك أو إصدار هاتفك قديم جداً ولا يمكنه تشغيل المنصة. يرجى تحديث متصفح Chrome أو استخدام جهاز أحدث.</p><h1 style="color: #E11D48; font-size: 24px; margin-bottom: 10px;">Browser Not Supported</h1><p style="color: #475569; font-size: 16px;">Sorry, your browser or phone version is too old to run this website. Please update Google Chrome or use a modern device.</p></div>';
                }
              });
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden pb-16 md:pb-0" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
          <MobileBottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
