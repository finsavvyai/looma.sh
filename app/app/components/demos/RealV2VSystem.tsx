'use client';

import { useState, useEffect, useCallback } from 'react';

interface VehicleData {
  id: string;
  type: 'car' | 'truck' | 'emergency' | 'bus';
  position: { lat: number; lng: number };
  speed: number; // km/h
  heading: number; // degrees
  acceleration: number; // m/s²
  engineStatus: 'running' | 'idle' | 'emergency' | 'stopped';
  turnSignal: 'none' | 'left' | 'right';
  brakes: 'none' | 'normal' | 'emergency';
  lights: {
    headlights: boolean;
    hazardLights: boolean;
    emergencyLights: boolean;
  };
  sensors: {
    proximity: number[]; // distance to nearby objects
    lanePosition: 'center' | 'left' | 'right';
    blindSpotAlert: boolean;
  };
}

interface V2VMessage {
  id: string;
  from: string;
  to: 'broadcast' | string;
  type: 'status_update' | 'collision_warning' | 'emergency_alert' | 'traffic_info' | 'cooperative_driving';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: number;
  signalStrength: number; // dBm
}

interface RealV2VSystemProps {
  simulationMode: 'real' | 'demo';
}

const soraPrompt = `Screen recording of the “Real V2V Communication System” page on a dark neon slate UI. A realistic cursor hovers over the live dashboard: status tiles show ONLINE, GPS ACTIVE, ~12ms latency, ~10Hz message rate. On the left, vehicle markers with emojis (🚑 ambulance, 🚚 truck, 🚗 cars) move slightly on a dark grid map; an emergency vehicle flashes 🚨. On the right, live V2V message cards pulse with labels like EMERGENCY_ALERT, COLLISION_WARNING, STATUS_UPDATE, showing speed and signal strength with fresh timestamps. The cursor scrolls the message log briefly and hovers over a vehicle card showing speed and proximity. Smooth UI glow, subtle animations, 16:9, ~12 seconds, crisp screen capture, steady frame, realistic cursor motion.`;

const RealV2VSystem: React.FC<RealV2VSystemProps> = ({ simulationMode }) => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [messages, setMessages] = useState<V2VMessage[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    v2vEnabled: true,
    gpsActive: true,
    sensorStatus: 'operational',
    networkLatency: 0, // ms
    messageFrequency: 10 // Hz
  });
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Real V2V message generation based on vehicle state
  const generateV2VMessage = useCallback((vehicle: VehicleData): V2VMessage | null => {
    const timestamp = Date.now();

    // Priority 1: Emergency alerts
    if (vehicle.engineStatus === 'emergency' || vehicle.brakes === 'emergency') {
      return {
        id: `msg_${vehicle.id}_${timestamp}_emergency`,
        from: vehicle.id,
        to: 'broadcast',
        type: 'emergency_alert',
        priority: 'critical',
        data: {
          emergencyType: vehicle.engineStatus === 'emergency' ? 'siren_active' : 'emergency_braking',
          position: vehicle.position,
          heading: vehicle.heading,
          speed: vehicle.speed,
          requestedLaneClearance: true
        },
        timestamp,
        signalStrength: -65 + Math.random() * 10
      };
    }

    // Priority 2: Collision warnings
    const nearbyVehicles = vehicles.filter(v => v.id !== vehicle.id);
    for (const other of nearbyVehicles) {
      const distance = calculateDistance(vehicle.position, other.position);
      const relativeSpeed = Math.abs(vehicle.speed - other.speed);

      if (distance < 50 && relativeSpeed > 20) { // 50m proximity, high speed difference
        return {
          id: `msg_${vehicle.id}_${timestamp}_collision`,
          from: vehicle.id,
          to: other.id,
          type: 'collision_warning',
          priority: 'high',
          data: {
            threatVehicle: other.id,
            distance: distance,
            relativeSpeed: relativeSpeed,
            recommendedAction: distance < 30 ? 'emergency_brake' : 'reduce_speed'
          },
          timestamp,
          signalStrength: -70 + Math.random() * 15
        };
      }
    }

    // Priority 3: Regular status updates (every 100ms)
    return {
      id: `msg_${vehicle.id}_${timestamp}_status`,
      from: vehicle.id,
      to: 'broadcast',
      type: 'status_update',
      priority: 'low',
      data: {
        position: vehicle.position,
        speed: vehicle.speed,
        heading: vehicle.heading,
        acceleration: vehicle.acceleration,
        engineStatus: vehicle.engineStatus,
        turnSignal: vehicle.turnSignal,
        lights: vehicle.lights,
        sensors: vehicle.sensors
      },
      timestamp,
      signalStrength: -75 + Math.random() * 20
    };
  }, [vehicles]);

  // Initialize vehicles with realistic data
  useEffect(() => {
    const initialVehicles: VehicleData[] = [
      {
        id: 'AMBULANCE_001',
        type: 'emergency',
        position: { lat: 40.7589, lng: -73.9851 }, // NYC coordinates
        speed: 0,
        heading: 45,
        acceleration: 0,
        engineStatus: 'running',
        turnSignal: 'none',
        brakes: 'none',
        lights: {
          headlights: true,
          hazardLights: false,
          emergencyLights: false
        },
        sensors: {
          proximity: [100, 150, 80, 120],
          lanePosition: 'center',
          blindSpotAlert: false
        }
      },
      {
        id: 'CAR_001',
        type: 'car',
        position: { lat: 40.7590, lng: -73.9850 },
        speed: 45,
        heading: 45,
        acceleration: 0.5,
        engineStatus: 'running',
        turnSignal: 'none',
        brakes: 'none',
        lights: {
          headlights: true,
          hazardLights: false,
          emergencyLights: false
        },
        sensors: {
          proximity: [50, 200, 60, 180],
          lanePosition: 'center',
          blindSpotAlert: false
        }
      },
      {
        id: 'TRUCK_001',
        type: 'truck',
        position: { lat: 40.7588, lng: -73.9852 },
        speed: 55,
        heading: 45,
        acceleration: 0,
        engineStatus: 'running',
        turnSignal: 'right',
        brakes: 'none',
        lights: {
          headlights: true,
          hazardLights: false,
          emergencyLights: false
        },
        sensors: {
          proximity: [80, 120, 90, 110],
          lanePosition: 'left',
          blindSpotAlert: true
        }
      }
    ];

    setVehicles(initialVehicles);
  }, []);

  // Simulate real-time vehicle behavior and V2V communication
  useEffect(() => {
    if (vehicles.length === 0) return;

    const interval = setInterval(() => {
      // Update vehicle positions and states
      setVehicles(prevVehicles => {
        const updated = prevVehicles.map(vehicle => {
          const updatedVehicle = { ...vehicle };

          // Update position based on speed and heading
          const speedInMs = vehicle.speed / 3.6; // Convert km/h to m/s
          const deltaLat = (speedInMs * 0.1 * Math.cos(vehicle.heading * Math.PI / 180)) / 111320;
          const deltaLng = (speedInMs * 0.1 * Math.sin(vehicle.heading * Math.PI / 180)) / (111320 * Math.cos(vehicle.position.lat * Math.PI / 180));

          updatedVehicle.position = {
            lat: vehicle.position.lat + deltaLat,
            lng: vehicle.position.lng + deltaLng
          };

          // Simulate realistic vehicle behavior
          if (vehicle.type === 'emergency' && Math.random() > 0.7) {
            updatedVehicle.engineStatus = 'emergency';
            updatedVehicle.lights.emergencyLights = true;
            updatedVehicle.speed = 80; // Emergency speed
          }

          // Simulate traffic variations
          if (vehicle.type === 'car') {
            updatedVehicle.speed += (Math.random() - 0.5) * 5;
            updatedVehicle.speed = Math.max(20, Math.min(80, updatedVehicle.speed));
          }

          // Update sensors with realistic data
          updatedVehicle.sensors.proximity = updatedVehicle.sensors.proximity.map(
            dist => Math.max(10, dist + (Math.random() - 0.5) * 20)
          );

          return updatedVehicle;
        });

        // Generate V2V messages for each vehicle
        updated.forEach(vehicle => {
          const message = generateV2VMessage(vehicle);
          if (message) {
            setMessages(prev => {
              const newMessages = [...prev, message];
              // Keep only last 100 messages
              return newMessages.slice(-100);
            });
          }
        });

        return updated;
      });

      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        networkLatency: 5 + Math.random() * 20,
        messageFrequency: 9 + Math.random() * 2
      }));

    }, 100); // 10 Hz update rate (100ms intervals)

    return () => clearInterval(interval);
  }, [vehicles.length, generateV2VMessage]);

  // Calculate distance between two GPS coordinates
  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const getVehicleIcon = (type: VehicleData['type']) => {
    switch (type) {
      case 'emergency': return '🚑';
      case 'truck': return '🚚';
      case 'bus': return '🚌';
      default: return '🚗';
    }
  };

  const getMessageColor = (priority: V2VMessage['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-blue-400 bg-blue-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Real V2V Communication System
          </h1>
          <p className="text-xl text-gray-300">
            {simulationMode === 'real' ? 'Live vehicle-to-vehicle communication with automatic message generation' : 'Simulation mode'}
          </p>
        </div>

        {/* Sora workflow helper */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Generate a Sora clip</h3>
              <p className="text-sm text-gray-400">Copy the prompt, paste it into Sora, render, then drop the video URL to preview it here.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(soraPrompt).then(() => {
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }).catch(() => setCopiedPrompt(false));
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
              >
                {copiedPrompt ? 'Copied!' : 'Copy Prompt'}
              </button>
              <a
                href="https://openai.com/sora" // landing page; update to Sora UI when available
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Open Sora
              </a>
            </div>
          </div>
          <textarea
            value={soraPrompt}
            readOnly
            className="w-full bg-slate-800 text-gray-100 text-sm rounded-lg p-3 border border-slate-700"
            rows={4}
          />
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="url"
              placeholder="Paste Sora video URL (mp4/webm)…"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-100"
            />
            {videoUrl && (
              <span className="text-xs text-gray-400">Previewing pasted clip below</span>
            )}
          </div>
          {videoUrl && (
            <div className="mt-2">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-xl border border-slate-800 bg-black"
              />
            </div>
          )}
        </div>

        {/* System Status Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${systemStatus.v2vEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.v2vEnabled ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className="text-sm text-gray-400">V2V System</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${systemStatus.gpsActive ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.gpsActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="text-sm text-gray-400">GPS Status</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {systemStatus.networkLatency.toFixed(1)}ms
            </div>
            <div className="text-sm text-gray-400">Network Latency</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {systemStatus.messageFrequency.toFixed(1)}Hz
            </div>
            <div className="text-sm text-gray-400">Message Rate</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {vehicles.length}
            </div>
            <div className="text-sm text-gray-400">Active Vehicles</div>
          </div>
        </div>

        {/* Vehicle Status Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Live Vehicle Map */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Live Vehicle Positions</h3>
            <div className="bg-slate-900 rounded-lg p-4 h-96 relative overflow-hidden">
              {/* Simulated map background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50"></div>

              {/* Vehicle markers */}
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className="absolute transition-all duration-100"
                  style={{
                    left: `${50 + (vehicle.position.lng - (-73.9851)) * 10000}%`,
                    top: `${50 - (vehicle.position.lat - 40.7589) * 10000}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="relative">
                    <span className="text-2xl">{getVehicleIcon(vehicle.type)}</span>
                    {vehicle.lights.emergencyLights && (
                      <div className="absolute inset-0 animate-ping">
                        <span className="text-2xl">🚨</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white bg-slate-700 rounded px-1 mt-1 whitespace-nowrap">
                    {vehicle.id.split('_')[0]} • {vehicle.speed}km/h
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time V2V Messages */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Live V2V Messages</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Initializing V2V communication...</p>
              ) : (
                messages.slice(-20).reverse().map(message => (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 text-sm font-mono ${getMessageColor(message.priority)} animate-pulse`}
                    style={{ animationDuration: '1s', animationIterationCount: '1' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">
                        {message.from} → {message.to === 'broadcast' ? 'ALL' : message.to}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">{message.type.replace('_', ' ').toUpperCase()}</span>
                      {message.data.emergencyType && (
                        <span className="ml-2">• {message.data.emergencyType.replace('_', ' ')}</span>
                      )}
                    </div>
                    {message.data.speed && (
                      <div className="text-xs mt-1">
                        Speed: {message.data.speed}km/h | Signal: {message.signalStrength.toFixed(1)}dBm
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Telemetry */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Vehicle Telemetry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg">
                    {getVehicleIcon(vehicle.type)} {vehicle.id}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    vehicle.engineStatus === 'emergency'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-green-600 text-white'
                  }`}>
                    {vehicle.engineStatus.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed:</span>
                    <span className="font-mono">{vehicle.speed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heading:</span>
                    <span className="font-mono">{vehicle.heading}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="font-mono text-xs">
                      {vehicle.position.lat.toFixed(4)}, {vehicle.position.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Proximity:</span>
                    <span className="font-mono text-xs">
                      {Math.min(...vehicle.sensors.proximity).toFixed(0)}m - {Math.max(...vehicle.sensors.proximity).toFixed(0)}m
                    </span>
                  </div>
                  {vehicle.sensors.blindSpotAlert && (
                    <div className="text-yellow-400 text-xs font-bold">⚠️ BLIND SPOT ALERT</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealV2VSystem;
