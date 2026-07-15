import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // Extract the locale from the request path
  const locale = (await requestLocale) || 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
