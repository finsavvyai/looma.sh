'use client';

import { useState, useEffect } from 'react';

interface SecurityMetric {
  id: string;
  label: string;
  value: string;
  status: 'secure' | 'monitoring' | 'optimized';
  trend: number;
}

interface ThreatData {
  type: string;
  count: number;
  blocked: boolean;
  timestamp: string;
}

const SecurityShowcase: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([
    {
      id: 'encryption',
      label: 'Encryption Status',
      value: 'AES-256',
      status: 'secure',
      trend: 100
    },
    {
      id: 'uptime',
      label: 'Security Uptime',
      value: '99.99%',
      status: 'secure',
      trend: 99.99
    },
    {
      id: 'threats',
      label: 'Threats Blocked',
      value: '1.2M',
      status: 'monitoring',
      trend: 95
    },
    {
      id: 'compliance',
      label: 'Compliance Score',
      value: 'A+',
      status: 'secure',
      trend: 98
    }
  ]);

  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Generate simulated threat data
    const generateThreat = (): ThreatData => {
      const threatTypes = ['DDoS Attack', 'Unauthorized Access', 'Data Breach Attempt', 'Malware Scan', 'Phishing Attempt'];
      const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];

      return {
        type,
        count: Math.floor(Math.random() * 100) + 1,
        blocked: Math.random() > 0.1, // 90% block rate
        timestamp: new Date().toISOString()
      };
    };

    // Simulate real-time threat detection
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new threat
        const newThreat = generateThreat();
        setThreats(prev => [newThreat, ...prev.slice(0, 9)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runSecurityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Update metrics after scan
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        trend: Math.min(100, metric.trend + Math.random() * 2 - 1)
      })));
    }, 3000);
  };

  const getStatusColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure': return 'text-green-400';
      case 'monitoring': return 'text-yellow-400';
      case 'optimized': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure': return 'bg-green-900/20 border-green-500/30';
      case 'monitoring': return 'bg-yellow-900/20 border-yellow-500/30';
      case 'optimized': return 'bg-blue-900/20 border-blue-500/30';
      default: return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white p-6">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-grid-slate-800/10 bg-[size:50px_50px] pointer-events-none"></div>

      {/* Floating Security Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 left-32 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-48 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></span>
            <span className="text-sm font-medium text-green-300">Military-Grade Security</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Enterprise Security
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Bank-level encryption and security protocols protecting V2V communication networks
            for the world's largest smart cities and automotive fleets.
          </p>
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric) => (
            <div key={metric.id} className={`relative group p-6 rounded-xl border ${getStatusBg(metric.status)} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400">{metric.label}</h3>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)} bg-current`}></div>
                </div>

                <div className="text-2xl font-bold text-white mb-2">{metric.value}</div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${metric.trend > 95 ? 'from-green-500 to-green-400' : 'from-yellow-500 to-orange-400'} transition-all duration-500`}
                      style={{ width: `${metric.trend}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{metric.trend.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Security Control Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              Security Control Center
            </h2>

            <div className="space-y-4">
              <button
                onClick={runSecurityScan}
                disabled={isScanning}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  isScanning
                    ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 cursor-wait'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
                }`}
              >
                <span className="flex items-center justify-center">
                  {isScanning ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Security Scan...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Run Security Scan
                    </>
                  )}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-gray-400 mb-1">Active Sessions</div>
                  <div className="text-xl font-bold text-green-400">12,547</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-gray-400 mb-1">Data Processed</div>
                  <div className="text-xl font-bold text-blue-400">847 TB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Threat Monitor */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </span>
              Threat Intelligence
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {threats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No security threats detected</p>
                </div>
              ) : (
                threats.map((threat, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                    threat.blocked
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${threat.blocked ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <div className="font-medium text-sm">{threat.type}</div>
                        <div className="text-xs text-gray-400">{threat.count} attempts</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${threat.blocked ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
                      {threat.blocked ? 'Blocked' : 'Blocked'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Compliance & Certifications */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Enterprise Compliance & Certifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'ISO 27001', status: 'Certified', icon: '🏆' },
              { name: 'SOC 2 Type II', status: 'Compliant', icon: '🔒' },
              { name: 'GDPR', status: 'Compliant', icon: '🛡️' },
              { name: 'HIPAA', status: 'Ready', icon: '⚕️' },
              { name: 'NIST CSF', status: 'Implemented', icon: '📋' },
              { name: 'CMMC', status: 'Level 5', icon: '⭐' },
              { name: 'FedRAMP', status: 'Authorized', icon: '🏛️' },
              { name: 'PCI DSS', status: 'Validated', icon: '💳' }
            ].map((cert, index) => (
              <div key={index} className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-green-500/50 transition-all duration-300">
                <div className="text-3xl mb-2">{cert.icon}</div>
                <div className="font-semibold text-sm mb-1">{cert.name}</div>
                <div className="text-xs text-green-400">{cert.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Zero-Trust Architecture',
              description: 'Every request authenticated and authorized regardless of origin',
              icon: '🔐',
              color: 'from-blue-600 to-purple-600'
            },
            {
              title: 'Quantum-Resistant Encryption',
              description: 'Post-quantum cryptography algorithms for future-proof security',
              icon: '⚛️',
              color: 'from-purple-600 to-pink-600'
            },
            {
              title: 'Real-time Anomaly Detection',
              description: 'AI-powered threat detection with sub-millisecond response times',
              icon: '🤖',
              color: 'from-green-600 to-blue-600'
            },
            {
              title: 'Multi-Cloud Security',
              description: 'Distributed security across multiple cloud providers',
              icon: '☁️',
              color: 'from-cyan-600 to-blue-600'
            },
            {
              title: 'Hardware Security Modules',
              description: 'FIPS 140-2 Level 3 validated HSMs for key management',
              icon: '🔰',
              color: 'from-orange-600 to-red-600'
            },
            {
              title: 'Blockchain Audit Trail',
              description: 'Immutable security logs on distributed ledger technology',
              icon: '⛓️',
              color: 'from-gray-600 to-slate-600'
            }
          ].map((feature, index) => (
            <div key={index} className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-xl">
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>

              <div className="relative z-10">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityShowcase;