"use client";

import { useEffect, useState } from "react";
import { LoomaIdentity, loadOrCreateIdentity } from "../lib/identity";

export default function IdentityCard() {
  const [identity, setIdentity] = useState<LoomaIdentity | null>(null);

  useEffect(() => {
    loadOrCreateIdentity().then(setIdentity);
  }, []);

  if (!identity) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-300">Initializing Identity</div>
            <div className="text-xs text-gray-500 loading-dots">Generating cryptographic keys</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-xl space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Vehicle Identity</h3>
          <p className="text-sm text-gray-400">Cryptographically secure</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Nickname</div>
          <div className="text-white font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg px-3 py-2 border border-blue-500/20">
            {identity.nickname}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1">Device ID</div>
          <div className="font-mono text-xs bg-slate-900/50 rounded-lg px-3 py-2 text-gray-300 border border-slate-600/30 break-all">
            {identity.deviceId}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1">Public Key (ED25519)</div>
          <div className="font-mono text-xs bg-slate-900/50 rounded-lg px-3 py-2 text-gray-300 border border-slate-600/30 break-all max-h-20 overflow-y-auto">
            {identity.publicKeyHex}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Verified</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}