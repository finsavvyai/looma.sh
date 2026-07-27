'use client';

import { useState, useEffect, useRef } from 'react';

interface Vehicle {
  id: string;
  x: number;
  y: number;
  speed: number;
  direction: number;
  type: 'car' | 'truck' | 'emergency' | 'bus';
  color: string;
  v2vMessages: V2VMessage[];
}

interface V2VMessage {
  id: string;
  from: string;
  to: string;
  type: 'COLLISION_WARNING' | 'EMERGENCY_ALERT' | 'TRAFFIC_INFO' | 'COOPERATIVE_DRIVING';
  content: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  learningObjectives: string[];
  setup: () => Vehicle[];
  winCondition: (vehicles: Vehicle[], messages: V2VMessage[]) => boolean;
}

const RealLifeScenarios: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [messages, setMessages] = useState<V2VMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [collisionPrevented, setCollisionPrevented] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const scenarios: Scenario[] = [
    {
      id: 'intersection-collision',
      name: 'Intersection Collision Prevention',
      description: 'Two vehicles approach a blind intersection. V2V communication must prevent collision by alerting drivers.',
      difficulty: 'beginner',
      estimatedTime: '2-3 minutes',
      learningObjectives: [
        'Understand basic V2V warning messages',
        'See how vehicles exchange position data',
        'Experience automatic collision alerts'
      ],
      setup: () => [
        {
          id: 'car-1',
          x: 100,
          y: 200,
          speed: 2,
          direction: 0, // East
          type: 'car',
          color: '#3B82F6',
          v2vMessages: []
        },
        {
          id: 'car-2',
          x: 400,
          y: 100,
          speed: 2,
          direction: 90, // South
          type: 'car',
          color: '#10B981',
          v2vMessages: []
        }
      ],
      winCondition: (vehicles, messages) => {
        const collisionWarning = messages.some(m => m.type === 'COLLISION_WARNING');
        const distance = Math.sqrt(
          Math.pow(vehicles[0].x - vehicles[1].x, 2) +
          Math.pow(vehicles[0].y - vehicles[1].y, 2)
        );
        return collisionWarning && distance > 30; // Collision prevented
      }
    },
    {
      id: 'emergency-priority',
      name: 'Emergency Vehicle Priority',
      description: 'An ambulance needs clear passage through traffic. Other vehicles receive alerts and automatically make way.',
      difficulty: 'intermediate',
      estimatedTime: '3-4 minutes',
      learningObjectives: [
        'Experience emergency V2V prioritization',
        'See cooperative driving behavior',
        'Understand traffic clearing protocols'
      ],
      setup: () => [
        {
          id: 'ambulance',
          x: 50,
          y: 250,
          speed: 3,
          direction: 0,
          type: 'emergency',
          color: '#EF4444',
          v2vMessages: []
        },
        {
          id: 'car-1',
          x: 200,
          y: 250,
          speed: 1.5,
          direction: 0,
          type: 'car',
          color: '#6B7280',
          v2vMessages: []
        },
        {
          id: 'car-2',
          x: 350,
          y: 250,
          speed: 1.5,
          direction: 0,
          type: 'car',
          color: '#6B7280',
          v2vMessages: []
        },
        {
          id: 'truck',
          x: 500,
          y: 250,
          speed: 1,
          direction: 0,
          type: 'truck',
          color: '#F59E0B',
          v2vMessages: []
        }
      ],
      winCondition: (vehicles, messages) => {
        const emergencyAlert = messages.some(m => m.type === 'EMERGENCY_ALERT');
        const ambulance = vehicles.find(v => v.type === 'emergency');
        const otherVehicles = vehicles.filter(v => v.type !== 'emergency');

        // Check if other vehicles have moved aside
        const hasMadeWay = otherVehicles.some(v => Math.abs(v.y - 250) > 50);
        return emergencyAlert && ambulance?.x > 550 && hasMadeWay;
      }
    },
    {
      id: 'platooning-efficiency',
      name: 'Truck Platooning Efficiency',
      description: 'Multiple trucks form a platoon to reduce fuel consumption through aerodynamic drafting and V2V coordination.',
      difficulty: 'advanced',
      estimatedTime: '5-6 minutes',
      learningObjectives: [
        'Master cooperative driving protocols',
        'Optimize vehicle spacing and timing',
        'Achieve fuel efficiency goals'
      ],
      setup: () => [
        {
          id: 'lead-truck',
          x: 100,
          y: 200,
          speed: 2,
          direction: 0,
          type: 'truck',
          color: '#F59E0B',
          v2vMessages: []
        },
        {
          id: 'follow-truck-1',
          x: 50,
          y: 200,
          speed: 2,
          direction: 0,
          type: 'truck',
          color: '#F59E0B',
          v2vMessages: []
        },
        {
          id: 'follow-truck-2',
          x: 0,
          y: 200,
          speed: 2,
          direction: 0,
          type: 'truck',
          color: '#F59E0B',
          v2vMessages: []
        }
      ],
      winCondition: (vehicles, messages) => {
        const cooperativeMessages = messages.filter(m => m.type === 'COOPERATIVE_DRIVING');
        const trucks = vehicles.filter(v => v.type === 'truck');

        // Check if trucks maintain optimal platooning distance (20-40 units)
        let optimalSpacing = true;
        for (let i = 1; i < trucks.length; i++) {
          const distance = trucks[i-1].x - trucks[i].x;
          if (distance < 20 || distance > 40) {
            optimalSpacing = false;
            break;
          }
        }

        return cooperativeMessages.length >= 10 && optimalSpacing && trucks[0].x > 600;
      }
    },
    {
      id: 'blind-spot-detection',
      name: 'Blind Spot Detection & Merging',
      description: 'A vehicle wants to merge but another car is in its blind spot. V2V communication prevents dangerous merging.',
      difficulty: 'beginner',
      estimatedTime: '2-3 minutes',
      learningObjectives: [
        'Experience blind spot safety features',
        'Understand merge assistance protocols',
        'See V2V in highway driving scenarios'
      ],
      setup: () => [
        {
          id: 'merging-car',
          x: 200,
          y: 180,
          speed: 2,
          direction: 0,
          type: 'car',
          color: '#3B82F6',
          v2vMessages: []
        },
        {
          id: 'fast-car',
          x: 150,
          y: 250,
          speed: 3,
          direction: 0,
          type: 'car',
          color: '#EF4444',
          v2vMessages: []
        }
      ],
      winCondition: (vehicles, messages) => {
        const warningMessages = messages.filter(m => m.type === 'COLLISION_WARNING');
        const mergingCar = vehicles.find(v => v.id === 'merging-car');
        const hasReceivedWarning = warningMessages.some(m => m.to === 'merging-car');

        return hasReceivedWarning && mergingCar && mergingCar.y < 220; // Merged safely
      }
    },
    {
      id: 'traffic-optimization',
      name: 'Smart Traffic Flow Optimization',
      description: 'Multiple vehicles communicate to optimize traffic flow through a busy intersection, reducing congestion.',
      difficulty: 'advanced',
      estimatedTime: '4-5 minutes',
      learningObjectives: [
        'Coordinate multi-vehicle traffic flow',
        'Optimize intersection crossing patterns',
        'Reduce congestion through V2V coordination'
      ],
      setup: () => [
        {
          id: 'car-north',
          x: 300,
          y: 50,
          speed: 1.5,
          direction: 90, // South
          type: 'car',
          color: '#3B82F6',
          v2vMessages: []
        },
        {
          id: 'car-south',
          x: 300,
          y: 450,
          speed: 1.5,
          direction: 270, // North
          type: 'car',
          color: '#10B981',
          v2vMessages: []
        },
        {
          id: 'car-east',
          x: 50,
          y: 250,
          speed: 1.5,
          direction: 0, // East
          type: 'car',
          color: '#F59E0B',
          v2vMessages: []
        },
        {
          id: 'car-west',
          x: 550,
          y: 250,
          speed: 1.5,
          direction: 180, // West
          type: 'car',
          color: '#EF4444',
          v2vMessages: []
        }
      ],
      winCondition: (vehicles, messages) => {
        const trafficMessages = messages.filter(m => m.type === 'TRAFFIC_INFO' || m.type === 'COOPERATIVE_DRIVING');
        const allVehiclesPassed = vehicles.every(v => {
          if (v.direction === 0) return v.x > 650;
          if (v.direction === 180) return v.x < -50;
          if (v.direction === 90) return v.y > 500;
          if (v.direction === 270) return v.y < 0;
          return false;
        });
        return trafficMessages.length >= 8 && allVehiclesPassed;
      }
    }
  ];

  const calculateDistance = (v1: Vehicle, v2: Vehicle): number => {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
  };

  const generateV2VMessage = (from: Vehicle, to: Vehicle, type: V2VMessage['type']): V2VMessage => {
    const distance = calculateDistance(from, to);
    let content = '';
    let priority: V2VMessage['priority'] = 'low';

    switch (type) {
      case 'COLLISION_WARNING':
        content = `⚠️ Collision risk detected! Vehicle ${from.id} is ${Math.round(distance)}m away`;
        priority = distance < 50 ? 'critical' : 'high';
        break;
      case 'EMERGENCY_ALERT':
        content = `🚨 Emergency vehicle ${from.id} approaching! Please clear the lane`;
        priority = 'critical';
        break;
      case 'TRAFFIC_INFO':
        content = `📊 Traffic update from ${from.id}: Optimal speed coordination available`;
        priority = 'medium';
        break;
      case 'COOPERATIVE_DRIVING':
        content = `🤝 Cooperative driving: ${from.id} proposing synchronized movement`;
        priority = 'medium';
        break;
    }

    return {
      id: `${Date.now()}-${Math.random()}`,
      from: from.id,
      to: to.id,
      type,
      content,
      timestamp: Date.now(),
      priority
    };
  };

  const updateSimulation = () => {
    if (!isRunning) return;

    setVehicles(prevVehicles => {
      const newVehicles = prevVehicles.map(vehicle => {
        let newX = vehicle.x + Math.cos(vehicle.direction * Math.PI / 180) * vehicle.speed;
        let newY = vehicle.y + Math.sin(vehicle.direction * Math.PI / 180) * vehicle.speed;

        // Bounce off walls
        if (newX < 0 || newX > 600) {
          vehicle.direction = 180 - vehicle.direction;
          newX = Math.max(0, Math.min(600, newX));
        }
        if (newY < 0 || newY > 500) {
          vehicle.direction = -vehicle.direction;
          newY = Math.max(0, Math.min(500, newY));
        }

        return { ...vehicle, x: newX, y: newY };
      });

      // Generate V2V messages based on proximity and scenarios
      const newMessages: V2VMessage[] = [];

      for (let i = 0; i < newVehicles.length; i++) {
        for (let j = i + 1; j < newVehicles.length; j++) {
          const v1 = newVehicles[i];
          const v2 = newVehicles[j];
          const distance = calculateDistance(v1, v2);

          // Emergency vehicle priority
          if (v1.type === 'emergency' && distance < 150) {
            newMessages.push(generateV2VMessage(v1, v2, 'EMERGENCY_ALERT'));
          } else if (v2.type === 'emergency' && distance < 150) {
            newMessages.push(generateV2VMessage(v2, v1, 'EMERGENCY_ALERT'));
          }

          // Collision warning
          if (distance < 60 && distance > 20) {
            if (Math.random() < 0.1) { // 10% chance per frame
              newMessages.push(generateV2VMessage(v1, v2, 'COLLISION_WARNING'));
              newMessages.push(generateV2VMessage(v2, v1, 'COLLISION_WARNING'));
            }
          }

          // Cooperative driving for platooning
          if (v1.type === 'truck' && v2.type === 'truck' && distance < 100 && distance > 30) {
            if (Math.random() < 0.05) { // 5% chance per frame
              newMessages.push(generateV2VMessage(v1, v2, 'COOPERATIVE_DRIVING'));
            }
          }

          // Traffic optimization
          if (distance < 150 && Math.random() < 0.03) {
            newMessages.push(generateV2VMessage(v1, v2, 'TRAFFIC_INFO'));
          }
        }
      }

      setMessages(prev => [...prev, ...newMessages].slice(-20)); // Keep last 20 messages

      // Check win condition
      if (selectedScenario && startTimeRef.current) {
        const scenario = scenarios.find(s => s.id === selectedScenario);
        if (scenario?.winCondition(newVehicles, [...messages, ...newMessages])) {
          setIsRunning(false);
          const completionTime = Math.round((Date.now() - startTimeRef.current!) / 1000);
          setScore(Math.max(0, 1000 - completionTime * 5 - messages.length * 2));
          setCollisionPrevented(true);
        }
      }

      return newVehicles;
    });

    setTimeElapsed(Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
    animationRef.current = requestAnimationFrame(updateSimulation);
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(updateSimulation);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, selectedScenario]);

  const startScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setVehicles(scenario.setup());
      setMessages([]);
      setScore(0);
      setTimeElapsed(0);
      setCollisionPrevented(false);
      setSelectedScenario(scenarioId);
      setIsRunning(false);
    }
  };

  const getScenario = () => scenarios.find(s => s.id === selectedScenario);

  const getDifficultyColor = (difficulty: Scenario['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
    }
  };

  const getPriorityColor = (priority: V2VMessage['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-900/20 border-red-500 text-red-300';
      case 'high': return 'bg-orange-900/20 border-orange-500 text-orange-300';
      case 'medium': return 'bg-yellow-900/20 border-yellow-500 text-yellow-300';
      case 'low': return 'bg-blue-900/20 border-blue-500 text-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Real-Life V2V Communication Scenarios
          </h1>
          <p className="text-xl text-gray-300">
            Experience actual vehicle-to-vehicle communication in realistic driving situations
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Scenarios Panel */}
          <div className="xl:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Select Scenario</h2>
            {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-slate-800/80'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => startScenario(scenario.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <span className={`text-sm ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">⏱️ {scenario.estimatedTime}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startScenario(scenario.id);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                  >
                    {selectedScenario === scenario.id ? 'Restart' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Controls */}
            {selectedScenario && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isRunning
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isRunning ? '⏸️ Pause' : '▶️ Start'}
                    </button>
                    <button
                      onClick={() => startScenario(selectedScenario)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                      🔄 Reset
                    </button>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div>⏱️ Time: <span className="font-mono">{timeElapsed}s</span></div>
                    <div>🎯 Score: <span className="font-mono">{score}</span></div>
                    {collisionPrevented && (
                      <div className="text-green-400 font-semibold">✅ Success!</div>
                    )}
                  </div>
                </div>

                {/* Learning Objectives */}
                {getScenario() && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-sm">🎯 Learning Objectives:</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {getScenario()!.learningObjectives.map((obj, idx) => (
                        <li key={idx}>• {obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Traffic Simulation */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">🚗 Traffic Simulation</h3>
              <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ width: '600px', height: '500px' }}>
                {/* Road markings */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white dashed"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white dashed"></div>
                  <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white dashed"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white dashed"></div>
                  <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white dashed"></div>
                  <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white dashed"></div>
                </div>

                {/* Vehicles */}
                {vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className={`absolute w-8 h-6 rounded transition-all duration-100 ${vehicle.type === 'emergency' ? 'animate-pulse' : ''}`}
                    style={{
                      left: `${vehicle.x - 16}px`,
                      top: `${vehicle.y - 12}px`,
                      backgroundColor: vehicle.color,
                      transform: `rotate(${vehicle.direction}deg)`,
                      boxShadow: vehicle.type === 'emergency' ? '0 0 20px rgba(239, 68, 68, 0.6)' : 'none'
                    }}
                  >
                    <div className="text-xs text-center font-bold">
                      {vehicle.type === 'emergency' ? '🚨' : vehicle.type === 'truck' ? '🚚' : vehicle.type === 'bus' ? '🚌' : '🚗'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Vehicle Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 bg-blue-500 rounded"></div>
                  <span>Car</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 bg-yellow-500 rounded"></div>
                  <span>Truck</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 bg-red-500 rounded animate-pulse"></div>
                  <span>Emergency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-3 bg-purple-500 rounded"></div>
                  <span>Bus</span>
                </div>
              </div>
            </div>

            {/* V2V Messages */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">📡 Live V2V Messages</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Start the simulation to see V2V messages...
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border text-sm font-mono ${getPriorityColor(message.priority)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          {message.from} → {message.to}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>{message.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Impact */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-700/30">
          <h2 className="text-2xl font-bold mb-6 text-center">💼 Real Business Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-2">🏢 Smart Cities</h3>
              <p className="text-sm text-gray-300">
                Reduce traffic congestion by 30% and emergency response times by 40% through V2V-coordinated traffic flow.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">🚚 Fleet Management</h3>
              <p className="text-sm text-gray-300">
                Save 15% on fuel costs with truck platooning and reduce accident rates by 60% with predictive collision avoidance.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-400 mb-2">🚑 Emergency Services</h3>
              <p className="text-sm text-gray-300">
                Improve emergency vehicle response times by 50% and clear traffic corridors automatically through V2V priority systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealLifeScenarios;