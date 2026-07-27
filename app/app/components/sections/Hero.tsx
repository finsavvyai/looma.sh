"use client";

import { marketingConfig } from "../../config/marketing";
import { useTranslations } from "../../hooks/useTranslations";

export default function Hero() {
  const { t } = useTranslations();
  return (
    <section id="hero" className="max-w-4xl mx-auto text-center space-y-8 py-16">
      {/* Logo and Title */}
      <div className="inline-flex items-center space-x-4 mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-4xl flex items-center justify-center shadow-2xl animate-glow">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
          {marketingConfig.hero.title}
        </h1>
      </div>

      {/* Subtitle and Description */}
      <div className="space-y-4">
        <h2 className="text-2xl text-gray-300 font-medium">
          {t.heroSubtitle}
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {t.heroDescription}
        </p>
      </div>

      {/* Features */}
      <div className="flex items-center justify-center space-x-12 pt-8">
        <div className="flex items-center space-x-3 text-gray-400">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-lg">{t.network}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-400">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-lg">{t.encrypted}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-400">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-lg">{t.security}</span>
        </div>
      </div>

      {/* Investment Highlights */}
      <div className="pt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/30">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          🚀 {t.investorHighlights}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {marketingConfig.hero.investorHighlight.marketSize}
            </div>
            <div className="text-gray-400 text-sm">{t.smartCityMarket}</div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {marketingConfig.hero.investorHighlight.roi}
            </div>
            <div className="text-gray-400 text-sm">{t.totalMarketOpportunity}</div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {marketingConfig.hero.investorHighlight.growth}
            </div>
            <div className="text-gray-400 text-sm">{t.fiveYearTarget}</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="pt-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/demo/select"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl text-white font-semibold text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 inline-block text-center"
          >
            🚗 {t.tryLiveDemo}
          </a>
          <a
            href="#features"
            className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-2xl text-gray-300 font-semibold text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 inline-block text-center"
          >
            📈 {t.viewInvestorDeck}
          </a>
        </div>
        <p className="text-sm text-gray-500">
          {t.experienceRealTimeV2V}
        </p>
      </div>
    </section>
  );
}