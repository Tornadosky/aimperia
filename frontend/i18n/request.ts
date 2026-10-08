import {getRequestConfig} from 'next-intl/server';
import { headers } from 'next/headers';
 
export default getRequestConfig(async () => {
  const acceptLanguage = headers().get('accept-language');
  const preferredLocale = acceptLanguage?.split(',')[0].split('-')[0] ?? 'en';
  const locale = ['ru', 'en'].includes(preferredLocale) ? preferredLocale : 'en';
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});