'use client';

import { useState, useEffect, useRef } from 'react';

interface Vehicle {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  type: 'car' | 'truck' | 'emergency' | 'autonomous';
  color: string;
  soundscape: string;
}

interface Environment {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather: 'clear' | 'rain' | 'fog' | 'snow';
  trafficDensity: 'light' | 'moderate' | 'heavy';
  location: 'highway' | 'city' | 'suburban' | 'industrial';
}

const ImmersiveExperience: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [environment, setEnvironment] = useState<Environment>({
    timeOfDay: 'day',
    weather: 'clear',
    trafficDensity: 'moderate',
    location: 'city'
  });
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [v2vMessages, setV2vMessages] = useState<Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    content: string;
    timestamp: number;
  }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<Map<string, AudioBuffer>>(new Map());

  useEffect(() => {
    // Initialize vehicles
    const initialVehicles: Vehicle[] = [
      {
        id: 'v1',
        position: { x: 100, y: 200 },
        velocity: { x: 2, y: 0 },
        type: 'car',
        color: '#3B82F6',
        soundscape: 'engine-hum'
      },
      {
        id: 'v2',
        position: { x: 300, y: 250 },
        velocity: { x: -1.5, y: 0.5 },
        type: 'truck',
        color: '#F59E0B',
        soundscape: 'diesel-engine'
      },
      {
        id: 'v3',
        position: { x: 500, y: 150 },
        velocity: { x: -3, y: 0 },
        type: 'emergency',
        color: '#EF4444',
        soundscape: 'siren'
      },
      {
        id: 'v4',
        position: { x: 200, y: 350 },
        velocity: { x: 1, y: -1 },
        type: 'autonomous',
        color: '#A855F7',
        soundscape: 'electric-whir'
      }
    ];

    setVehicles(initialVehicles);

    // Initialize audio context
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      createSoundEffects();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createSoundEffects = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const sampleRate = audioContext.sampleRate;

    // Create different sound effects
    const sounds = {
      'engine-hum': () => {
        const buffer = audioContext.createBuffer(1, sampleRate * 2, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          channelData[i] = (
            Math.sin(2 * Math.PI * 100 * time) * 0.3 +
            Math.sin(2 * Math.PI * 150 * time) * 0.2 +
            Math.sin(2 * Math.PI * 200 * time) * 0.1
          ) * (0.8 + Math.random() * 0.2);
        }

        return buffer;
      },

      'siren': () => {
        const buffer = audioContext.createBuffer(1, sampleRate * 0.5, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          const frequency = 600 + 400 * Math.sin(2 * Math.PI * 2 * time);
          channelData[i] = Math.sin(2 * Math.PI * frequency * time) * 0.5;
        }

        return buffer;
      },

      'v2v-beep': () => {
        const buffer = audioContext.createBuffer(1, sampleRate * 0.1, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          const envelope = Math.exp(-time * 10);
          channelData[i] = Math.sin(2 * Math.PI * 1000 * time) * envelope * 0.3;
        }

        return buffer;
      },

      'collision-warning': () => {
        const buffer = audioContext.createBuffer(1, sampleRate * 0.3, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          const frequency = 440 + 220 * Math.sin(2 * Math.PI * 5 * time);
          channelData[i] = Math.sin(2 * Math.PI * frequency * time) * 0.4;
        }

        return buffer;
      }
    };

    // Generate and store sound buffers
    Object.entries(sounds).forEach(([name, generator]) => {
      try {
        const buffer = generator();
        audioBufferRef.current.set(name, buffer);
      } catch (error) {
        console.warn(`Failed to create sound ${name}:`, error);
      }
    });
  };

  const playSound = (soundName: string, volume: number = 0.5, pitch: number = 1) => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      const buffer = audioBufferRef.current.get(soundName);

      if (!buffer) return;

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = buffer;
      source.playbackRate.value = pitch;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);

      // Vibration feedback for mobile devices
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  };

  const triggerV2VCommunication = (from: Vehicle, to: Vehicle) => {
    const messageTypes = ['collision-warning', 'traffic-info', 'emergency-alert', 'cooperative-driving'];
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];

    const message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      from: from.id,
      to: to.id,
      type: messageType,
      content: `${messageType}: ${from.id} → ${to.id}`,
      timestamp: Date.now()
    };

    setV2vMessages(prev => [...prev, message].slice(-10));

    // Play appropriate sound
    playSound('v2v-beep', 0.3);

    if (messageType === 'collision-warning') {
      playSound('collision-warning', 0.2);
    }

    // Visual feedback
    setSelectedVehicle(from.id);
    setTimeout(() => setSelectedVehicle(null), 1000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw environment background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      const environmentColors = {
        timeOfDay: {
          dawn: ['#FF6B6B', '#FFE66D'],
          day: ['#87CEEB', '#98D8C8'],
          dusk: ['#FF6B9D', '#C44569'],
          night: ['#0F2027', '#203A43', '#2C5364']
        },
        weather: {
          clear: 'normal',
          rain: 'rgba(100, 150, 200, 0.3)',
          fog: 'rgba(200, 200, 200, 0.4)',
          snow: 'rgba(255, 255, 255, 0.2)'
        }
      };

      const timeColors = environmentColors.timeOfDay[environment.timeOfDay];
      timeColors.forEach((color, index) => {
        gradient.addColorStop(index / (timeColors.length - 1), color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply weather overlay
      if (environment.weather !== 'clear') {
        ctx.fillStyle = environmentColors.weather[environment.weather];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw road/network visualization
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      const gridSize = 50;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw vehicles
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.map(vehicle => {
          let newX = vehicle.position.x + vehicle.velocity.x;
          let newY = vehicle.position.y + vehicle.velocity.y;

          // Bounce off walls
          if (newX < 20 || newX > canvas.width - 20) {
            vehicle.velocity.x *= -1;
            newX = Math.max(20, Math.min(canvas.width - 20, newX));
          }
          if (newY < 20 || newY > canvas.height - 20) {
            vehicle.velocity.y *= -1;
            newY = Math.max(20, Math.min(canvas.height - 20, newY));
          }

          return {
            ...vehicle,
            position: { x: newX, y: newY }
          };
        });

        // Check for V2V communication opportunities
        updatedVehicles.forEach((v1, i) => {
          updatedVehicles.forEach((v2, j) => {
            if (i < j) {
              const distance = Math.sqrt(
                Math.pow(v1.position.x - v2.position.x, 2) +
                Math.pow(v1.position.y - v2.position.y, 2)
              );

              // Draw connection lines for nearby vehicles
              if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(v1.position.x, v1.position.y);
                ctx.lineTo(v2.position.x, v2.position.y);
                ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 - distance / 300})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Trigger V2V communication randomly
                if (Math.random() < 0.01) {
                  triggerV2VCommunication(v1, v2);
                }
              }
            }
          });
        });

        // Draw vehicles
        updatedVehicles.forEach(vehicle => {
          // Vehicle glow effect
          if (selectedVehicle === vehicle.id) {
            const glowGradient = ctx.createRadialGradient(
              vehicle.position.x, vehicle.position.y, 0,
              vehicle.position.x, vehicle.position.y, 30
            );
            glowGradient.addColorStop(0, vehicle.color + '40');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(vehicle.position.x - 30, vehicle.position.y - 30, 60, 60);
          }

          // Draw vehicle
          ctx.beginPath();
          ctx.arc(vehicle.position.x, vehicle.position.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = vehicle.color;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Vehicle icon
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const icons = {
            car: '🚗',
            truck: '🚚',
            emergency: '🚑',
            autonomous: '🤖'
          };

          ctx.fillText(icons[vehicle.type], vehicle.position.x, vehicle.position.y);
        });

        return updatedVehicles;
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Play ambient sounds based on environment
    if (soundEnabled && vehicles.length > 0) {
      vehicles.forEach(vehicle => {
        if (Math.random() < 0.01) {
          playSound(vehicle.soundscape, 0.1);
        }
      });
    }
  }, [environment, selectedVehicle, soundEnabled, vehicles]);

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle.id);
    playSound('v2v-beep', 0.5);

    // Trigger V2V communication with nearby vehicles
    vehicles.forEach(otherVehicle => {
      if (otherVehicle.id !== vehicle.id) {
        const distance = Math.sqrt(
          Math.pow(vehicle.position.x - otherVehicle.position.x, 2) +
          Math.pow(vehicle.position.y - otherVehicle.position.y, 2)
        );
        if (distance < 200) {
          triggerV2VCommunication(vehicle, otherVehicle);
        }
      }
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
      isImmersiveMode ? 'bg-black' : 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
    } text-white p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 ${
            isImmersiveMode ? 'animate-pulse' : ''
          }`}>
            Immersive V2V Experience
          </h1>
          <p className="text-gray-300">
            Feel the future of vehicle communication with sound and vibration
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Environment Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Time of Day</label>
                <select
                  value={environment.timeOfDay}
                  onChange={(e) => setEnvironment(prev => ({ ...prev, timeOfDay: e.target.value as any }))}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
                >
                  <option value="dawn">🌅 Dawn</option>
                  <option value="day">☀️ Day</option>
                  <option value="dusk">🌆 Dusk</option>
                  <option value="night">🌙 Night</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Weather</label>
                <select
                  value={environment.weather}
                  onChange={(e) => setEnvironment(prev => ({ ...prev, weather: e.target.value as any }))}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
                >
                  <option value="clear">☀️ Clear</option>
                  <option value="rain">🌧️ Rain</option>
                  <option value="fog">🌫️ Fog</option>
                  <option value="snow">❄️ Snow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Location</label>
                <select
                  value={environment.location}
                  onChange={(e) => setEnvironment(prev => ({ ...prev, location: e.target.value as any }))}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
                >
                  <option value="highway">🛣️ Highway</option>
                  <option value="city">🏙️ City</option>
                  <option value="suburban">🏘️ Suburban</option>
                  <option value="industrial">🏭 Industrial</option>
                </select>
              </div>
            </div>

            {/* Immersion Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsImmersiveMode(!isImmersiveMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isImmersiveMode
                    ? 'bg-purple-600 hover:bg-purple-700 animate-pulse'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {isImmersiveMode ? '🥽 Immersive ON' : '👁️ Standard View'}
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title="Toggle Sound"
              >
                🔊
              </button>

              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  vibrationEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title="Toggle Vibration"
              >
                📳
              </button>
            </div>
          </div>
        </div>

        {/* Main Experience Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
              <canvas
                ref={canvasRef}
                className="w-full h-96 rounded-lg cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  vehicles.forEach(vehicle => {
                    const distance = Math.sqrt(
                      Math.pow(vehicle.position.x - x, 2) +
                      Math.pow(vehicle.position.y - y, 2)
                    );
                    if (distance < 20) {
                      handleVehicleClick(vehicle);
                    }
                  });
                }}
              />

              <div className="mt-4 text-center text-sm text-gray-400">
                Click on vehicles to trigger V2V communication
              </div>
            </div>
          </div>

          {/* V2V Messages Log */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">📡 V2V Messages</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {v2vMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Click vehicles to start communication...
                </div>
              ) : (
                v2vMessages.map(message => (
                  <div
                    key={message.id}
                    className="p-2 bg-slate-900/50 rounded-lg text-xs border border-slate-700 animate-pulse"
                    style={{ animationDuration: '2s' }}
                  >
                    <div className="font-mono text-blue-400">{message.content}</div>
                    <div className="text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">🌍 Current Environment</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div>Time: {environment.timeOfDay}</div>
              <div>Weather: {environment.weather}</div>
              <div>Location: {environment.location}</div>
              <div>Active Vehicles: {vehicles.length}</div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">🎮 Immersion Settings</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div>Mode: {isImmersiveMode ? 'Full Immersive' : 'Standard'}</div>
              <div>Sound: {soundEnabled ? 'Enabled' : 'Disabled'}</div>
              <div>Vibration: {vibrationEnabled ? 'Enabled' : 'Disabled'}</div>
              <div>V2V Messages: {v2vMessages.length}</div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">📊 Experience Stats</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div>Communication Events: {v2vMessages.length}</div>
              <div>Network Coverage: {Math.floor(vehicles.length * 25)}%</div>
              <div>Signal Quality: Excellent</div>
              <div>Response Time: &lt;50ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveExperience;