'use client';

import { useHealthCheck, useSports, useSchools } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Chip,
  Progress,
  Avatar,
  Badge,
  Spinner
} from '@heroui/react';
import { CardErrorBoundary, PageErrorBoundary } from '@/components/error/error-boundary';

export default function HomePage() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
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
    <PageErrorBoundary>
      <div className="min-h-screen-mobile p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
        <main className="max-w-6xl mx-auto">
        {/* Athletic Header with HeroUI Chips */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎯 SmartFyt Student
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Your personalized student-athlete performance tracking platform. 
            <span className="block sm:inline"> Modern, fast, and now available as a mobile app!</span>
          </p>
          
          {/* Athletic Status Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Chip 
              color="secondary" 
              variant="flat"
              startContent={<span>📱</span>}
            >
              Mobile App Ready
            </Chip>
            <Chip 
              color="success" 
              variant="flat"
              startContent={<span>⚡</span>}
            >
              Works Offline
            </Chip>
            <Chip 
              color="primary" 
              variant="flat"
              startContent={<span>🏃</span>}
            >
              Athletic Performance
            </Chip>
          </div>
        </div>

        {/* Authentication Card with HeroUI */}
        <CardErrorBoundary name="Authentication">
          <Card className="mb-6 sm:mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80" radius="lg">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-xl font-semibold">🔐 Authentication</p>
            </div>
          </CardHeader>
          <CardBody>
            {authLoading ? (
              <div className="text-center py-4">
                <Spinner color="primary" size="sm" className="mr-2" />
                <span className="text-gray-500">Checking authentication...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                                     <Badge content="✓" color="success" shape="circle">
                     <Avatar 
                       src={user.picture || undefined} 
                       name={user.name || undefined}
                       size="md"
                       className="transition-transform"
                     />
                   </Badge>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  size="md"
                  radius="lg"
                  onPress={logout}
                  className="cursor-pointer font-medium"
                  startContent={<span>👋</span>}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-6">
                  Sign in to access your personalized dashboard and track your athletic performance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    color="primary"
                    variant="shadow"
                    size="lg"
                    radius="full"
                    onPress={login}
                    className="cursor-pointer font-semibold"
                    startContent={<span>🚀</span>}
                  >
                    Sign In
                  </Button>
                  <Button
                    color="secondary"
                    variant="bordered"
                    size="lg"
                    radius="full"
                    onPress={() => window.location.href = '/api/auth/register'}
                    className="cursor-pointer border-2 font-semibold"
                    startContent={<span>⭐</span>}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
        </CardErrorBoundary>

        {/* API Status Cards - Only show for authenticated users */}
        {isAuthenticated && (
          <CardErrorBoundary name="API Status">
            <Card className="mb-6 sm:mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80" radius="lg">
            <CardHeader>
              <h2 className="text-xl font-semibold">🔌 Connection Status</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Health Check */}
                <Card shadow="md" className="border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90" radius="lg">
                  <CardBody className="p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Backend API</h3>
                    {healthLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="primary" />
                        <span className="text-sm text-gray-500">Connecting...</span>
                      </div>
                    ) : healthError ? (
                      <Chip color="danger" variant="flat" size="sm">
                        Offline Mode
                      </Chip>
                    ) : healthCheck?.data ? (
                      <div className="space-y-2">
                        <Chip color="success" variant="flat" size="sm">
                          Connected
                        </Chip>
                        <div className="text-xs text-gray-500">
                          Status: {healthCheck.data.status}
                        </div>
                        <div className="text-xs text-gray-500">
                          Version: {healthCheck.data.version}
                        </div>
                      </div>
                    ) : (
                      <Chip color="default" variant="flat" size="sm">
                        No response
                      </Chip>
                    )}
                  </CardBody>
                </Card>

                {/* Sports Data */}
                <Card shadow="md" className="border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90" radius="lg">
                  <CardBody className="p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Sports Data</h3>
                    {sportsLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="primary" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : sports?.data ? (
                      <div className="space-y-2">
                        <Chip color="success" variant="flat" size="sm">
                          Loaded
                        </Chip>
                        <div className="text-xs text-gray-500">
                          {sports.data.length} sports available
                        </div>
                      </div>
                    ) : (
                      <Chip color="default" variant="flat" size="sm">
                        No data
                      </Chip>
                    )}
                  </CardBody>
                </Card>

                {/* Schools Data */}
                <Card shadow="md" className="border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90" radius="lg">
                  <CardBody className="p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Schools Data</h3>
                    {schoolsLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="primary" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : schools?.data ? (
                      <div className="space-y-2">
                        <Chip color="success" variant="flat" size="sm">
                          Loaded
                        </Chip>
                        <div className="text-xs text-gray-500">
                          {schools.data.length} schools available
                        </div>
                      </div>
                    ) : (
                      <Chip color="default" variant="flat" size="sm">
                        No data
                      </Chip>
                    )}
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
          </CardErrorBoundary>
        )}

        {/* Athletic Features Grid with HeroUI Cards */}
        <CardErrorBoundary name="Athletic Features">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Health Tracking */}
          <Card 
            className="hover:scale-[1.05] hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl"
            shadow="lg"
          >
            <CardHeader className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-lg">
                📊
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Health Tracking</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 text-sm mb-4">
                Monitor sleep, activity, and wellness metrics with real-time data from your wearable devices.
              </p>
              <Progress 
                size="sm" 
                value={75} 
                color="primary"
                showValueLabel={true}
                label="Health Score"
                className="mb-3"
              />
              <Chip color="primary" variant="flat" size="sm">
                Coming Soon
              </Chip>
            </CardBody>
          </Card>

          {/* Journal Entries */}
          <Card 
            className="hover:scale-[1.05] hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl"
            shadow="lg"
          >
            <CardHeader className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-lg">
                📝
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Daily Journals</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 text-sm mb-4">
                Reflect on your day, track goals, and receive AI-powered insights to improve performance.
              </p>
              <Progress 
                size="sm" 
                value={60} 
                color="success"
                showValueLabel={true}
                label="Weekly Goal"
                className="mb-3"
              />
              <Chip color="success" variant="flat" size="sm">
                AI Powered
              </Chip>
            </CardBody>
          </Card>

          {/* Quest System */}
          <Card className="hover:scale-[1.02] transition-transform border border-gray-200 cursor-pointer">
            <CardHeader className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                🎮
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Quest System</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 text-sm mb-4">
                Complete challenges, earn points, and level up your athletic and academic performance.
              </p>
              <Progress 
                size="sm" 
                value={40} 
                color="secondary"
                showValueLabel={true}
                label="Level Progress"
                className="mb-3"
              />
              <Chip color="secondary" variant="flat" size="sm">
                Gamified
              </Chip>
            </CardBody>
          </Card>

          {/* Performance Metrics */}
          <Card className="hover:scale-[1.02] transition-transform border border-gray-200 cursor-pointer">
            <CardHeader className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-lg">
                📈
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Performance Analytics</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 text-sm mb-4">
                Visualize your progress with comprehensive charts and insights into your athletic development.
              </p>
              <Progress 
                size="sm" 
                value={85} 
                color="warning"
                showValueLabel={true}
                label="Performance"
                className="mb-3"
              />
              <Chip color="warning" variant="flat" size="sm">
                Advanced Analytics
              </Chip>
            </CardBody>
          </Card>

          {/* Goal Setting */}
          <Card className="hover:scale-[1.02] transition-transform border border-gray-200 cursor-pointer">
            <CardHeader className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center text-lg">
                🎯
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Goal Management</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 text-sm mb-4">
                Set, track, and achieve your athletic and academic goals with personalized action plans.
              </p>
              <Progress 
                size="sm" 
                value={92} 
                color="danger"
                showValueLabel={true}
                label="Goals Met"
                className="mb-3"
              />
              <Chip color="danger" variant="flat" size="sm">
                Smart Planning
              </Chip>
            </CardBody>
          </Card>

          {/* Team Connection */}
          <Card className="hover:scale-[1.02] transition-transform border border-gray-200 cursor-pointer">
            <CardHeader className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-lg">
                👥
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Team Integration</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 text-sm mb-4">
                Stay connected with your team, coaches, and compete in friendly challenges with teammates.
              </p>
              <Progress 
                size="sm" 
                value={70} 
                color="secondary"
                showValueLabel={true}
                label="Team Sync"
                className="mb-3"
              />
              <Chip color="secondary" variant="flat" size="sm">
                Collaborative
              </Chip>
            </CardBody>
          </Card>
          </div>
        </CardErrorBoundary>

        {/* Technology Stack */}
        <CardErrorBoundary name="Technology Stack">
          <Card className="mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl">
          <CardHeader>
            <h2 className="text-xl font-semibold">🏗️ Mobile-First Technology</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl mb-2">⚛️</div>
                <Chip size="sm" variant="flat">React 18</Chip>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl mb-2">📱</div>
                <Chip size="sm" variant="flat" color="primary">PWA Ready</Chip>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl mb-2">📡</div>
                <Chip size="sm" variant="flat" color="success">Offline First</Chip>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl mb-2">🚀</div>
                <Chip size="sm" variant="flat" color="secondary">Fast Loading</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
        </CardErrorBoundary>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500 text-sm mb-3">
            Built with Next.js 15, HeroUI, TypeScript, Tailwind CSS v4, and React Query
          </p>
          <Chip color="primary" variant="flat">
            📱 Phase 3: Student Experience - Mobile PWA Ready! ✨
          </Chip>
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
              <Button
                size="sm"
                variant="light"
                onPress={() => setShowInstallPrompt(false)}
                className="text-gray-300 cursor-pointer"
              >
                Later
              </Button>
              <Button
                size="sm"
                color="primary"
                onPress={handleInstallClick}
                className="cursor-pointer"
              >
                Install
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        isIconOnly
        color="primary"
        variant="shadow"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl mobile-hidden z-50 hover:scale-110 transition-transform duration-200"
        size="lg"
      >
        <span className="text-2xl">⚡</span>
      </Button>
      </div>
    </PageErrorBoundary>
  );
}

