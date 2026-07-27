"use client";

import { marketingConfig } from "../../config/marketing";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslations } from "../../hooks/useTranslations";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, currentLanguage, handleLanguageChange, isRTL } = useTranslations();
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 scroll-smooth ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Looma.sh</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">{t.features}</a>
              <div className="relative group">
                <a href="/demo/select" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                  🚗 Demos
                  <svg className="w-3 h-3 ml-1 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2 space-y-1">
                    <a href="/demo/select" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                      🎯 Demo Selection
                    </a>
                    <a href="/demo/3d-visualization" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                      🎮 3D Visualization
                    </a>
                    <a href="/demo/ai-analytics" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                      🧠 AI Analytics
                    </a>
                    <a href="/demo/immersive-experience" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                      🥽 Immersive Experience
                    </a>
                    <a href="/demo/real-life-scenarios" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                      📖 Real-Life Scenarios
                    </a>
                    <a href="/demo/production" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                      🔒 Production System
                    </a>
                  </div>
                </div>
              </div>
              <a href="/demo/analytics" className="text-gray-300 hover:text-white transition-colors text-sm">📊 Analytics</a>
              <a href="#social-proof" className="text-gray-300 hover:text-white transition-colors text-sm">{t.documentation}</a>
              <a
                href="/demo/select"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 inline-flex items-center text-sm shadow-lg hover:shadow-purple-500/25"
              >
                🚀 {t.getStarted}
              </a>
              <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Looma.sh</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t.heroDescription}
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{t.features}</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">{t.liveDemo}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#docs" className="hover:text-white transition-colors">{t.documentation}</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">{t.api}</a></li>
                <li><a href="#tutorials" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">{t.blog}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">{t.about}</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">{t.careers}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t.contact}</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">{t.privacy}</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                Built with {marketingConfig.footer.technologies.join(" • ")}
              </p>
              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <span>© 2024 Looma.sh</span>
                <a href="#terms" className="hover:text-white transition-colors">{t.terms}</a>
                <a href="#privacy" className="hover:text-white transition-colors">{t.privacy}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}