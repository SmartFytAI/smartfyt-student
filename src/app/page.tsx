'use client';

import { useHealthCheck, useSports, useSchools } from '@/hooks/use-api';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { data: healthCheck, isLoading: healthLoading, error: healthError } = useHealthCheck();
  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: schools, isLoading: schoolsLoading } = useSchools();
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  return (
    <div className="min-h-screen-mobile p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl mx-auto">
        {/* Mobile-optimized Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎯 SmartFyt Student
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Your personalized student-athlete performance tracking platform. 
            <span className="block sm:inline"> Modern, fast, and now available as a mobile app!</span>
          </p>
          
          {/* Mobile App Badge */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
              📱 <span>Available as Mobile App</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
              ⚡ <span>Works Offline</span>
            </div>
          </div>
        </div>

        {/* API Status Card - Mobile Optimized */}
        <div className="mobile-card mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2">
            🔌 <span>Connection Status</span>
          </h2>
          
          <div className="mobile-grid">
            {/* Health Check */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Backend API</h3>
              {healthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="status-loading"></div>
                  <span className="text-mobile-sm text-gray-500">Connecting...</span>
                </div>
              ) : healthError ? (
                <div className="flex items-center gap-2">
                  <div className="status-offline"></div>
                  <span className="text-mobile-sm text-red-600">Offline Mode</span>
                </div>
              ) : healthCheck?.data ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="status-online"></div>
                    <span className="text-mobile-sm text-green-600">Connected</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {healthCheck.data.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    Version: {healthCheck.data.version}
                  </div>
                </div>
              ) : (
                <span className="text-mobile-sm text-gray-400">No response</span>
              )}
            </div>

            {/* Sports Data */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Sports Data</h3>
              {sportsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="status-loading"></div>
                  <span className="text-mobile-sm text-gray-500">Loading...</span>
                </div>
              ) : sports?.data ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="status-online"></div>
                    <span className="text-mobile-sm text-green-600">Loaded</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {sports.data.length} sports available
                  </div>
                </div>
              ) : (
                <span className="text-mobile-sm text-gray-400">No data</span>
              )}
            </div>

            {/* Schools Data */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Schools Data</h3>
              {schoolsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="status-loading"></div>
                  <span className="text-mobile-sm text-gray-500">Loading...</span>
                </div>
              ) : schools?.data ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="status-online"></div>
                    <span className="text-mobile-sm text-green-600">Loaded</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {schools.data.length} schools available
                  </div>
                </div>
              ) : (
                <span className="text-mobile-sm text-gray-400">No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Student Features - Mobile Grid */}
        <div className="mobile-grid">
          {/* Health Tracking */}
          <div className="mobile-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                📊
              </div>
              <h3 className="text-lg font-semibold">Health Tracking</h3>
            </div>
            <p className="text-gray-600 text-mobile-sm mb-4">
              Monitor sleep, activity, and wellness metrics with real-time data from your wearable devices.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Live health dashboard
            </div>
          </div>

          {/* Journal Entries */}
          <div className="mobile-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">
                📝
              </div>
              <h3 className="text-lg font-semibold">Daily Journals</h3>
            </div>
            <p className="text-gray-600 text-mobile-sm mb-4">
              Reflect on your day, track goals, and receive AI-powered insights to improve performance.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Smart journal interface
            </div>
          </div>

          {/* Quest System */}
          <div className="mobile-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
                🎮
              </div>
              <h3 className="text-lg font-semibold">Quest System</h3>
            </div>
            <p className="text-gray-600 text-mobile-sm mb-4">
              Complete challenges, earn points, and level up your athletic and academic performance.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Interactive quest board
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mobile-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">
                📈
              </div>
              <h3 className="text-lg font-semibold">Performance Analytics</h3>
            </div>
            <p className="text-gray-600 text-mobile-sm mb-4">
              Visualize your progress with comprehensive charts and insights into your athletic development.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Advanced analytics dashboard
            </div>
          </div>

          {/* Goal Setting */}
          <div className="mobile-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-lg">
                🎯
              </div>
              <h3 className="text-lg font-semibold">Goal Management</h3>
            </div>
            <p className="text-gray-600 text-mobile-sm mb-4">
              Set, track, and achieve your athletic and academic goals with personalized action plans.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Smart goal planning
            </div>
          </div>

          {/* Team Connection */}
          <div className="mobile-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">
                👥
              </div>
              <h3 className="text-lg font-semibold">Team Integration</h3>
            </div>
            <p className="text-gray-600 text-mobile-sm mb-4">
              Stay connected with your team, coaches, and compete in friendly challenges with teammates.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Team collaboration tools
            </div>
          </div>
        </div>

        {/* Mobile Technology Stack */}
        <div className="mobile-card mt-8">
          <h2 className="text-xl font-semibold mb-4">🏗️ Mobile-First Technology</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">⚛️</div>
              <div className="text-mobile-sm font-medium">React 18</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-mobile-sm font-medium">PWA Ready</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">📡</div>
              <div className="text-mobile-sm font-medium">Offline First</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">🚀</div>
              <div className="text-mobile-sm font-medium">Fast Loading</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500 text-mobile-sm">
            Built with Next.js 15, TypeScript, Tailwind CSS, and React Query
          </p>
          <p className="text-gray-400 text-xs mt-2">
            📱 Phase 3: Student Experience - Mobile PWA Ready! ✨
          </p>
        </div>
      </main>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="pwa-install-prompt show">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Install SmartFyt Student</h3>
              <p className="text-gray-300 text-sm">Get the full mobile app experience</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-4 py-2 text-gray-300 text-sm"
              >
                Later
              </button>
              <button
                onClick={handleInstallClick}
                className="mobile-button-primary text-sm"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Actions */}
      <button className="fab mobile-hidden">
        <span className="text-xl">+</span>
      </button>
    </div>
  );
}
