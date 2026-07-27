"use client";

import { useEffect } from "react";

export default function FrenchRedirect() {
  useEffect(() => {
    // Set the language in localStorage and redirect to main page
    if (typeof window !== 'undefined') {
      localStorage.setItem('looma-language', 'fr');
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirection vers le français...</p>
        <p className="text-gray-400 mt-2">Redirecting to French...</p>
      </div>
    </div>
  );
}