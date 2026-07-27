'use client';

import { useState, useEffect } from 'react';

export default function VersionDisplay() {
  const [buildInfo, setBuildInfo] = useState({
    version: '1.0.0',
    buildNumber: 'dev',
    buildDate: new Date().toISOString(),
    commitHash: 'dev',
    environment: 'development'
  });

  useEffect(() => {
    // Set version info from build time or environment variables
    setBuildInfo({
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      buildNumber: process.env.NEXT_PUBLIC_BUILD_NUMBER || 'dev',
      buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
      commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'dev',
      environment: process.env.NODE_ENV || 'development'
    });
  }, []);

  const getVersionColor = () => {
    switch (buildInfo.environment) {
      case 'production':
        return 'text-green-400';
      case 'development':
        return 'text-blue-400';
      default:
        return 'text-yellow-400';
    }
  };

  const shortCommitHash = buildInfo.commitHash.length > 8
    ? buildInfo.commitHash.substring(0, 8)
    : buildInfo.commitHash;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono hover:bg-slate-800/90 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">v</span>
            <span className={`font-semibold ${getVersionColor()}`}>
              {buildInfo.version}
            </span>
          </div>
          {buildInfo.buildNumber !== 'dev' && (
            <>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{buildInfo.buildNumber}</span>
            </>
          )}
          {buildInfo.commitHash !== 'dev' && (
            <>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{shortCommitHash}</span>
            </>
          )}
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">
            {new Date(buildInfo.buildDate).toLocaleDateString()}
          </span>
          <span className="text-gray-600">•</span>
          <span className={`${getVersionColor()} font-bold`}>
            {buildInfo.environment.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-gray-500 text-xs mt-1 opacity-75 hover:opacity-100 transition-opacity">
          V2V Demo • Interactive Vehicle Communication
        </div>
      </div>
    </div>
  );
}