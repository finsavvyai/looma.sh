'use client';

import { useState, useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

interface VehicleNode {
  id: string;
  x: number;
  y: number;
  type: 'car' | 'truck' | 'emergency' | 'autonomous';
  pulsePhase: number;
  connections: string[];
}

const FuturisticHero: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [vehicles, setVehicles] = useState<VehicleNode[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? '#3B82F6' : '#A855F7',
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(initialParticles);

    // Initialize vehicle nodes
    const initialVehicles: VehicleNode[] = [
      { id: 'v1', x: 200, y: 150, type: 'car', pulsePhase: 0, connections: ['v2', 'v3'] },
      { id: 'v2', x: 400, y: 250, type: 'truck', pulsePhase: Math.PI / 3, connections: ['v1', 'v4'] },
      { id: 'v3', x: 300, y: 350, type: 'emergency', pulsePhase: (2 * Math.PI) / 3, connections: ['v1', 'v4', 'v5'] },
      { id: 'v4', x: 500, y: 200, type: 'autonomous', pulsePhase: Math.PI, connections: ['v2', 'v3', 'v5'] },
      { id: 'v5', x: 600, y: 300, type: 'car', pulsePhase: (4 * Math.PI) / 3, connections: ['v3', 'v4'] }
    ];
    setVehicles(initialVehicles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 0.02;

      // Update and draw particles
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;

          // Bounce off walls
          if (newX < 0 || newX > canvas.width) particle.vx *= -1;
          if (newY < 0 || newY > canvas.height) particle.vy *= -1;

          newX = Math.max(0, Math.min(canvas.width, newX));
          newY = Math.max(0, Math.min(canvas.height, newY));

          // Draw particle
          ctx.beginPath();
          ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;
          ctx.fill();

          // Draw connections to nearby particles
          prevParticles.forEach(otherParticle => {
            if (particle.id !== otherParticle.id) {
              const distance = Math.sqrt(
                Math.pow(newX - otherParticle.x, 2) +
                Math.pow(newY - otherParticle.y, 2)
              );
              if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(newX, newY);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = particle.color;
                ctx.globalAlpha = (1 - distance / 150) * 0.2;
                ctx.stroke();
              }
            }
          });

          return { ...particle, x: newX, y: newY };
        })
      );

      // Update and draw vehicles
      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle => {
          const pulseIntensity = Math.sin(timeRef.current + vehicle.pulsePhase) * 0.3 + 0.7;

          // Draw vehicle node
          const nodeSize = vehicle.type === 'emergency' ? 20 : 15;
          const gradient = ctx.createRadialGradient(
            vehicle.x, vehicle.y, 0,
            vehicle.x, vehicle.y, nodeSize * 2
          );

          const colors = {
            car: ['#3B82F6', '#1E40AF'],
            truck: ['#F59E0B', '#D97706'],
            emergency: ['#EF4444', '#B91C1C'],
            autonomous: ['#A855F7', '#7C3AED']
          };

          gradient.addColorStop(0, colors[vehicle.type][0]);
          gradient.addColorStop(1, colors[vehicle.type][1]);

          ctx.beginPath();
          ctx.arc(vehicle.x, vehicle.y, nodeSize * pulseIntensity, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.8;
          ctx.fill();

          // Draw connections
          vehicle.connections.forEach(targetId => {
            const target = prevVehicles.find(v => v.id === targetId);
            if (target) {
              // Animated connection
              const dashOffset = (timeRef.current * 50) % 20;
              ctx.beginPath();
              ctx.moveTo(vehicle.x, vehicle.y);
              ctx.lineTo(target.x, target.y);
              ctx.strokeStyle = '#60A5FA';
              ctx.lineWidth = 2;
              ctx.globalAlpha = 0.6;
              ctx.setLineDash([10, 10]);
              ctx.lineDashOffset = dashOffset;
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });

          // Draw data packets
          vehicle.connections.forEach((targetId, index) => {
            const target = prevVehicles.find(v => v.id === targetId);
            if (target) {
              const packetProgress = ((timeRef.current + index * 0.5) % 2) / 2;
              const packetX = vehicle.x + (target.x - vehicle.x) * packetProgress;
              const packetY = vehicle.y + (target.y - vehicle.y) * packetProgress;

              ctx.beginPath();
              ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#FBBF24';
              ctx.globalAlpha = 1 - Math.abs(packetProgress - 0.5) * 2;
              ctx.fill();
            }
          });

          return vehicle;
        })
      );

      // Mouse interaction effect
      if (isHovered && canvas.width > 0 && canvas.height > 0) {
        const gradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, 100
        );
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, mousePosition]);

  const getVehicleIcon = (type: VehicleNode['type']) => {
    const icons = {
      car: '🚗',
      truck: '🚚',
      emergency: '🚑',
      autonomous: '🤖'
    };
    return icons[type];
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></span>
          <span className="text-sm font-medium text-blue-300">Revolutionizing Vehicle Communication</span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 max-w-5xl">
          <span className="block text-7xl md:text-8xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-300">
              The Future of
            </span>
          </span>
          <span className="block text-7xl md:text-8xl font-bold mt-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-gradient bg-300" style={{ animationDelay: '1s' }}>
              Vehicle-to-Vehicle
            </span>
          </span>
          <span className="block text-7xl md:text-8xl font-bold mt-4">
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-transparent animate-gradient bg-300" style={{ animationDelay: '2s' }}>
              Communication
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="mb-8 max-w-3xl text-xl md:text-2xl text-gray-300 leading-relaxed">
          Experience the next generation of vehicular connectivity with our AI-powered V2V network.
          <span className="text-blue-400 font-semibold"> Reduce accidents by 80%</span>,
          <span className="text-purple-400 font-semibold"> save 25% on fuel</span>, and
          <span className="text-pink-400 font-semibold"> transform transportation forever</span>.
        </p>

        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap justify-center gap-8 text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-lg blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-blue-400">500M+</div>
              <div className="text-sm text-gray-400">Messages/Day</div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-lg blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-purple-400">99.99%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-pink-500 rounded-lg blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-pink-400">&lt;10ms</div>
              <div className="text-sm text-gray-400">Latency</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <a
            href="/demo/select"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            <span className="relative z-10 flex items-center justify-center">
              🚀 Experience the Future
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </a>

          <a
            href="/demo/analytics"
            className="group relative px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600 rounded-xl font-semibold text-gray-300 hover:bg-slate-700/50 hover:border-blue-500/50 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center justify-center">
              📊 View Live Analytics
              <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </a>
        </div>

        {/* Vehicle Type Legend */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {vehicles.slice(0, 4).map((vehicle) => (
            <div key={vehicle.id} className="flex items-center space-x-2 text-gray-400">
              <span className="text-lg">{getVehicleIcon(vehicle.type)}</span>
              <span className="capitalize">{vehicle.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-gray-400 text-sm mb-2">Scroll to explore</div>
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
        .bg-300 {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  );
};

export default FuturisticHero;