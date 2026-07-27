"use client";

import V2VConsole from "../V2VConsole";
import IdentityCard from "../IdentityCard";

export default function Demo() {
  return (
    <section id="demo" className="max-w-6xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Live Interactive Demo
        </h2>
        <p className="text-gray-400 text-lg">
          Experience real-time vehicle communication in action
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <V2VConsole />
        </div>
        <div className="space-y-8">
          <IdentityCard />

          {/* Demo Instructions */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl p-6 border border-blue-500/20 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Try It
            </h3>
            <ol className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 font-bold mr-3">1.</span>
                <span>Your vehicle identity is automatically generated</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 font-bold mr-3">2.</span>
                <span>Type a message and click "Broadcast Message"</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 font-bold mr-3">3.</span>
                <span>Watch your message appear in the live feed</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 font-bold mr-3">4.</span>
                <span>Adjust the detection radius to find nearby messages</span>
              </li>
            </ol>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-3xl p-6 border border-green-500/20 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Privacy & Security
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                End-to-end encrypted communication
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Messages expire after 24 hours
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No personal data stored permanently
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}