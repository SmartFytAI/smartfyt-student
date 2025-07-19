'use client';

import { useHealthCheck, useSports, useSchools } from '@/hooks/use-api';

export default function HomePage() {
  const { data: healthCheck, isLoading: healthLoading, error: healthError } = useHealthCheck();
  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: schools, isLoading: schoolsLoading } = useSchools();

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 SmartFyt Student Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to your personalized student-athlete performance tracking platform. 
            Modern, fast, and built specifically for your success.
          </p>
        </div>

        {/* API Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🔌 API Connection Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Health Check */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Backend Health</h3>
              {healthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Checking...</span>
                </div>
              ) : healthError ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-red-600">Disconnected</span>
                </div>
              ) : healthCheck?.data ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {healthCheck.data.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    Version: {healthCheck.data.version}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No response</span>
              )}
            </div>

            {/* Sports Data */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Sports Data</h3>
              {sportsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : sports?.data ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600">Loaded</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {sports.data.length} sports available
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No data</span>
              )}
            </div>

            {/* Schools Data */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Schools Data</h3>
              {schoolsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : schools?.data ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600">Loaded</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {schools.data.length} schools available
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Student Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Tracking */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                📊
              </div>
              <h3 className="text-lg font-semibold">Health Tracking</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Monitor sleep, activity, and wellness metrics with real-time data from your wearable devices.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Live health dashboard
            </div>
          </div>

          {/* Journal Entries */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                📝
              </div>
              <h3 className="text-lg font-semibold">Daily Journals</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Reflect on your day, track goals, and receive AI-powered insights to improve performance.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Smart journal interface
            </div>
          </div>

          {/* Quest System */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                🎮
              </div>
              <h3 className="text-lg font-semibold">Quest System</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Complete challenges, earn points, and level up your athletic and academic performance.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Interactive quest board
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                📈
              </div>
              <h3 className="text-lg font-semibold">Performance Analytics</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Visualize your progress with comprehensive charts and insights into your athletic development.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Advanced analytics dashboard
            </div>
          </div>

          {/* Goal Setting */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                🎯
              </div>
              <h3 className="text-lg font-semibold">Goal Management</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Set, track, and achieve your athletic and academic goals with personalized action plans.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Smart goal planning
            </div>
          </div>

          {/* Team Connection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                👥
              </div>
              <h3 className="text-lg font-semibold">Team Integration</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Stay connected with your team, coaches, and compete in friendly challenges with teammates.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Coming soon: Team collaboration tools
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500 text-sm">
            Built with Next.js 15, TypeScript, Tailwind CSS, and React Query
          </p>
          <p className="text-gray-400 text-xs mt-2">
            🚀 Phase 3: Student Experience Repository - In Development
          </p>
        </div>
      </main>
    </div>
  );
}
