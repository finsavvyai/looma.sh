'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  country: string;
  avatar: string;
  content: string;
  metrics: {
    reduction: string;
    savings: string;
    improvement: string;
  };
  category: 'municipal' | 'enterprise' | 'automotive' | 'smart-city';
  logo: string;
  date: string;
}

const CustomerTestimonials: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState<string>('municipal-1');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'municipal' | 'enterprise' | 'automotive' | 'smart-city'>('all');

  const testimonials: Testimonial[] = [
    {
      id: 'municipal-1',
      name: 'Sarah Chen',
      role: 'Chief Technology Officer',
      company: 'Singapore Smart City Initiative',
      city: 'Singapore',
      country: 'Singapore',
      avatar: '👩🏻‍💼',
      content: 'Implementing Looma.sh V2V technology reduced traffic accidents by 78% in our pilot zones. The real-time analytics and predictive safety features have transformed our urban mobility strategy. We are now expanding to cover the entire city.',
      metrics: {
        reduction: '78% accident reduction',
        savings: '$4.2M annual savings',
        improvement: '35% faster emergency response'
      },
      category: 'municipal',
      logo: '🏙️',
      date: '2024'
    },
    {
      id: 'enterprise-1',
      name: 'Michael Rodriguez',
      role: 'VP of Fleet Operations',
      company: 'Global Logistics Corporation',
      city: 'Chicago',
      country: 'USA',
      avatar: '👨🏽‍💼',
      content: 'Our fleet of 5,000 vehicles now operates with 25% better fuel efficiency and 40% fewer incidents. The V2V coordination system has revolutionized our supply chain operations. ROI exceeded our projections by 300%.',
      metrics: {
        reduction: '40% fewer incidents',
        savings: '25% fuel efficiency',
        improvement: '20% faster deliveries'
      },
      category: 'enterprise',
      logo: '🚚',
      date: '2024'
    },
    {
      id: 'automotive-1',
      name: 'Dr. Yuki Tanaka',
      role: 'Head of Connected Vehicle Research',
      company: 'AutoTech Industries',
      city: 'Tokyo',
      country: 'Japan',
      avatar: '👩🏻‍🔬',
      content: 'The neural network integration is groundbreaking. Our vehicles now predict collision risks 2.3 seconds earlier than any competing system. This technology will define the next generation of autonomous driving.',
      metrics: {
        reduction: '92% collision prediction accuracy',
        savings: '2.3s earlier prediction',
        improvement: '85% user satisfaction'
      },
      category: 'automotive',
      logo: '🚗',
      date: '2023'
    },
    {
      id: 'smart-city-1',
      name: 'Emma Johansson',
      role: 'Smart City Director',
      company: 'Stockholm Municipal Authority',
      city: 'Stockholm',
      country: 'Sweden',
      avatar: '👩🏼‍💼',
      content: 'Our carbon emissions dropped by 18% in the first year. The intelligent traffic management system has made our city more livable and sustainable. Citizens report 45% higher satisfaction with urban mobility.',
      metrics: {
        reduction: '18% CO2 emissions',
        savings: '€12M infrastructure savings',
        improvement: '45% citizen satisfaction'
      },
      category: 'smart-city',
      logo: '🌿',
      date: '2024'
    }
  ];

  const filteredTestimonials = selectedCategory === 'all'
    ? testimonials
    : testimonials.filter(t => t.category === selectedCategory);

  const activeTestimonialData = testimonials.find(t => t.id === activeTestimonial) || testimonials[0];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'municipal': return 'from-blue-600 to-purple-600';
      case 'enterprise': return 'from-green-600 to-blue-600';
      case 'automotive': return 'from-purple-600 to-pink-600';
      case 'smart-city': return 'from-cyan-600 to-green-600';
      default: return 'from-gray-600 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white py-20 px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-slate-800/10 bg-[size:100px_100px] pointer-events-none"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></span>
            <span className="text-sm font-medium text-blue-300">Trusted by Global Leaders</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-8">
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Customer Success
            </span>
            <span className="block text-6xl md:text-7xl font-bold mt-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Stories
              </span>
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover how cities, enterprises, and automotive leaders are transforming transportation
            with our V2V communication technology. Real results from real deployments worldwide.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">{testimonial.name}</h3>
                  <p className="text-gray-400">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                  <p className="text-xs text-gray-600">
                    {testimonial.city}, {testimonial.country}
                  </p>
                </div>
              </div>

              <blockquote className="text-lg text-gray-300 mb-6 italic">
                "{testimonial.content}"
              </blockquote>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {testimonial.metrics.reduction}
                  </div>
                  <div className="text-xs text-gray-400">Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {testimonial.metrics.savings}
                  </div>
                  <div className="text-xs text-gray-400">Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {testimonial.metrics.improvement}
                  </div>
                  <div className="text-xs text-gray-400">Benefit</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-2xl">{testimonial.logo}</span>
                <span className="text-sm text-gray-500">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Join the Success Story
            </span>
          </h2>

          <a
            href="/demo/select"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            <span className="flex items-center justify-center">
              🚀 Explore Our Demos
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerTestimonials;
