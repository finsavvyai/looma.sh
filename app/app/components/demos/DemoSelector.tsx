'use client';

import { useState, useEffect } from 'react';

interface Demo {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'advanced' | 'enterprise';
  icon: string;
  features: string[];
  path: string;
  color: string;
  stats: {
    users: string;
    rating: number;
    demoTime: string;
  };
}

const DemoSelector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'advanced' | 'enterprise'>('all');
  const [hoveredDemo, setHoveredDemo] = useState<string | null>(null);

  const demos: Demo[] = [
    {
      id: 'interactive',
      title: 'Interactive Demo',
      description: 'Hands-on V2V communication simulation with real-time vehicle interaction and scenario testing',
      category: 'basic',
      icon: '🚗',
      features: ['Real-time vehicle control', 'Collision avoidance', 'Traffic management', 'Emergency alerts'],
      path: '/demo/interactive',
      color: 'from-blue-600 to-purple-600',
      stats: { users: '15K+', rating: 4.8, demoTime: '5 min' }
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Comprehensive real-time metrics and business intelligence for V2V network performance',
      category: 'advanced',
      icon: '📊',
      features: ['Live metrics', 'Business impact', 'Customer success', 'Performance tracking'],
      path: '/demo/analytics',
      color: 'from-green-600 to-blue-600',
      stats: { users: '12K+', rating: 4.9, demoTime: '8 min' }
    },
    {
      id: '3d-visualization',
      title: '3D Visualization',
      description: 'Advanced 3D rendering of V2V communication networks with interactive camera controls',
      category: 'advanced',
      icon: '🎯',
      features: ['3D vehicle models', 'Signal paths', 'Traffic events', 'Camera controls'],
      path: '/demo/3d-visualization',
      color: 'from-purple-600 to-pink-600',
      stats: { users: '8K+', rating: 4.7, demoTime: '10 min' }
    },
    {
      id: 'ai-analytics',
      title: 'AI Predictive Analytics',
      description: 'Neural network-powered predictions for collision avoidance and traffic optimization',
      category: 'enterprise',
      icon: '🧠',
      features: ['Neural networks', 'Predictive modeling', 'Risk assessment', 'Auto-optimization'],
      path: '/demo/ai-analytics',
      color: 'from-yellow-600 to-orange-600',
      stats: { users: '5K+', rating: 4.9, demoTime: '12 min' }
    },
    {
      id: 'immersive',
      title: 'Immersive Experience',
      description: 'Full sensory V2V simulation with sound effects, vibration, and environmental controls',
      category: 'enterprise',
      icon: '🎮',
      features: ['Sound effects', 'Vibration feedback', 'Weather simulation', 'Day/night cycle'],
      path: '/demo/immersive-experience',
      color: 'from-cyan-600 to-blue-600',
      stats: { users: '6K+', rating: 4.8, demoTime: '15 min' }
    },
    {
      id: 'security',
      title: 'Security Showcase',
      description: 'Enterprise-grade security protocols and real-time threat monitoring for V2V networks',
      category: 'enterprise',
      icon: '🔐',
      features: ['Zero-trust architecture', 'Threat monitoring', 'Compliance dashboard', 'Audit trails'],
      path: '/demo/security-showcase',
      color: 'from-red-600 to-pink-600',
      stats: { users: '3K+', rating: 5.0, demoTime: '6 min' }
    },
    {
      id: 'real-life',
      title: 'Real-Life Scenarios',
      description: 'Practical V2V applications in everyday driving situations and emergency responses',
      category: 'basic',
      icon: '🏙️',
      features: ['City driving', 'Highway scenarios', 'Emergency response', 'School zones'],
      path: '/demo/real-life-scenarios',
      color: 'from-indigo-600 to-purple-600',
      stats: { users: '18K+', rating: 4.6, demoTime: '7 min' }
    },
    {
      id: 'real-v2v',
      title: 'Production V2V System',
      description: 'Live V2V network monitoring with real vehicle data and production-grade infrastructure',
      category: 'enterprise',
      icon: '🛰️',
      features: ['Live vehicles', 'Real data', 'Network status', 'System monitoring'],
      path: '/demo/real-v2v',
      color: 'from-gray-600 to-slate-600',
      stats: { users: '2K+', rating: 4.9, demoTime: '20 min' }
    }
  ];

  const filteredDemos = selectedCategory === 'all'
    ? demos
    : demos.filter(demo => demo.category === selectedCategory);

  const getCategoryColor = (category: Demo['category']) => {
    switch (category) {
      case 'basic': return 'bg-blue-900/20 text-blue-300 border-blue-500/30';
      case 'advanced': return 'bg-purple-900/20 text-purple-300 border-purple-500/30';
      case 'enterprise': return 'bg-orange-900/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-900/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryBadge = (category: Demo['category']) => {
    switch (category) {
      case 'basic': return 'Educational';
      case 'advanced': return 'Advanced Demo';
      case 'enterprise': return 'Enterprise Grade';
      default: return 'Demo';
    }
  };

  useEffect(() => {
    // Add floating animation elements
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      .float-animation {
        animation: float 6s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-slate-800/10 bg-[size:100px_100px] pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse float-animation"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse float-animation" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse float-animation" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></span>
            <span className="text-sm font-medium text-purple-300">Interactive Demo Experience</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              V2V Communication
            </span>
          </h1>
          <span className="block text-6xl md:text-7xl font-bold mt-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Demos
            </span>
          </span>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6 leading-relaxed">
            Explore our comprehensive suite of V2V technology demonstrations, from interactive simulations to enterprise-grade analytics platforms
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: 'all', label: 'All Demos', icon: '🎯' },
            { id: 'basic', label: 'Educational', icon: '📚' },
            { id: 'advanced', label: 'Advanced', icon: '⚡' },
            { id: 'enterprise', label: 'Enterprise', icon: '🏢' }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredDemos.map((demo) => (
            <div
              key={demo.id}
              className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                hoveredDemo === demo.id ? 'z-20' : ''
              }`}
              onMouseEnter={() => setHoveredDemo(demo.id)}
              onMouseLeave={() => setHoveredDemo(null)}
            >
              {/* Glow Effect */}
              {hoveredDemo === demo.id && (
                <div className={`absolute inset-0 bg-gradient-to-r ${demo.color} rounded-2xl blur-xl opacity-50 animate-pulse`}></div>
              )}

              {/* Card */}
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
                {/* Card Header */}
                <div className={`p-6 bg-gradient-to-br ${demo.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{demo.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{demo.title}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(demo.category)}`}>
                      {getCategoryBadge(demo.category)}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">{demo.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {demo.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                    {demo.features.length > 3 && (
                      <div className="text-xs text-gray-500">+{demo.features.length - 3} more features</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{demo.stats.users}</div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">⭐ {demo.stats.rating}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{demo.stats.demoTime}</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={demo.path}
                    className={`w-full block text-center px-4 py-3 rounded-xl font-semibold bg-gradient-to-r ${demo.color} text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300`}
                  >
                    <span className="flex items-center justify-center">
                      Launch Demo
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Requirements */}
        <div className="mt-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">System Requirements</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Desktop Browser</h3>
              <p className="text-gray-400 text-sm">Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile Device</h3>
              <p className="text-gray-400 text-sm">iOS 14+, Android 10+ with modern browser</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Internet</h3>
              <p className="text-gray-400 text-sm">Stable broadband connection (10 Mbps+)</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left">
              <h3 className="font-bold mb-3">Are the demos free to try?</h3>
              <p className="text-gray-400 text-sm">Yes, all demos are completely free with no registration required.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left">
              <h3 className="font-bold mb-3">Can I save my progress?</h3>
              <p className="text-gray-400 text-sm">Some demos allow progress saving. Look for the save icon within each demo.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left">
              <h3 className="font-bold mb-3">Is my data secure?</h3>
              <p className="text-gray-400 text-sm">All demo data is simulated and no personal information is stored.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left">
              <h3 className="font-bold mb-3">Can I use these for presentations?</h3>
              <p className="text-gray-400 text-sm">Absolutely! These demos are perfect for investor pitches and technical demonstrations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSelector;