"use client";

import { useEffect, useState, useRef } from "react";
import { getLocation } from "../lib/location";
import "../styles/animations.css";

import {
  LoomaIdentity,
  loadOrCreateIdentity,
  sendV2VMessage,
  fetchV2VFeed,
} from "../lib/identity";

type Msg = {
  id: string;
  device_id: string;
  payload: { type: string; text?: string; _gps?: any };
  timestamp: number;
  _distance?: number;
};

export default function V2VConsole() {
  const [identity, setIdentity] = useState<LoomaIdentity | null>(null);
  const [text, setText] = useState("merge soon");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [since, setSince] = useState(0);
  const [location, setLocation] = useState<any>(null);
  const [radius, setRadius] = useState(300);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("good");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection effect with HTTP fallback
  useEffect(() => {
    if (!location) return;

    let websocketEnabled = true;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      setWsStatus("connecting");

      const wsUrl = `${process.env.NEXT_PUBLIC_RELAY_BASE?.replace(/^http/, 'ws') || 'wss://relay.looma.sh'}/v2v/ws?lat=${location.lat}&lng=${location.lng}&radius=${radius}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("🔌 WebSocket connected");
          setWsStatus("connected");
          setConnectionQuality("excellent");
          websocketEnabled = true;

          // Clear any existing reconnection timeout and fallback polling
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "feed_update") {
              setMessages(data.data.messages || []);
              setSince(data.data.now || Date.now());

              // Update connection quality based on message latency
              const now = Date.now();
              const latency = now - data.data.now;
              if (latency < 1000) {
                setConnectionQuality("excellent");
              } else if (latency < 3000) {
                setConnectionQuality("good");
              } else {
                setConnectionQuality("poor");
              }
            }
          } catch (error) {
            console.error("WebSocket message error:", error);
          }
        };

        ws.onclose = () => {
          console.log("🔌 WebSocket disconnected");
          setWsStatus("disconnected");
          websocketEnabled = false;

          // Start fallback polling
          startFallbackPolling();

          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Attempting to reconnect WebSocket...");
            connectWebSocket();
          }, 5000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setWsStatus("disconnected");
          setConnectionQuality("poor");
          websocketEnabled = false;

          // Start fallback polling on WebSocket error
          startFallbackPolling();
        };

        // Set timeout for WebSocket connection
        setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.log("⏰ WebSocket connection timeout");
            ws.close();
            websocketEnabled = false;
            startFallbackPolling();
          }
        }, 5000);

      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        websocketEnabled = false;
        startFallbackPolling();
      }
    };

    const startFallbackPolling = () => {
      if (fallbackInterval) return; // Already polling

      console.log("📡 Starting HTTP polling fallback");
      fallbackInterval = setInterval(async () => {
        try {
          const url = `${process.env.NEXT_PUBLIC_RELAY_BASE || 'https://relay.looma.sh'}/v2v/feed?lat=${location.lat}&lng=${location.lng}&radius=${radius}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
            setSince(data.now || Date.now());
            setConnectionQuality("good"); // HTTP polling is considered "good" quality
          }
        } catch (error) {
          console.error("Fallback polling error:", error);
          setConnectionQuality("poor");
        }
      }, 3000); // Poll every 3 seconds
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [location, radius]);

  // Initialize identity and location
  useEffect(() => {
    console.log("🚀 V2VConsole mounting...");
    loadOrCreateIdentity()
      .then((id) => {
        console.log("✅ Identity loaded:", id);
        setIdentity(id);
      })
      .catch((err) => {
        console.error("❌ Failed to load identity:", err);
      });

    // get GPS on mount
    getLocation()
      .then((loc) => {
        console.log("📍 GPS loaded:", loc);
        setLocation(loc);
      })
      .catch(() => {
        console.log("⚠️ GPS failed, using fallback");
        setLocation(null);
      });
  }, []);

  async function refreshFeed() {
    // Only refresh if WebSocket is not connected
    if (wsStatus === "connected") {
      console.log("📡 WebSocket is handling updates, skipping manual refresh");
      return;
    }

    let loc: any = location;
    if (!loc) {
      loc = await getLocation().catch(() => null);
      setLocation(loc);
    }

    // If no GPS, no filtering (fallback) - use default coordinates
    if (!loc) {
      const data = await fetchV2VFeed(0, 0, 999999); // World coordinates
      setMessages(data.messages || []);
      setSince(data.now || Date.now());
      return;
    }

    // GPS-aware feed
    const url = `${process.env.NEXT_PUBLIC_RELAY_BASE}/v2v/feed?lat=${loc.lat}&lng=${loc.lng}&radius=${radius}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Feed error:", res.status);
      return;
    }

    const data = await res.json();
    setMessages(data.messages || []);
    setSince(data.now || Date.now());
  }

  async function sendPing() {
    if (!identity) {
      console.log("❌ No identity loaded");
      return;
    }
    console.log("🚗 Sending ping with identity:", identity.deviceId);
    try {
      await sendV2VMessage(identity, { type: "PING", text });
      console.log("✅ Ping sent successfully");
      // WebSocket will automatically receive the new message, no need to refresh
    } catch (error) {
      console.error("❌ Failed to send ping:", error);
      alert("Failed to send message: " + (error as Error).message);
    }
  }

  // Connection status indicator
const ConnectionIndicator = () => {
  const statusColors = {
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    disconnected: "bg-red-500"
  };

  const qualityColors = {
    excellent: "text-green-400",
    good: "text-blue-400",
    poor: "text-yellow-400"
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-black/30 rounded-xl backdrop-blur-sm">
      <div className={`w-2 h-2 rounded-full ${statusColors[wsStatus]} ${wsStatus === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-medium text-gray-300">
        {wsStatus === 'connecting' ? 'Connecting...' : wsStatus === 'connected' ? 'Live WebSocket' : 'HTTP Polling'}
      </span>
      <span className={`text-xs ${qualityColors[connectionQuality]}`}>
        • {connectionQuality === 'excellent' ? '🔥' : connectionQuality === 'good' ? '✨' : '📡'}
      </span>
    </div>
  );
};

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 backdrop-blur-xl space-y-6 shadow-2xl">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              V2V Network
            </h2>
            <p className="text-sm text-gray-400">Real-time vehicle communication</p>
          </div>
        </div>
        <ConnectionIndicator />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-4 border border-blue-500/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-blue-400">{messages.length}</div>
          <div className="text-xs text-blue-300/70">Active Messages</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-4 border border-purple-500/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-purple-400">{radius}m</div>
          <div className="text-xs text-purple-300/70">Search Radius</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-4 border border-green-500/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-400">
            {messages.filter(m => m._distance && m._distance < 100).length}
          </div>
          <div className="text-xs text-green-300/70">Nearby (100m)</div>
        </div>
      </div>

      {/* Message Composer */}
      <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 space-y-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Broadcast Message
        </label>
        <div className="space-y-3">
          <input
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={sendPing}
            disabled={!identity || wsStatus !== "connected"}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:scale-100 disabled:opacity-50"
          >
            {!identity ? "Loading Identity..." : wsStatus !== "connected" ? "Connecting..." : "🚗 Broadcast Message"}
          </button>
        </div>
      </div>

      {/* Radius Control */}
      <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Detection Range: <span className="text-blue-400 font-bold">{radius}m</span>
        </label>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>50m</span>
          <span>500m</span>
          <span>1000m</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">Live Feed</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Real-time</span>
          </div>
        </div>

        <div className="max-h-80 overflow-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No messages in range</p>
              <p className="text-gray-500 text-xs mt-1">Messages will appear here when vehicles are nearby</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 hover:bg-slate-900/70 transform hover:scale-[1.02] animate-fadeIn"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg text-xs font-mono text-blue-300 border border-blue-500/20">
                        {m.payload.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white text-sm mb-2">{m.payload.text}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="font-mono">
                        {m.device_id.substring(0, 8)}...{m.device_id.substring(m.device_id.length - 4)}
                      </span>
                      {m._distance && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className={m._distance < 100 ? "text-green-400" : m._distance < 500 ? "text-yellow-400" : "text-red-400"}>
                            {m._distance.toFixed(0)}m
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {wsStatus === "connected" ? "🔗 Real-time connection active" : "📡 Reconnecting..."}
        </span>
        <span>
          {identity ? `🆔 ${identity.deviceId}` : "🔄 Loading identity..."}
        </span>
      </div>
    </div>
  );
}