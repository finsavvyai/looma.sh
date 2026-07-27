"use client";

import { marketingConfig } from "../../config/marketing";

const colorClasses = {
  blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400",
  purple: "from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400",
  green: "from-green-500/20 to-green-600/20 border-green-500/20 text-green-400",
  yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/20 text-yellow-400"
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          {marketingConfig.howItWorks.title}
        </h2>
        <p className="text-gray-400 text-lg">
          Experience the power of decentralized vehicle communication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {marketingConfig.howItWorks.steps.map((step) => (
          <div key={step.number} className="flex items-start space-x-6 p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-slate-600/50 transition-all duration-300">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center font-bold text-xl border ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                {step.number}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Diagram */}
      <div className="mt-16 p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-xl">
        <h3 className="text-2xl font-semibold text-white text-center mb-8">
          Architecture Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-white font-medium">Client</div>
            <div className="text-gray-400 text-sm">Mobile/Web App</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-white font-medium">Edge Worker</div>
            <div className="text-gray-400 text-sm">Cloudflare Workers</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="text-white font-medium">KV Storage</div>
            <div className="text-gray-400 text-sm">Message Store</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-white font-medium">Analytics</div>
            <div className="text-gray-400 text-sm">Real-time Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  );
}