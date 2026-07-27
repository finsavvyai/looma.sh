"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";

export default function InvestorDemo() {
  const { t } = useTranslations();
  const [activeScenario, setActiveScenario] = useState("smart-city");
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isFluxing, setIsFluxing] = useState(false);

  // Flux Capacitor Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFluxing(true);
      setTimeout(() => setIsFluxing(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animated counter
  useEffect(() => {
    const target = activeScenario === "smart-city" ? 87 : activeScenario === "fleet" ? 62 : activeScenario === "emergency" ? 94 : 73;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedValue(target);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [activeScenario]);

  const scenarios = [
    {
      id: "smart-city",
      title: t.smartCityIntegration,
      icon: "🏙️",
      description: "Real-time traffic optimization and emergency response coordination",
      value: "87%",
      label: t.accidentPrevention,
      metrics: ["15K+ intersections", "200K+ vehicles tracked", "24/7 monitoring"],
      roi: "$3.2M annual savings per city"
    },
    {
      id: "fleet",
      title: t.fleetManagement,
      icon: "🚚",
      description: "Optimize delivery routes and monitor driver safety in real-time",
      value: "62%",
      label: t.fuelEfficiency,
      metrics: ["50K+ delivery vehicles", "1.2M packages/day", "99.9% uptime"],
      roi: "$1.8M annual cost reduction"
    },
    {
      id: "emergency",
      title: t.emergencyServices,
      icon: "🚑",
      description: "Instant hazard detection and priority routing for first responders",
      value: "94%",
      label: t.responseTimeReduction,
      metrics: ["500+ emergency vehicles", "10K+ incidents/month", "3-minute avg response"],
      roi: "2,400+ lives saved annually"
    },
    {
      id: "insurance",
      title: t.insuranceIntegration,
      icon: "🛡️",
      description: "Real-time risk assessment and automated claims processing",
      value: "73%",
      label: t.fraudDetectionRate,
      metrics: ["1M+ policies active", "$50M+ claims processed", "24-hour claim resolution"],
      roi: "$450M annual fraud prevention"
    }
  ];

  const currentScenario = scenarios.find(s => s.id === activeScenario);

  return (
    <section className="max-w-7xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          {t.investorDashboard} & ROI Analysis
        </h2>
        <p className="text-gray-400 text-lg">
          {t.investorSubtitle}
        </p>
      </div>

      {/* Flux Capacitor Animation */}
      <div className="mb-12 flex justify-center">
        <div className="relative">
          <div className={`w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl ${isFluxing ? 'animate-pulse scale-110' : 'scale-100'} transition-all duration-500`}>
            <div className="relative">
              {/* Flux Capacitor Core */}
              <div className={`w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center ${isFluxing ? 'animate-spin' : ''} transition-all duration-300`}>
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93v2.02c4.94-.49 9-3.85 9-9.95s-4.06-9.46-9-9.95zm0 18.9v-2.02c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93V2.05c-4.94.49-9 3.85-9 9.95s4.06 9.46 9 9.95z"/>
                  </svg>
                </div>
              </div>

              {/* Energy Streams */}
              {isFluxing && (
                <>
                  <div className="absolute -top-2 left-0 w-1 h-8 bg-yellow-400 animate-pulse"></div>
                  <div className="absolute -top-2 right-0 w-1 h-8 bg-yellow-400 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-8 h-1 bg-yellow-400 animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-8 h-1 bg-yellow-400 animate-pulse"></div>
                </>
              )}
            </div>
          </div>

          {/* Energy Effect */}
          {isFluxing && (
            <div className="absolute inset-0 rounded-3xl bg-yellow-400/20 blur-xl animate-ping"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Scenario Selector */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">{t.targetMarkets}</h3>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(scenario.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                activeScenario === scenario.id
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 text-white'
                  : 'bg-slate-800/50 border-slate-700/50 text-gray-300 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{scenario.icon}</span>
                <div>
                  <div className="font-medium">{scenario.title}</div>
                  <div className="text-sm opacity-80">{scenario.label}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Center Panel - Main Display */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{currentScenario?.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{currentScenario?.title}</h3>
                  <p className="text-gray-400">{currentScenario?.description}</p>
                </div>
              </div>

              {/* Live Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">{t.liveDemo}</span>
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {animatedValue}%
                </div>
                <div className="text-gray-400 text-sm">{currentScenario?.label}</div>
                <div className="text-xs text-green-400 mt-1">↑ 23% vs baseline</div>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {currentScenario?.roi}
                </div>
                <div className="text-gray-400 text-sm">Annual ROI</div>
                <div className="text-xs text-purple-400 mt-1">18-month payback</div>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {currentScenario?.metrics.map((metric, index) => (
                <div key={index} className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {metric.split(' ')[0]}
                    <span className="text-lg text-gray-400">{metric.split(' ').slice(1).join(' ')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Feed */}
            <div className="bg-slate-900/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Real-time Activity</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[
                  { time: "2:34:15 PM", event: "Hazard detected on I-95", location: "Mile 42", type: "warning" },
                  { time: "2:33:48 PM", event: "Emergency vehicle routed", location: "Downtown", type: "emergency" },
                  { time: "2:33:22 PM", event: "Traffic flow optimized", location: "Highway 101", type: "success" },
                  { time: "2:32:56 PM", event: "Accident prevented", location: "5th & Main", type: "success" },
                  { time: "2:32:14 PM", event: "Road condition update", location: "Route 66", type: "info" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        activity.type === 'emergency' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-gray-400">{activity.time}</span>
                      <span className="text-white">{activity.event}</span>
                    </div>
                    <span className="text-gray-500">{activity.location}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex items-center justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]">
                {t.requestPrivateDemo}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Size Section */}
      <div className="mt-16 p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-xl">
        <h3 className="text-2xl font-semibold text-white text-center mb-8">
          {t.totalAddressableMarket} (TAM)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">$47.3B</div>
            <div className="text-gray-300">Smart City Infrastructure</div>
            <div className="text-sm text-gray-500 mt-1">2025 market size</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">$28.7B</div>
            <div className="text-gray-300">Fleet Management</div>
            <div className="text-sm text-gray-500 mt-1">Global logistics market</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">$15.2B</div>
            <div className="text-gray-300">Insurance Tech</div>
            <div className="text-sm text-gray-500 mt-1">Insurtech opportunity</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            $91.2B Total Market Opportunity
          </div>
          <div className="text-gray-400 mt-2">Looma.sh is positioned to capture 3-5% of this market within 5 years</div>
        </div>
      </div>
    </section>
  );
}