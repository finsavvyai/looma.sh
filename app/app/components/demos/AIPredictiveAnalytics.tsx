'use client';

import { useState, useEffect, useRef } from 'react';

interface Prediction {
  id: string;
  type: 'collision-risk' | 'traffic-congestion' | 'emergency-route' | 'fuel-optimization';
  confidence: number;
  timeWindow: string;
  location: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  vehicles: number;
  estimatedCost: number;
  estimatedSavings: number;
}

interface AIMetrics {
  accuracy: number;
  falsePositiveRate: number;
  responseTime: number;
  predictionsMade: number;
  livesSaved: number;
  accidentsPrevented: number;
  fuelOptimized: number;
  timeSaved: number;
}

interface NeuralNetworkActivity {
  layer: string;
  neurons: number;
  activation: number;
  connections: number;
}

const AIPredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [metrics, setMetrics] = useState<AIMetrics>({
    accuracy: 0,
    falsePositiveRate: 0,
    responseTime: 0,
    predictionsMade: 0,
    livesSaved: 0,
    accidentsPrevented: 0,
    fuelOptimized: 0,
    timeSaved: 0
  });
  const [neuralActivity, setNeuralActivity] = useState<NeuralNetworkActivity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize neural network layers
    const layers: NeuralNetworkActivity[] = [
      { layer: 'Input Layer', neurons: 128, activation: 0.85, connections: 1024 },
      { layer: 'Hidden Layer 1', neurons: 256, activation: 0.92, connections: 4096 },
      { layer: 'Hidden Layer 2', neurons: 512, activation: 0.78, connections: 8192 },
      { layer: 'Hidden Layer 3', neurons: 256, activation: 0.88, connections: 4096 },
      { layer: 'Output Layer', neurons: 64, activation: 0.95, connections: 1024 }
    ];
    setNeuralActivity(layers);

    // Generate initial predictions
    generatePredictions();

    // Real-time updates
    if (realTimeMode) {
      const interval = setInterval(() => {
        updateMetrics();
        updateNeuralActivity();
        if (Math.random() < 0.3) {
          generatePredictions();
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  const generatePredictions = () => {
    const predictionTypes: Prediction['type'][] = [
      'collision-risk',
      'traffic-congestion',
      'emergency-route',
      'fuel-optimization'
    ];

    const locations = [
      'Highway 101 & Market St',
      'Downtown Financial District',
      'Airport Access Road',
      'Industrial Zone - Sector 7',
      'Residential Area - Oak Valley'
    ];

    const timeWindows = ['Next 5 min', 'Next 15 min', 'Next 30 min', 'Next 1 hour'];

    const newPredictions: Prediction[] = predictionTypes.map((type, index) => ({
      id: `pred-${Date.now()}-${index}`,
      type,
      confidence: 70 + Math.random() * 30,
      timeWindow: timeWindows[Math.floor(Math.random() * timeWindows.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      impact: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as Prediction['impact'],
      recommendations: generateRecommendations(type),
      vehicles: Math.floor(Math.random() * 100) + 10,
      estimatedCost: Math.floor(Math.random() * 50000) + 5000,
      estimatedSavings: Math.floor(Math.random() * 100000) + 10000
    }));

    setPredictions(prev => [...newPredictions, ...prev].slice(0, 8));
  };

  const generateRecommendations = (type: Prediction['type']): string[] => {
    const recommendations = {
      'collision-risk': [
        'Reduce speed by 20%',
        'Increase following distance to 4 seconds',
        'Alert nearby vehicles via V2V',
        'Prepare automatic emergency braking'
      ],
      'traffic-congestion': [
        'Suggest alternative routes to 30% of vehicles',
        'Adjust traffic signal timing',
        'Increase vehicle spacing to 3 seconds',
        'Activate platooning mode'
      ],
      'emergency-route': [
        'Clear traffic corridor immediately',
        'Prioritize traffic signals for emergency vehicle',
        'Alert vehicles 2km ahead',
        'Coordinate with traffic control center'
      ],
      'fuel-optimization': [
        'Optimize acceleration profiles',
        'Suggest optimal cruising speed',
        'Coordinate platooning opportunities',
        'Adjust engine timing for efficiency'
      ]
    };

    return recommendations[type] || [];
  };

  const updateMetrics = () => {
    setMetrics(prev => ({
      accuracy: Math.min(99.9, prev.accuracy + (Math.random() - 0.3) * 2),
      falsePositiveRate: Math.max(0.1, prev.falsePositiveRate + (Math.random() - 0.5) * 0.5),
      responseTime: Math.max(12, prev.responseTime + (Math.random() - 0.5) * 5),
      predictionsMade: prev.predictionsMade + Math.floor(Math.random() * 50),
      livesSaved: prev.livesSaved + (Math.random() < 0.1 ? 1 : 0),
      accidentsPrevented: prev.accidentsPrevented + Math.floor(Math.random() * 3),
      fuelOptimized: prev.fuelOptimized + Math.random() * 20,
      timeSaved: prev.timeSaved + Math.random() * 10
    }));
  };

  const updateNeuralActivity = () => {
    setNeuralActivity(prev =>
      prev.map(layer => ({
        ...layer,
        activation: Math.max(0.3, Math.min(1, layer.activation + (Math.random() - 0.5) * 0.1))
      }))
    );
  };

  const getPredictionIcon = (type: Prediction['type']) => {
    const icons = {
      'collision-risk': '⚠️',
      'traffic-congestion': '🚗',
      'emergency-route': '🚑',
      'fuel-optimization': '⚡'
    };
    return icons[type];
  };

  const getImpactColor = (impact: Prediction['impact']) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      critical: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return colors[impact];
  };

  const runPrediction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      generatePredictions();
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            AI-Powered Predictive Analytics
          </h1>
          <p className="text-xl text-gray-300">
            Advanced neural networks predicting traffic events before they happen
          </p>
        </div>

        {/* Neural Network Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🧠 Neural Network Activity</h2>
              <button
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  realTimeMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {realTimeMode ? '🔴 Live' : '⏸️ Paused'}
              </button>
            </div>

            <div className="space-y-3">
              {neuralActivity.map((layer, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-32 text-sm text-gray-400">{layer.layer}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500">{layer.neurons} neurons</span>
                      <span className="text-xs text-gray-500">{layer.connections} connections</span>
                      <span className="text-xs font-mono text-purple-400">
                        {(layer.activation * 100).toFixed(1)}% active
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${layer.activation * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Neural Network Animation */}
            <div className="mt-6 h-32 bg-slate-900 rounded-lg relative overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                width={800}
                height={128}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs text-gray-500 font-mono">
                  Processing {metrics.predictionsMade.toLocaleString()} predictions...
                </div>
              </div>
            </div>
          </div>

          {/* AI Performance Metrics */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 AI Performance</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Accuracy</span>
                  <span className="text-sm font-mono text-green-400">{metrics.accuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${metrics.accuracy}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">False Positive Rate</span>
                  <span className="text-sm font-mono text-yellow-400">{metrics.falsePositiveRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${metrics.falsePositiveRate * 10}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Response Time</span>
                  <span className="text-sm font-mono text-blue-400">{metrics.responseTime.toFixed(0)}ms</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min((metrics.responseTime / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-sm font-semibold mb-3 text-green-400">Impact Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lives Saved</span>
                    <span className="font-bold text-green-400">{metrics.livesSaved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accidents Prevented</span>
                    <span className="font-bold text-yellow-400">{metrics.accidentsPrevented}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fuel Optimized (L)</span>
                    <span className="font-bold text-blue-400">{Math.floor(metrics.fuelOptimized)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Saved (min)</span>
                    <span className="font-bold text-purple-400">{Math.floor(metrics.timeSaved)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions Panel */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">🔮 Live Predictions</h2>
            <button
              onClick={runPrediction}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isProcessing
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
              }`}
            >
              {isProcessing ? '🔄 Processing...' : '⚡ Run Prediction'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                onClick={() => setSelectedPrediction(
                  selectedPrediction === prediction.id ? null : prediction.id
                )}
                className={`relative bg-slate-900/50 border rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedPrediction === prediction.id ? 'border-purple-500 bg-slate-900/80' : 'border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPredictionIcon(prediction.type)}</span>
                    <div>
                      <div className="text-sm font-semibold capitalize">
                        {prediction.type.replace('-', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">{prediction.timeWindow}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(prediction.impact)}`}>
                    {prediction.impact}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="font-mono text-blue-400">{prediction.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Vehicles:</span>
                    <span className="font-mono text-purple-400">{prediction.vehicles}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    📍 {prediction.location}
                  </div>
                </div>

                {selectedPrediction === prediction.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs font-semibold mb-2 text-green-400">AI Recommendations:</div>
                    <ul className="space-y-1">
                      {prediction.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-xs text-gray-300">• {rec}</li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Cost: </span>
                        <span className="text-red-400">${prediction.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Savings: </span>
                        <span className="text-green-400">${prediction.estimatedSavings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Model Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30">
            <h3 className="text-lg font-semibold mb-4">🔬 Model Insights</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">
                  <strong>Pattern Recognition:</strong> AI has identified 47 unique traffic patterns across the city
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">
                  <strong>Behavioral Analysis:</strong> 99.2% accuracy in predicting driver reactions
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">
                  <strong>Environmental Factors:</strong> Weather integration improves accuracy by 23%
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">⚡</span>
                <span className="text-gray-300">
                  <strong>Learning Rate:</strong> Model improves 0.3% daily with new data
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30">
            <h3 className="text-lg font-semibold mb-4">🎯 Business Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ROI in First Year</span>
                <span className="text-2xl font-bold text-green-400">327%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Risk Reduction</span>
                <span className="text-xl font-bold text-blue-400">-82%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Efficiency Gain</span>
                <span className="text-xl font-bold text-purple-400">+67%</span>
              </div>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Next 30 Days Projection</div>
                <div className="text-lg font-bold text-green-400">
                  ${Math.floor(metrics.accidentsPrevented * 15000 + metrics.fuelOptimized * 100).toLocaleString()} Savings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictiveAnalytics;