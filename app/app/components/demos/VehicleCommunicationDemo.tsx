'use client';

import { useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  type: 'car' | 'truck' | 'emergency' | 'bus';
  position: { x: number; y: number };
  speed: number;
  direction: number;
  color: string;
  messages: Message[];
}

interface Message {
  id: string;
  from: string;
  to: string;
  type: 'collision_warning' | 'emergency_alert' | 'traffic_info' | 'coordination';
  content: string;
  timestamp: number;
}

interface DemoScenario {
  id: string;
  name: string;
  description: string;
  vehicles: Vehicle[];
  messages: Message[];
  status: 'ready' | 'running' | 'completed';
}

const VehicleCommunicationDemo = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('collision_avoidance');
  const [isRunning, setIsRunning] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [communicationRange, setCommunicationRange] = useState(300);

  const scenarios: Record<string, DemoScenario> = {
    collision_avoidance: {
      id: 'collision_avoidance',
      name: 'Collision Avoidance',
      description: 'Real-time collision detection and warning system between vehicles',
      vehicles: [
        {
          id: 'car1',
          type: 'car',
          position: { x: 100, y: 200 },
          speed: 60,
          direction: 0,
          color: '#3B82F6',
          messages: []
        },
        {
          id: 'car2',
          type: 'car',
          position: { x: 400, y: 200 },
          speed: 80,
          direction: 180,
          color: '#EF4444',
          messages: []
        }
      ],
      messages: [],
      status: 'ready'
    },
    emergency_vehicle: {
      id: 'emergency_vehicle',
      name: 'Emergency Vehicle Priority',
      description: 'Emergency vehicle signals surrounding traffic to clear the path',
      vehicles: [
        {
          id: 'ambulance',
          type: 'emergency',
          position: { x: 50, y: 250 },
          speed: 100,
          direction: 0,
          color: '#DC2626',
          messages: []
        },
        {
          id: 'car1',
          type: 'car',
          position: { x: 200, y: 200 },
          speed: 50,
          direction: 0,
          color: '#3B82F6',
          messages: []
        },
        {
          id: 'car2',
          type: 'car',
          position: { x: 300, y: 300 },
          speed: 45,
          direction: 0,
          color: '#10B981',
          messages: []
        }
      ],
      messages: [],
      status: 'ready'
    },
    fleet_management: {
      id: 'fleet_management',
      name: 'Fleet Management',
      description: 'Coordination between delivery vehicles for optimal routing',
      vehicles: [
        {
          id: 'truck1',
          type: 'truck',
          position: { x: 100, y: 150 },
          speed: 40,
          direction: 45,
          color: '#F59E0B',
          messages: []
        },
        {
          id: 'truck2',
          type: 'truck',
          position: { x: 200, y: 250 },
          speed: 35,
          direction: 45,
          color: '#8B5CF6',
          messages: []
        },
        {
          id: 'truck3',
          type: 'truck',
          position: { x: 150, y: 350 },
          speed: 45,
          direction: 0,
          color: '#06B6D4',
          messages: []
        }
      ],
      messages: [],
      status: 'ready'
    },
    traffic_optimization: {
      id: 'traffic_optimization',
      name: 'Traffic Flow Optimization',
      description: 'Vehicles communicate to optimize traffic flow and reduce congestion',
      vehicles: [
        {
          id: 'car1',
          type: 'car',
          position: { x: 50, y: 200 },
          speed: 30,
          direction: 0,
          color: '#3B82F6',
          messages: []
        },
        {
          id: 'car2',
          type: 'car',
          position: { x: 150, y: 200 },
          speed: 35,
          direction: 0,
          color: '#EF4444',
          messages: []
        },
        {
          id: 'bus',
          type: 'bus',
          position: { x: 100, y: 250 },
          speed: 25,
          direction: 0,
          color: '#10B981',
          messages: []
        },
        {
          id: 'car3',
          type: 'car',
          position: { x: 250, y: 150 },
          speed: 40,
          direction: 90,
          color: '#F59E0B',
          messages: []
        }
      ],
      messages: [],
      status: 'ready'
    }
  };

  useEffect(() => {
    if (selectedScenario && scenarios[selectedScenario]) {
      setVehicles(scenarios[selectedScenario].vehicles);
      setMessages(scenarios[selectedScenario].messages);
    }
  }, [selectedScenario]);

  const calculateDistance = (v1: Vehicle, v2: Vehicle): number => {
    const dx = v1.position.x - v2.position.x;
    const dy = v1.position.y - v2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const generateMessage = (from: Vehicle, to: Vehicle, type: Message['type']): Message => {
    const messages = {
      collision_warning: `⚠️ Collision warning! ${from.id} detects ${to.id} in proximity`,
      emergency_alert: `🚨 Emergency vehicle ${from.id} approaching! Please clear the path.`,
      traffic_info: `📊 Traffic update from ${from.id}: Optimal speed ${from.speed} km/h`,
      coordination: `🤝 Coordination message: ${from.id} adjusting route for efficiency`
    };

    return {
      id: `msg_${Date.now()}_${Math.random()}`,
      from: from.id,
      to: to.id,
      type,
      content: messages[type],
      timestamp: Date.now()
    };
  };

  const runSimulation = () => {
    setIsRunning(true);
    let step = 0;
    const maxSteps = 50;

    const interval = setInterval(() => {
      step++;

      // Update vehicle positions
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.map(vehicle => {
          let newX = vehicle.position.x + Math.cos(vehicle.direction * Math.PI / 180) * vehicle.speed * 0.5;
          let newY = vehicle.position.y + Math.sin(vehicle.direction * Math.PI / 180) * vehicle.speed * 0.5;

          // Boundary check
          if (newX < 0 || newX > 500) newX = vehicle.position.x;
          if (newY < 0 || newY > 400) newY = vehicle.position.y;

          return {
            ...vehicle,
            position: { x: newX, y: newY }
          };
        });

        // Check for vehicle interactions and generate messages
        const newMessages: Message[] = [];
        updatedVehicles.forEach((v1, i) => {
          updatedVehicles.forEach((v2, j) => {
            if (i < j) {
              const distance = calculateDistance(v1, v2);

              if (distance < communicationRange) {
                if (selectedScenario === 'collision_avoidance' && distance < 100) {
                  newMessages.push(generateMessage(v1, v2, 'collision_warning'));
                } else if (selectedScenario === 'emergency_vehicle' && v1.type === 'emergency') {
                  newMessages.push(generateMessage(v1, v2, 'emergency_alert'));
                } else if (selectedScenario === 'fleet_management') {
                  newMessages.push(generateMessage(v1, v2, 'coordination'));
                } else if (selectedScenario === 'traffic_optimization') {
                  newMessages.push(generateMessage(v1, v2, 'traffic_info'));
                }
              }
            }
          });
        });

        if (newMessages.length > 0) {
          setMessages(prev => [...prev.slice(-10), ...newMessages]);
        }

        return updatedVehicles;
      });

      if (step >= maxSteps) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 200);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    if (selectedScenario && scenarios[selectedScenario]) {
      setVehicles(scenarios[selectedScenario].vehicles);
      setMessages([]);
    }
  };

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'emergency':
        return '🚑';
      case 'truck':
        return '🚚';
      case 'bus':
        return '🚌';
      default:
        return '🚗';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Live V2V Communication Demo
          </h1>
          <p className="text-xl text-gray-300">
            Experience real-time vehicle-to-vehicle communication in action
          </p>
        </div>

        {/* Scenario Selection */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Scenario:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(scenarios).map(scenario => (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario.id);
                  resetSimulation();
                }}
                className={`p-3 rounded-lg text-sm transition-all ${
                  selectedScenario === scenario.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <div className="font-medium">{scenario.name}</div>
                <div className="text-xs mt-1 opacity-75">{scenario.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Control Panel</h3>
            <div className="flex gap-4">
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="px-6 py-2 bg-green-600 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isRunning ? 'Running...' : 'Start Simulation'}
              </button>
              <button
                onClick={resetSimulation}
                className="px-6 py-2 bg-orange-600 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Communication Range:</label>
              <input
                type="range"
                min="50"
                max="200"
                value={communicationRange}
                onChange={(e) => setCommunicationRange(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-300 w-12">{communicationRange}m</span>
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Map */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Communication Map</h3>
            <div className="relative bg-slate-900 rounded-lg" style={{ height: '400px' }}>
              {/* Communication Range Visualization */}
              {vehicles.map(vehicle => (
                <div
                  key={`range-${vehicle.id}`}
                  className="absolute border border-blue-400 rounded-full opacity-20"
                  style={{
                    left: `${vehicle.position.x - communicationRange}px`,
                    top: `${vehicle.position.y - communicationRange}px`,
                    width: `${communicationRange * 2}px`,
                    height: `${communicationRange * 2}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}

              {/* Vehicles */}
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className="absolute cursor-pointer transition-all duration-200"
                  style={{
                    left: `${vehicle.position.x}px`,
                    top: `${vehicle.position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: selectedVehicle === vehicle.id ? '2rem' : '1.5rem'
                  }}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  <div className="relative">
                    {getVehicleIcon(vehicle.type)}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-25"
                      style={{ backgroundColor: vehicle.color }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1 bg-slate-800 rounded px-1 py-0.5">
                    {vehicle.id}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚗</span>
                <span>Car</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚚</span>
                <span>Truck</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚑</span>
                <span>Emergency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚌</span>
                <span>Bus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-blue-400 rounded-full opacity-20"></div>
                <span>Communication Range</span>
              </div>
            </div>
          </div>

          {/* Communication Log */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Communication Log</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">No communications yet. Start the simulation to see V2V messages.</p>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className="bg-slate-700 rounded-lg p-3 text-sm animate-pulse"
                    style={{ animationDuration: '1s', animationIterationCount: '1' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-blue-400">{message.from}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-200">{message.content}</div>
                    <div className="text-xs text-gray-400 mt-1">To: {message.to}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        {selectedVehicle && (
          <div className="mt-6 bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Details: {selectedVehicle}</h3>
            {vehicles.filter(v => v.id === selectedVehicle).map(vehicle => (
              <div key={vehicle.id} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Type</div>
                  <div className="capitalize">{vehicle.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Speed</div>
                  <div>{vehicle.speed} km/h</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Position</div>
                  <div>({Math.round(vehicle.position.x)}, {Math.round(vehicle.position.y)})</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Direction</div>
                  <div>{vehicle.direction}°</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real-time Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{vehicles.length}</div>
            <div className="text-sm text-gray-400">Active Vehicles</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{messages.length}</div>
            <div className="text-sm text-gray-400">Messages Sent</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{communicationRange}m</div>
            <div className="text-sm text-gray-400">Comm Range</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{isRunning ? 'Active' : 'Idle'}</div>
            <div className="text-sm text-gray-400">System Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCommunicationDemo;