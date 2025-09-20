import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// French and English configuration
export const locales = ['en', 'fr'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Validate supported language
  if (!locales.includes(locale as any)) notFound();

  // Dynamically import only supported locales
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    messages = (await import(`../../messages/en.json`)).default;
  }

  return {
    messages
  };
});
