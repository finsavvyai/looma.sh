"use client";

import { marketingConfig } from "../../config/marketing";
import { useTranslations } from "../../hooks/useTranslations";

export default function SocialProof() {
  const { t } = useTranslations();
  return (
    <section id="social-proof" className="max-w-6xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          {t.trustedByDevelopersWorldwide}
        </h2>
        <p className="text-gray-400 text-lg">
          {t.buildingFutureOfVehicleCommunication}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {marketingConfig.socialProof.stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-16 pt-8 border-t border-slate-800">
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span>{t.realTimeProcessing}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>{t.enterpriseSecurity}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
            <span>{t.developerFirst}</span>
          </div>
        </div>
      </div>
    </section>
  );
}