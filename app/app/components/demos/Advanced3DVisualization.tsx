'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface Vehicle3D {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  type: 'car' | 'truck' | 'emergency' | 'autonomous';
  color: string;
  signalStrength: number;
  batteryLevel: number;
  destination: { x: number; y: number; z: number };
}

interface V2VSignal {
  id: string;
  from: string;
  to: string;
  type: 'collision-warning' | 'emergency-alert' | 'traffic-info' | 'cooperative-driving';
  position: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number };
  progress: number;
  strength: number;
}

interface TrafficEvent {
  id: string;
  type: 'accident' | 'congestion' | 'construction' | 'weather';
  position: { x: number; y: number; z: number };
  radius: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const Advanced3DVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vehicles, setVehicles] = useState<Vehicle3D[]>([]);
  const [signals, setSignals] = useState<V2VSignal[]>([]);
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [cameraAngle, setCameraAngle] = useState({ x: 0.3, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showSignalPaths, setShowSignalPaths] = useState(true);
  const [showTrafficEvents, setShowTrafficEvents] = useState(true);
  const [statistics, setStatistics] = useState({
    totalMessages: 0,
    collisionsPrevented: 0,
    fuelSaved: 0,
    timeSaved: 0
  });

  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    // Initialize 3D vehicles in a city grid
    const initialVehicles: Vehicle3D[] = [
      {
        id: 'v1',
        position: { x: -200, y: 0, z: -200 },
        velocity: { x: 2, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        type: 'car',
        color: '#3B82F6',
        signalStrength: 0.9,
        batteryLevel: 0.85,
        destination: { x: 200, y: 0, z: -200 }
      },
      {
        id: 'v2',
        position: { x: 0, y: 0, z: -150 },
        velocity: { x: 0, y: 0, z: 1.5 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        type: 'truck',
        color: '#F59E0B',
        signalStrength: 0.85,
        batteryLevel: 0.7,
        destination: { x: 0, y: 0, z: 150 }
      },
      {
        id: 'v3',
        position: { x: 150, y: 0, z: 0 },
        velocity: { x: -1.5, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        type: 'emergency',
        color: '#EF4444',
        signalStrength: 1.0,
        batteryLevel: 0.95,
        destination: { x: -150, y: 0, z: 0 }
      },
      {
        id: 'v4',
        position: { x: -100, y: 0, z: 100 },
        velocity: { x: 1, y: 0, z: -1 },
        rotation: { x: 0, y: -Math.PI / 4, z: 0 },
        type: 'autonomous',
        color: '#A855F7',
        signalStrength: 0.95,
        batteryLevel: 0.8,
        destination: { x: 100, y: 0, z: -100 }
      },
      {
        id: 'v5',
        position: { x: 50, y: 0, z: 200 },
        velocity: { x: 0, y: 0, z: -2 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        type: 'car',
        color: '#10B981',
        signalStrength: 0.8,
        batteryLevel: 0.9,
        destination: { x: 50, y: 0, z: -200 }
      }
    ];

    setVehicles(initialVehicles);

    // Initialize traffic events
    const initialEvents: TrafficEvent[] = [
      {
        id: 'e1',
        type: 'accident',
        position: { x: 0, y: 0, z: 50 },
        radius: 80,
        severity: 'high'
      },
      {
        id: 'e2',
        type: 'congestion',
        position: { x: -100, y: 0, z: -100 },
        radius: 120,
        severity: 'medium'
      },
      {
        id: 'e3',
        type: 'construction',
        position: { x: 150, y: 0, z: 100 },
        radius: 60,
        severity: 'low'
      }
    ];

    setTrafficEvents(initialEvents);
  }, []);

  const project3DTo2D = (point: { x: number; y: number; z: number }, canvas: HTMLCanvasElement) => {
    const scale = 300 * zoom;
    const perspective = 1000;

    // Apply camera rotation
    const cosX = Math.cos(cameraAngle.x);
    const sinX = Math.sin(cameraAngle.x);
    const cosY = Math.cos(cameraAngle.y);
    const sinY = Math.sin(cameraAngle.y);

    // Rotate around Y axis
    let x = point.x * cosY - point.z * sinY;
    let z = point.x * sinY + point.z * cosY;
    let y = point.y;

    // Rotate around X axis
    const tempY = y * cosX - z * sinX;
    z = y * sinX + z * cosX;
    y = tempY;

    // Apply perspective projection
    const factor = perspective / (perspective + z);

    return {
      x: canvas.width / 2 + x * scale * factor,
      y: canvas.height / 2 - y * scale * factor,
      scale: factor
    };
  };

  const draw3DBox = (
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number; z: number },
    size: { width: number; height: number; depth: number },
    color: string,
    rotation: { x: number; y: number; z: number }
  ) => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    // Define box vertices
    const vertices = [
      { x: -size.width/2, y: -size.height/2, z: -size.depth/2 },
      { x: size.width/2, y: -size.height/2, z: -size.depth/2 },
      { x: size.width/2, y: size.height/2, z: -size.depth/2 },
      { x: -size.width/2, y: size.height/2, z: -size.depth/2 },
      { x: -size.width/2, y: -size.height/2, z: size.depth/2 },
      { x: size.width/2, y: -size.height/2, z: size.depth/2 },
      { x: size.width/2, y: size.height/2, z: size.depth/2 },
      { x: -size.width/2, y: size.height/2, z: size.depth/2 }
    ];

    // Apply rotation and translation
    const rotatedVertices = vertices.map(v => {
      let x = v.x;
      let y = v.y;
      let z = v.z;

      // Apply rotation
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Rotate around Y
      const tempX = x * cosY - z * sinY;
      z = x * sinY + z * cosY;
      x = tempX;

      // Rotate around X
      const tempY = y * cosX - z * sinX;
      z = y * sinX + z * cosX;
      y = tempY;

      return {
        x: x + position.x,
        y: y + position.y,
        z: z + position.z
      };
    });

    // Project to 2D
    const projectedVertices = rotatedVertices.map(v => project3DTo2D(v, canvas));

    // Define faces
    const faces = [
      [0, 1, 2, 3], // front
      [4, 5, 6, 7], // back
      [0, 1, 5, 4], // bottom
      [2, 3, 7, 6], // top
      [0, 3, 7, 4], // left
      [1, 2, 6, 5]  // right
    ];

    // Calculate face depths for sorting
    const facesWithDepth = faces.map(face => {
      const avgZ = face.reduce((sum, index) => sum + rotatedVertices[index].z, 0) / 4;
      return { face, depth: avgZ };
    });

    // Sort faces by depth (back to front)
    facesWithDepth.sort((a, b) => a.depth - b.depth);

    // Draw faces
    facesWithDepth.forEach(({ face }, index) => {
      ctx.beginPath();
      ctx.moveTo(projectedVertices[face[0]].x, projectedVertices[face[0]].y);
      for (let i = 1; i < face.length; i++) {
        ctx.lineTo(projectedVertices[face[i]].x, projectedVertices[face[i]].y);
      }
      ctx.closePath();

      // Apply lighting based on face normal
      const brightness = 0.5 + (index / faces.length) * 0.5;
      ctx.fillStyle = color + Math.floor(brightness * 255).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.strokeStyle = '#ffffff20';
      ctx.stroke();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      if (!isPlaying) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.016;

      // Update vehicles
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.map(vehicle => {
          let newPosition = { ...vehicle.position };
          let newVelocity = { ...vehicle.velocity };

          // Move towards destination
          const dx = vehicle.destination.x - vehicle.position.x;
          const dy = vehicle.destination.y - vehicle.position.y;
          const dz = vehicle.destination.z - vehicle.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance > 5) {
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;
            const normalizedDz = dz / distance;

            newPosition.x += normalizedDx * 2;
            newPosition.y += normalizedDy * 2;
            newPosition.z += normalizedDz * 2;

            // Update rotation to face movement direction
            newVelocity.x = normalizedDx * 2;
            newVelocity.z = normalizedDz * 2;
          } else {
            // Reached destination, set new random destination
            const newDestination = {
              x: (Math.random() - 0.5) * 400,
              y: 0,
              z: (Math.random() - 0.5) * 400
            };
            vehicle.destination = newDestination;
          }

          return {
            ...vehicle,
            position: newPosition,
            velocity: newVelocity,
            rotation: {
              x: vehicle.rotation.x,
              y: Math.atan2(newVelocity.z, newVelocity.x),
              z: vehicle.rotation.z
            },
            signalStrength: 0.7 + Math.sin(timeRef.current + parseFloat(vehicle.id)) * 0.3,
            batteryLevel: Math.max(0.2, vehicle.batteryLevel - 0.0001)
          };
        });

        // Generate V2V signals between nearby vehicles
        const newSignals: V2VSignal[] = [];
        updatedVehicles.forEach((v1, i) => {
          updatedVehicles.forEach((v2, j) => {
            if (i < j) {
              const distance = Math.sqrt(
                Math.pow(v1.position.x - v2.position.x, 2) +
                Math.pow(v1.position.y - v2.position.y, 2) +
                Math.pow(v1.position.z - v2.position.z, 2)
              );

              if (distance < 150 && Math.random() < 0.02) {
                const signalTypes: V2VSignal['type'][] = [
                  'collision-warning',
                  'emergency-alert',
                  'traffic-info',
                  'cooperative-driving'
                ];

                newSignals.push({
                  id: `signal-${timeRef.current}-${i}-${j}`,
                  from: v1.id,
                  to: v2.id,
                  type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
                  position: v1.position,
                  targetPosition: v2.position,
                  progress: 0,
                  strength: 1 - distance / 150
                });
              }
            }
          });
        });

        setSignals(prev => [...prev, ...newSignals].slice(-50));

        return updatedVehicles;
      });

      // Update signals
      setSignals(prevSignals =>
        prevSignals.map(signal => ({
          ...signal,
          progress: Math.min(signal.progress + 0.05, 1)
        })).filter(signal => signal.progress < 1)
      );

      // Draw grid
      ctx.strokeStyle = '#ffffff10';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const gridCount = 10;

      for (let i = -gridCount; i <= gridCount; i++) {
        // X-axis lines
        ctx.beginPath();
        const start = project3DTo2D({ x: i * gridSize, y: 0, z: -gridCount * gridSize }, canvas);
        const end = project3DTo2D({ x: i * gridSize, y: 0, z: gridCount * gridSize }, canvas);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Z-axis lines
        ctx.beginPath();
        const start2 = project3DTo2D({ x: -gridCount * gridSize, y: 0, z: i * gridSize }, canvas);
        const end2 = project3DTo2D({ x: gridCount * gridSize, y: 0, z: i * gridSize }, canvas);
        ctx.moveTo(start2.x, start2.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke();
      }

      // Draw traffic events
      if (showTrafficEvents) {
        trafficEvents.forEach(event => {
          const projected = project3DTo2D(event.position, canvas);
          const radius = event.radius * projected.scale;

          const eventColors = {
            accident: 'rgba(239, 68, 68, ',
            congestion: 'rgba(245, 158, 11, ',
            construction: 'rgba(156, 163, 175, ',
            weather: 'rgba(59, 130, 246, '
          };

          const severityOpacity = {
            low: 0.2,
            medium: 0.4,
            high: 0.6,
            critical: 0.8
          };

          ctx.beginPath();
          ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = eventColors[event.type] + severityOpacity[event.severity] + ')';
          ctx.fill();
          ctx.strokeStyle = eventColors[event.type] + '1)';
          ctx.stroke();
        });
      }

      // Draw signal paths
      if (showSignalPaths) {
        signals.forEach(signal => {
          const currentPos = {
            x: signal.position.x + (signal.targetPosition.x - signal.position.x) * signal.progress,
            y: signal.position.y + (signal.targetPosition.y - signal.position.y) * signal.progress,
            z: signal.position.z + (signal.targetPosition.z - signal.position.z) * signal.progress
          };

          const projected = project3DTo2D(currentPos, canvas);

          // Draw signal trail
          const trailLength = 5;
          for (let i = 0; i < trailLength; i++) {
            const trailProgress = Math.max(0, signal.progress - i * 0.02);
            const trailPos = {
              x: signal.position.x + (signal.targetPosition.x - signal.position.x) * trailProgress,
              y: signal.position.y + (signal.targetPosition.y - signal.position.y) * trailProgress,
              z: signal.position.z + (signal.targetPosition.z - signal.position.z) * trailProgress
            };
            const trailProjected = project3DTo2D(trailPos, canvas);

            const signalColors = {
              'collision-warning': '#EF4444',
              'emergency-alert': '#DC2626',
              'traffic-info': '#3B82F6',
              'cooperative-driving': '#10B981'
            };

            ctx.beginPath();
            ctx.arc(trailProjected.x, trailProjected.y, (trailLength - i) * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = signalColors[signal.type] + Math.floor((1 - i / trailLength) * 255).toString(16).padStart(2, '0');
            ctx.fill();
          }
        });
      }

      // Draw vehicles
      vehicles.forEach(vehicle => {
        const projected = project3DTo2D(vehicle.position, canvas);
        const size = vehicle.type === 'truck' ?
          { width: 15, height: 8, depth: 25 } :
          { width: 10, height: 6, depth: 18 };

        draw3DBox(ctx, vehicle.position, size, vehicle.color, vehicle.rotation);

        // Draw vehicle info
        if (selectedVehicle === vehicle.id) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px monospace';
          ctx.fillText(
            `${vehicle.type.toUpperCase()} | Signal: ${Math.round(vehicle.signalStrength * 100)}% | Battery: ${Math.round(vehicle.batteryLevel * 100)}%`,
            projected.x - 60,
            projected.y - projected.scale * 30
          );
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [vehicles, signals, trafficEvents, cameraAngle, zoom, isPlaying, selectedVehicle, showSignalPaths, showTrafficEvents]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatistics(prev => ({
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 10),
        collisionsPrevented: prev.collisionsPrevented + (Math.random() < 0.1 ? 1 : 0),
        fuelSaved: prev.fuelSaved + Math.random() * 5,
        timeSaved: prev.timeSaved + Math.random() * 2
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-screen">
        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-move"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = (moveEvent.clientX - startX) * 0.01;
                const deltaY = (moveEvent.clientY - startY) * 0.01;

                setCameraAngle(prev => ({
                  x: prev.x + deltaY,
                  y: prev.y + deltaX,
                  z: prev.z
                }));
              };

              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };

              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
            onWheel={(e) => {
              e.preventDefault();
              setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)));
            }}
          />

          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>

              <button
                onClick={() => setZoom(1)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                🔄 Reset View
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showSignalPaths}
                  onChange={(e) => setShowSignalPaths(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Signal Paths</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTrafficEvents}
                  onChange={(e) => setShowTrafficEvents(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Traffic Events</span>
              </label>
            </div>

            <div className="space-y-1 text-xs text-gray-400">
              <div>🖱️ Drag to rotate</div>
              <div>⚙️ Scroll to zoom</div>
              <div>🚗 Click vehicles for info</div>
            </div>
          </div>

          {/* Statistics Overlay */}
          <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold mb-2">📊 Live Statistics</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Messages:</span>
                <span className="font-mono text-blue-400">{statistics.totalMessages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Collisions Prevented:</span>
                <span className="font-mono text-green-400">{statistics.collisionsPrevented}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fuel Saved (L):</span>
                <span className="font-mono text-yellow-400">{statistics.fuelSaved.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time Saved (min):</span>
                <span className="font-mono text-purple-400">{statistics.timeSaved.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
            <h3 className="text-sm font-semibold mb-3">🚗 Active Vehicles</h3>
            <div className="space-y-2">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id === selectedVehicle ? null : vehicle.id)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedVehicle === vehicle.id ? 'bg-blue-600/30 border border-blue-500' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{vehicle.type}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: vehicle.color }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Signal: {Math.round(vehicle.signalStrength * 100)}% | Battery: {Math.round(vehicle.batteryLevel * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advanced3DVisualization;