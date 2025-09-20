import { useEffect, useState } from 'react';
import { defaultLocale } from '@/i18n/request';

const LANGUAGE_KEY = 'app-language';

export function useI18n() {
  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || defaultLocale;
    setCurrentLocale(savedLanguage);
  }, []);

  const changeLanguage = (locale: string) => {
    localStorage.setItem(LANGUAGE_KEY, locale);
    setCurrentLocale(locale);
    // 刷新页面以应用新语言
    window.location.reload();
  };

  return {
    currentLocale,
    changeLanguage,
  };
}
