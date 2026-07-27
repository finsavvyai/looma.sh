"use client";

import { useState, useEffect } from "react";
import { languages, Language } from "../i18n";
import { useRouter, usePathname } from "next/navigation";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (language: Language) => {
    onLanguageChange(language);
    setIsOpen(false);

    // Update URL with language parameter
    const newUrl = `/${language}${pathname === '/' ? '' : pathname}`;
    router.push(newUrl);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="language-switcher relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
      >
        <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 9a9 9 0 109-9m-9 9h18m-9-9a9 9 0 00-9 9m9 9a9 9 0 009-9" />
        </svg>
        <span className="font-medium">{currentLang?.name || 'English'}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 text-gray-400 group-hover:text-gray-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-all duration-150 ${
                  currentLanguage === language.code ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {language.code === 'en' && '🇺🇸'}
                    {language.code === 'he' && '🇮🇱'}
                    {language.code === 'ar' && '🇸🇦'}
                    {language.code === 'es' && '🇪🇸'}
                    {language.code === 'fr' && '🇫🇷'}
                    {language.code === 'de' && '🇩🇪'}
                  </span>
                  <div>
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs opacity-60">
                      {language.direction === 'rtl' ? '📜 RTL' : '📖 LTR'}
                    </div>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}