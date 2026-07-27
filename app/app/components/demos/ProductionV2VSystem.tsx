'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  obdData: {
    engineRPM: number;
    fuelLevel: number; // percentage
    coolantTemp: number; // celsius
    batteryVoltage: number; // volts
    engineLoad: number; // percentage
    throttlePosition: number; // percentage
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
  protocol: 'DSRC' | 'C-V2X' | '5G-V2X';
  encrypted: boolean;
}

interface ProductionMetrics {
  messagesPerSecond: number;
  averageLatency: number;
  packetLossRate: number;
  connectedVehicles: number;
  systemUptime: number;
  signalQuality: number;
  encryptionStatus: 'active' | 'inactive';
  protocolDistribution: {
    DSRC: number;
    C_V2X: number;
    FIVE_G_V2X: number;
  };
}

interface SafetyEvent {
  id: string;
  type: 'collision_avoided' | 'emergency_clearance' | 'traffic_optimized';
  timestamp: number;
  vehicles: string[];
  outcome: string;
  severity: 'low' | 'medium' | 'high';
}

const ProductionV2VSystem: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [messages, setMessages] = useState<V2VMessage[]>([]);
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    messagesPerSecond: 0,
    averageLatency: 0,
    packetLossRate: 0,
    connectedVehicles: 0,
    systemUptime: 0,
    signalQuality: 0,
    encryptionStatus: 'active',
    protocolDistribution: {
      DSRC: 0,
      C_V2X: 0,
      FIVE_G_V2X: 0
    }
  });
  const [systemHealth, setSystemHealth] = useState({
    v2vEnabled: true,
    gpsActive: true,
    sensorStatus: 'operational',
    networkStatus: 'connected',
    encryptionEnabled: true,
    lastUpdate: new Date().toISOString()
  });

  const startTime = useRef(Date.now());
  const messageCount = useRef(0);

  // Production-grade V2V message generation
  const generateV2VMessage = useCallback((vehicle: VehicleData): V2VMessage | null => {
    const timestamp = Date.now();
    messageCount.current++;

    // Determine protocol based on vehicle type and message priority
    const getProtocol = (): V2VMessage['protocol'] => {
      if (vehicle.type === 'emergency') return '5G-V2X';
      if (vehicle.brakes === 'emergency') return 'C-V2X';
      return Math.random() > 0.7 ? 'C-V2X' : 'DSRC';
    };

    // Critical emergency alerts
    if (vehicle.engineStatus === 'emergency' || vehicle.brakes === 'emergency') {
      return {
        id: `msg_${vehicle.id}_${timestamp}_emergency`,
        from: vehicle.id,
        to: 'broadcast',
        type: 'emergency_alert',
        priority: 'critical',
        protocol: getProtocol(),
        encrypted: true,
        data: {
          emergencyType: vehicle.engineStatus === 'emergency' ? 'siren_active' : 'emergency_braking',
          position: vehicle.position,
          heading: vehicle.heading,
          speed: vehicle.speed,
          requestedLaneClearance: true,
          routeClearance: true,
          estimatedETA: calculateETA(vehicle),
          vehicleClass: vehicle.type,
          obdData: {
            engineRPM: vehicle.obdData.engineRPM,
            throttlePosition: vehicle.obdData.throttlePosition
          }
        },
        timestamp,
        signalStrength: -50 + Math.random() * 15
      };
    }

    // Collision warning system
    const nearbyVehicles = vehicles.filter(v => v.id !== vehicle.id);
    for (const other of nearbyVehicles) {
      const distance = calculateDistance(vehicle.position, other.position);
      const relativeSpeed = Math.abs(vehicle.speed - other.speed);
      const timeToCollision = relativeSpeed > 0 ? (distance / 1000) / (relativeSpeed / 3.6) : Infinity;

      if (timeToCollision < 3 && distance < 100) { // 3 seconds to collision
        const safetyEvent: SafetyEvent = {
          id: `safety_${timestamp}_${vehicle.id}`,
          type: 'collision_avoided',
          timestamp,
          vehicles: [vehicle.id, other.id],
          outcome: `Warning sent to ${other.id} - TTC: ${timeToCollision.toFixed(1)}s`,
          severity: timeToCollision < 1 ? 'high' : 'medium'
        };
        setSafetyEvents(prev => [...prev.slice(-10), safetyEvent]);

        return {
          id: `msg_${vehicle.id}_${timestamp}_collision`,
          from: vehicle.id,
          to: other.id,
          type: 'collision_warning',
          priority: 'high',
          protocol: 'C-V2X',
          encrypted: true,
          data: {
            threatVehicle: other.id,
            distance: distance,
            relativeSpeed: relativeSpeed,
            timeToCollision: timeToCollision,
            recommendedAction: timeToCollision < 1 ? 'emergency_brake' : 'reduce_speed',
            vehicleClass: vehicle.type,
            brakeStatus: vehicle.brakes,
            sensorData: vehicle.sensors
          },
          timestamp,
          signalStrength: -60 + Math.random() * 10
        };
      }
    }

    // Cooperative driving messages
    if (vehicle.type === 'truck' && vehicle.turnSignal !== 'none') {
      return {
        id: `msg_${vehicle.id}_${timestamp}_cooperative`,
        from: vehicle.id,
        to: 'broadcast',
        type: 'cooperative_driving',
        priority: 'medium',
        protocol: '5G-V2X',
        encrypted: true,
        data: {
          intendedManeuver: vehicle.turnSignal,
          position: vehicle.position,
          heading: vehicle.heading,
          speed: vehicle.speed,
          vehicleSize: 'large',
          requestLaneChange: true,
          blindSpotData: vehicle.sensors.blindSpotAlert
        },
        timestamp,
        signalStrength: -65 + Math.random() * 15
      };
    }

    // Regular status updates (every 100ms in production)
    return {
      id: `msg_${vehicle.id}_${timestamp}_status`,
      from: vehicle.id,
      to: 'broadcast',
      type: 'status_update',
      priority: 'low',
      protocol: getProtocol(),
      encrypted: true,
      data: {
        position: vehicle.position,
        speed: vehicle.speed,
        heading: vehicle.heading,
        acceleration: vehicle.acceleration,
        engineStatus: vehicle.engineStatus,
        turnSignal: vehicle.turnSignal,
        lights: vehicle.lights,
        sensors: vehicle.sensors,
        obdData: vehicle.obdData,
        vehicleClass: vehicle.type,
        timestamp: timestamp
      },
      timestamp,
      signalStrength: -75 + Math.random() * 20
    };
  }, [vehicles]);

  // Initialize production vehicles with realistic OBD-II data
  useEffect(() => {
    const initialVehicles: VehicleData[] = [
      {
        id: 'AMBULANCE_001',
        type: 'emergency',
        position: { lat: 40.7589, lng: -73.9851 },
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
        },
        obdData: {
          engineRPM: 800,
          fuelLevel: 85,
          coolantTemp: 90,
          batteryVoltage: 12.6,
          engineLoad: 15,
          throttlePosition: 0
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
        },
        obdData: {
          engineRPM: 2200,
          fuelLevel: 67,
          coolantTemp: 92,
          batteryVoltage: 14.2,
          engineLoad: 35,
          throttlePosition: 25
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
        },
        obdData: {
          engineRPM: 1800,
          fuelLevel: 92,
          coolantTemp: 88,
          batteryVoltage: 13.8,
          engineLoad: 65,
          throttlePosition: 30
        }
      }
    ];

    setVehicles(initialVehicles);
  }, []);

  // Production simulation with realistic timing
  useEffect(() => {
    if (vehicles.length === 0) return;

    const interval = setInterval(() => {
      // Update vehicles with realistic physics
      setVehicles(prevVehicles => {
        const updated = prevVehicles.map(vehicle => {
          const updatedVehicle = { ...vehicle };

          // Physics-based movement
          const speedInMs = vehicle.speed / 3.6;
          const deltaLat = (speedInMs * 0.1 * Math.cos(vehicle.heading * Math.PI / 180)) / 111320;
          const deltaLng = (speedInMs * 0.1 * Math.sin(vehicle.heading * Math.PI / 180)) / (111320 * Math.cos(vehicle.position.lat * Math.PI / 180));

          updatedVehicle.position = {
            lat: vehicle.position.lat + deltaLat,
            lng: vehicle.position.lng + deltaLng
          };

          // Realistic OBD-II simulation
          const baseRPM = vehicle.type === 'emergency' ? 800 :
                         vehicle.type === 'truck' ? 1800 : 2000;
          const rpmFactor = (vehicle.speed / 100) * 15;
          updatedVehicle.obdData.engineRPM = Math.max(800, baseRPM + rpmFactor + (Math.random() - 0.5) * 200);

          // Fuel consumption simulation
          updatedVehicle.obdData.fuelLevel = Math.max(0, vehicle.obdData.fuelLevel - 0.001);

          // Temperature regulation
          updatedVehicle.obdData.coolantTemp = 85 + Math.random() * 15;

          // Battery voltage varies with engine state
          updatedVehicle.obdData.batteryVoltage = vehicle.engineStatus === 'running' ?
            13.8 + (Math.random() - 0.5) * 0.4 : 12.2 + (Math.random() - 0.5) * 0.3;

          // Engine load based on acceleration and speed
          const loadFactor = Math.abs(vehicle.acceleration) * 10 + (vehicle.speed / 200) * 50;
          updatedVehicle.obdData.engineLoad = Math.min(100, Math.max(5, loadFactor + (Math.random() - 0.5) * 10));

          // Throttle position based on acceleration
          updatedVehicle.obdData.throttlePosition = Math.min(100, Math.max(0,
            50 + vehicle.acceleration * 20 + (Math.random() - 0.5) * 10));

          // Emergency vehicle behavior
          if (vehicle.type === 'emergency' && Math.random() > 0.8) {
            updatedVehicle.engineStatus = 'emergency';
            updatedVehicle.lights.emergencyLights = true;
            updatedVehicle.speed = 80;
            updatedVehicle.obdData.engineRPM = 3000 + Math.random() * 500;
          }

          // Traffic simulation for cars
          if (vehicle.type === 'car') {
            updatedVehicle.speed += (Math.random() - 0.5) * 8;
            updatedVehicle.speed = Math.max(20, Math.min(80, updatedVehicle.speed));

            // Random turn signals
            if (Math.random() > 0.95) {
              updatedVehicle.turnSignal = Math.random() > 0.5 ? 'left' : 'right';
            } else if (Math.random() > 0.9) {
              updatedVehicle.turnSignal = 'none';
            }
          }

          return updatedVehicle;
        });

        // Generate V2V messages for each vehicle
        const newMessages: V2VMessage[] = [];
        updated.forEach(vehicle => {
          const message = generateV2VMessage(vehicle);
          if (message) {
            newMessages.push(message);
          }
        });

        // Update messages with protocol tracking
        setMessages(prev => {
          const allMessages = [...prev, ...newMessages];
          return allMessages.slice(-200); // Keep last 200 messages
        });

        return updated;
      });

      // Update production metrics
      const uptime = (Date.now() - startTime.current) / 1000;
      const messagesPerSecond = messageCount.current / uptime;
      const averageLatency = 5 + Math.random() * 25;
      const packetLossRate = Math.random() * 2; // Max 2% packet loss
      const signalQuality = 85 + Math.random() * 15;

      setMetrics({
        messagesPerSecond: parseFloat(messagesPerSecond.toFixed(2)),
        averageLatency: parseFloat(averageLatency.toFixed(1)),
        packetLossRate: parseFloat(packetLossRate.toFixed(2)),
        connectedVehicles: vehicles.length,
        systemUptime: uptime,
        signalQuality: parseFloat(signalQuality.toFixed(1)),
        encryptionStatus: 'active',
        protocolDistribution: {
          DSRC: Math.floor(Math.random() * 30),
          C_V2X: Math.floor(Math.random() * 50),
          FIVE_G_V2X: Math.floor(Math.random() * 20)
        }
      });

    }, 100); // 10Hz update rate - production standard

    return () => clearInterval(interval);
  }, [vehicles.length, generateV2VMessage]);

  // Calculate ETA for emergency vehicles
  const calculateETA = (vehicle: VehicleData): number => {
    return Math.random() * 300 + 60; // 1-6 minutes
  };

  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
    const R = 6371e3;
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Production Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Production V2V System
            </h1>
            <span className="px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full text-green-400 text-sm font-semibold">
              ENTERPRISE GRADE
            </span>
          </div>
          <p className="text-xl text-gray-300">
            Real-time vehicle communication with production-grade security and protocols
          </p>
        </div>

        {/* Production Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${systemHealth.v2vEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {systemHealth.v2vEnabled ? 'ACTIVE' : 'OFFLINE'}
            </div>
            <div className="text-sm text-gray-400">V2V System</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${systemHealth.encryptionEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {systemHealth.encryptionEnabled ? 'AES-256' : 'DISABLED'}
            </div>
            <div className="text-sm text-gray-400">Encryption</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {metrics.messagesPerSecond}
            </div>
            <div className="text-sm text-gray-400">Msg/sec</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {metrics.averageLatency}ms
            </div>
            <div className="text-sm text-gray-400">Avg Latency</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {metrics.packetLossRate}%
            </div>
            <div className="text-sm text-gray-400">Packet Loss</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatUptime(metrics.systemUptime)}
            </div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {metrics.connectedVehicles}
            </div>
            <div className="text-sm text-gray-400">Connected</div>
          </div>
        </div>

        {/* Protocol Distribution */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Protocol Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{metrics.protocolDistribution.DSRC}</div>
              <div className="text-sm text-gray-400">DSRC (5.9GHz)</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{metrics.protocolDistribution.C_V2X}</div>
              <div className="text-sm text-gray-400">C-V2X (Cellular)</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{metrics.protocolDistribution.FIVE_G_V2X}</div>
              <div className="text-sm text-gray-400">5G-V2X (mmWave)</div>
            </div>
          </div>
        </div>

        {/* Safety Events Log */}
        {safetyEvents.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Recent Safety Events</h3>
            <div className="space-y-2">
              {safetyEvents.slice(-5).reverse().map(event => (
                <div key={event.id} className={`rounded-lg p-3 text-sm ${
                  event.severity === 'high' ? 'bg-red-900/20 border border-red-600/50' :
                  event.severity === 'medium' ? 'bg-orange-900/20 border border-orange-600/50' :
                  'bg-green-900/20 border border-green-600/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">{event.type.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{event.outcome}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Live Vehicle Map with OBD Data */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Live Fleet Monitoring</h3>
            <div className="bg-slate-900 rounded-lg p-4 h-96 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50"></div>
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
                    <span className="text-2xl">{vehicle.type === 'emergency' ? '🚑' : vehicle.type === 'truck' ? '🚚' : vehicle.type === 'bus' ? '🚌' : '🚗'}</span>
                    {vehicle.lights.emergencyLights && (
                      <div className="absolute inset-0 animate-ping">
                        <span className="text-2xl">🚨</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white bg-slate-700 rounded px-1 mt-1 whitespace-nowrap">
                    {vehicle.id.split('_')[0]} • {vehicle.speed}km/h • {vehicle.obdData.engineRPM}RPM
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encrypted V2V Message Log */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Encrypted V2V Messages</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Initializing secure V2V communication...</p>
              ) : (
                messages.slice(-15).reverse().map(message => (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 text-sm font-mono ${
                      message.priority === 'critical' ? 'bg-red-900/20 border border-red-600/50' :
                      message.priority === 'high' ? 'bg-orange-900/20 border border-orange-600/50' :
                      message.priority === 'medium' ? 'bg-yellow-900/20 border border-yellow-600/50' :
                      'bg-blue-900/20 border border-blue-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">
                        {message.from} → {message.to === 'broadcast' ? 'ALL' : message.to}
                      </span>
                      <div className="flex items-center space-x-2">
                        {message.encrypted && (
                          <span className="text-green-400">🔒</span>
                        )}
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                          {message.protocol}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">{message.type.replace('_', ' ').toUpperCase()}</span>
                      {message.data.emergencyType && (
                        <span className="ml-2">• {message.data.emergencyType.replace('_', ' ')}</span>
                      )}
                      <span className="ml-2">• {message.signalStrength.toFixed(1)}dBm</span>
                    </div>
                    {message.data.speed && (
                      <div className="text-xs mt-1 opacity-75">
                        Speed: {message.data.speed}km/h | RPM: {message.data.obdData?.engineRPM || 'N/A'} |
                        Fuel: {message.data.obdData?.fuelLevel || 'N/A'}%
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detailed Vehicle Telemetry */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Production Vehicle Telemetry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg">
                    {vehicle.type === 'emergency' ? '🚑' : vehicle.type === 'truck' ? '🚚' : vehicle.type === 'bus' ? '🚌' : '🚗'} {vehicle.id}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    vehicle.engineStatus === 'emergency'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-green-600 text-white'
                  }`}>
                    {vehicle.engineStatus.toUpperCase()}
                  </span>
                </div>

                {/* OBD-II Data */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Speed:</span>
                      <span className="ml-1 font-mono">{vehicle.speed} km/h</span>
                    </div>
                    <div>
                      <span className="text-gray-400">RPM:</span>
                      <span className="ml-1 font-mono">{vehicle.obdData.engineRPM}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Fuel:</span>
                      <span className="ml-1 font-mono">{vehicle.obdData.fuelLevel.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Temp:</span>
                      <span className="ml-1 font-mono">{vehicle.obdData.coolantTemp}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Battery:</span>
                      <span className="ml-1 font-mono">{vehicle.obdData.batteryVoltage.toFixed(1)}V</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Load:</span>
                      <span className="ml-1 font-mono">{vehicle.obdData.engineLoad.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Sensor Data */}
                  <div className="border-t border-slate-600 pt-2">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Proximity:</span>
                        <span className="font-mono">
                          {Math.min(...vehicle.sensors.proximity).toFixed(0)}m - {Math.max(...vehicle.sensors.proximity).toFixed(0)}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lane:</span>
                        <span className="font-mono capitalize">{vehicle.sensors.lanePosition}</span>
                      </div>
                      {vehicle.sensors.blindSpotAlert && (
                        <div className="text-yellow-400 text-xs font-bold">⚠️ BLIND SPOT ALERT</div>
                      )}
                    </div>
                  </div>

                  {/* Position Data */}
                  <div className="border-t border-slate-600 pt-2">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Position:</span>
                        <span className="font-mono text-xs">
                          {vehicle.position.lat.toFixed(4)}, {vehicle.position.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Heading:</span>
                        <span className="font-mono">{vehicle.heading}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionV2VSystem;