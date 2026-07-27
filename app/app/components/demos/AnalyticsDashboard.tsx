'use client';

import { useState, useEffect, useRef } from 'react';

interface AnalyticsData {
  totalMessages: number;
  activeVehicles: number;
  collisionWarnings: number;
  emergencyAlerts: number;
  fuelSavings: number;
  responseTimeImprovement: number;
  uptime: number;
  networkLatency: number;
  packetLossRate: number;
  signalStrength: number;
  areaCoverage: number;
  cooperativeDrivingEvents: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMessages: 0,
    activeVehicles: 0,
    collisionWarnings: 0,
    emergencyAlerts: 0,
    fuelSavings: 0,
    responseTimeImprovement: 0,
    uptime: 99.9,
    networkLatency: 0,
    packetLossRate: 0,
    signalStrength: 0,
    areaCoverage: 0,
    cooperativeDrivingEvents: 0
  });

  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: 'Messages/sec',
        data: [],
        color: '#3B82F6'
      },
      {
        label: 'Active Vehicles',
        data: [],
        color: '#10B981'
      },
      {
        label: 'Collision Warnings',
        data: [],
        color: '#EF4444'
      }
    ]
  });

  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('1h');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateAnalytics = () => {
      setAnalytics(prev => ({
        totalMessages: Math.min(prev.totalMessages + Math.floor(Math.random() * 50), 999999),
        activeVehicles: Math.floor(Math.random() * 500) + 100,
        collisionWarnings: Math.min(prev.collisionWarnings + Math.floor(Math.random() * 5), 9999),
        emergencyAlerts: Math.min(prev.emergencyAlerts + Math.floor(Math.random() * 2), 999),
        fuelSavings: Math.min(prev.fuelSavings + Math.random() * 0.5, 99.9),
        responseTimeImprovement: Math.min(prev.responseTimeImprovement + Math.random() * 0.3, 85),
        uptime: Math.max(99.5, 99.9 + (Math.random() - 0.5) * 0.3),
        networkLatency: Math.floor(Math.random() * 20) + 5,
        packetLossRate: Math.max(0.01, Math.random() * 0.5),
        signalStrength: Math.floor(Math.random() * 20) + 80,
        areaCoverage: Math.floor(Math.random() * 10) + 85,
        cooperativeDrivingEvents: Math.min(prev.cooperativeDrivingEvents + Math.floor(Math.random() * 8), 8888)
      }));

      setChartData(prev => {
        const newLabels = [...prev.labels, new Date().toLocaleTimeString()];
        const newMessagesData = [...prev.datasets[0].data, Math.floor(Math.random() * 100) + 20];
        const newVehiclesData = [...prev.datasets[1].data, Math.floor(Math.random() * 500) + 100];
        const newWarningsData = [...prev.datasets[2].data, Math.floor(Math.random() * 10)];

        // Keep only last 20 data points
        return {
          labels: newLabels.slice(-20),
          datasets: [
            { ...prev.datasets[0], data: newMessagesData.slice(-20) },
            { ...prev.datasets[1], data: newVehiclesData.slice(-20) },
            { ...prev.datasets[2], data: newWarningsData.slice(-20) }
          ]
        };
      });
    };

    if (isLive) {
      updateAnalytics();
      intervalRef.current = setInterval(updateAnalytics, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

  const MetricCard = ({ title, value, unit, color, trend }: {
    title: string;
    value: number;
    unit: string;
    color: string;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {trend && (
          <span className={`text-xs ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );

  const renderMiniChart = (data: number[], color: string) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    return (
      <svg width="60" height="20" className="ml-2">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 60;
            const y = 20 - ((value - min) / range) * 20;
            return `${x},${y}`;
          }).join(' ')}
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              V2V Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Real-time performance metrics and business impact analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
              <span className="text-sm">{isLive ? 'Live' : 'Paused'}</span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLive ? '⏸ Pause' : '▶ Resume'}
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm text-gray-400">Time Range:</span>
          {(['1h', '24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Messages"
            value={analytics.totalMessages}
            unit=""
            color="text-blue-400"
            trend="up"
          />
          <MetricCard
            title="Active Vehicles"
            value={analytics.activeVehicles}
            unit=""
            color="text-green-400"
            trend="stable"
          />
          <MetricCard
            title="Collision Warnings"
            value={analytics.collisionWarnings}
            unit=""
            color="text-yellow-400"
            trend="down"
          />
          <MetricCard
            title="Emergency Alerts"
            value={analytics.emergencyAlerts}
            unit=""
            color="text-red-400"
            trend="stable"
          />
        </div>

        {/* Business Impact Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Business Impact</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Fuel Savings</span>
                <div className="flex items-center">
                  <span className="text-green-400 font-bold text-lg mr-2">
                    {analytics.fuelSavings.toFixed(1)}%
                  </span>
                  {renderMiniChart(
                    Array.from({length: 10}, () => Math.random() * 20 + analytics.fuelSavings - 10),
                    '#10B981'
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Response Time Improvement</span>
                <div className="flex items-center">
                  <span className="text-blue-400 font-bold text-lg mr-2">
                    {analytics.responseTimeImprovement.toFixed(1)}%
                  </span>
                  {renderMiniChart(
                    Array.from({length: 10}, () => Math.random() * 15 + analytics.responseTimeImprovement - 7),
                    '#3B82F6'
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Cooperative Events</span>
                <div className="flex items-center">
                  <span className="text-purple-400 font-bold text-lg mr-2">
                    {analytics.cooperativeDrivingEvents.toLocaleString()}
                  </span>
                  {renderMiniChart(
                    Array.from({length: 10}, () => Math.random() * 100),
                    '#A855F7'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Network Performance */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🌐 Network Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300">Uptime</span>
                  <span className="text-green-400 font-bold">{analytics.uptime.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.uptime}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300">Network Latency</span>
                  <span className="text-yellow-400 font-bold">{analytics.networkLatency}ms</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((analytics.networkLatency / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300">Signal Strength</span>
                  <span className="text-blue-400 font-bold">{analytics.signalStrength}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.signalStrength}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300">Area Coverage</span>
                  <span className="text-purple-400 font-bold">{analytics.areaCoverage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.areaCoverage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📈 Real-time Activity</h2>
          <div className="h-64 relative">
            {chartData.labels.length > 0 ? (
              <div className="relative h-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                  <span>500</span>
                  <span>375</span>
                  <span>250</span>
                  <span>125</span>
                  <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-16 mr-4 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-b border-slate-700 opacity-30"></div>
                    ))}
                  </div>

                  {/* Data lines */}
                  {chartData.datasets.map((dataset, datasetIndex) => (
                    <svg
                      key={datasetIndex}
                      className="absolute inset-0 w-full h-full"
                      style={{ zIndex: datasetIndex }}
                    >
                      <polyline
                        fill="none"
                        stroke={dataset.color}
                        strokeWidth="2"
                        points={dataset.data.map((value, index) => {
                          const x = (index / (dataset.data.length - 1 || 1)) * 100;
                          const y = 100 - (value / 500) * 100;
                          return `${x}%,${y}%`;
                        }).join(' ')}
                      />
                    </svg>
                  ))}

                  {/* Legend */}
                  <div className="absolute top-2 right-2 flex space-x-4 text-xs">
                    {chartData.datasets.map((dataset, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dataset.color }}
                        ></div>
                        <span className="text-gray-300">{dataset.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="ml-16 mr-4 flex justify-between text-xs text-gray-500 mt-2">
                  {chartData.labels.map((label, index) => (
                    <span key={index}>{index % 4 === 0 ? label : ''}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Starting real-time monitoring...
              </div>
            )}
          </div>
        </div>

        {/* Customer Success Metrics */}
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl p-8 border border-green-700/30">
          <h2 className="text-2xl font-bold mb-6 text-center">🏆 Customer Success Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.7%</div>
              <div className="text-sm text-gray-300">Customer Satisfaction</div>
              <div className="text-xs text-gray-500 mt-1">Industry: 87%</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">40%</div>
              <div className="text-sm text-gray-300">Faster Emergency Response</div>
              <div className="text-xs text-gray-500 mt-1">Saved 1,200+ hours/month</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$2.3M</div>
              <div className="text-sm text-gray-300">Annual Fuel Cost Savings</div>
              <div className="text-xs text-gray-500 mt-1">Per 1000 vehicles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;