'use client';

import { useHealthCheck, useSports, useSchools } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { 
  Chip,
  Progress,
  Avatar,
  Badge,
  Spinner
} from '@heroui/react';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import { 
  AthleticCard, 
  FeatureCard, 
  StatusCard, 
  TechCard 
} from '@/components/ui/athletic-card';
import { 
  PrimaryActionButton, 
  SecondaryActionButton, 
  DangerActionButton 
} from '@/components/ui/athletic-button';
import { AthleticIcons } from '@/components/ui/athletic-icons';

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
          {/* Athletic Header with Chips */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              🎯 SmartFyt Student
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
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

          {/* Authentication Card */}
          <AthleticCard
            title="Authentication"
            icon={<AthleticIcons.Auth />}
            errorBoundaryName="Authentication"
            className="mb-6 sm:mb-8"
          >
            {authLoading ? (
              <div className="text-center py-4">
                <Spinner color="primary" size="sm" className="mr-2" />
                <span className="text-gray-500 dark:text-gray-400">Checking authentication...</span>
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <DangerActionButton
                  icon={<span>👋</span>}
                  onClick={logout}
                >
                  Sign Out
                </DangerActionButton>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Sign in to access your personalized dashboard and track your athletic performance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <PrimaryActionButton
                    icon={<span>🚀</span>}
                    size="lg"
                    onClick={login}
                  >
                    Sign In
                  </PrimaryActionButton>
                  <SecondaryActionButton
                    icon={<span>⭐</span>}
                    size="lg"
                    onClick={() => window.location.href = '/api/auth/register'}
                  >
                    Create Account
                  </SecondaryActionButton>
                </div>
              </div>
            )}
          </AthleticCard>

          {/* API Status Cards - Only show for authenticated users */}
          {isAuthenticated && (
            <AthleticCard
              title="Connection Status"
              icon={<AthleticIcons.Connection />}
              errorBoundaryName="API Status"
              className="mb-6 sm:mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Health Check */}
                <StatusCard title="Backend API" size="sm">
                  {healthLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Connecting...</span>
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
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Status: {healthCheck.data.status}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Version: {healthCheck.data.version}
                      </div>
                    </div>
                  ) : (
                    <Chip color="default" variant="flat" size="sm">
                      No response
                    </Chip>
                  )}
                </StatusCard>

                {/* Sports Data */}
                <StatusCard title="Sports Data" size="sm">
                  {sportsLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                    </div>
                  ) : sports?.data ? (
                    <div className="space-y-2">
                      <Chip color="success" variant="flat" size="sm">
                        Loaded
                      </Chip>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sports.data.length} sports available
                      </div>
                    </div>
                  ) : (
                    <Chip color="default" variant="flat" size="sm">
                      No data
                    </Chip>
                  )}
                </StatusCard>

                {/* Schools Data */}
                <StatusCard title="Schools Data" size="sm">
                  {schoolsLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                    </div>
                  ) : schools?.data ? (
                    <div className="space-y-2">
                      <Chip color="success" variant="flat" size="sm">
                        Loaded
                      </Chip>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {schools.data.length} schools available
                      </div>
                    </div>
                  ) : (
                    <Chip color="default" variant="flat" size="sm">
                      No data
                    </Chip>
                  )}
                </StatusCard>
              </div>
            </AthleticCard>
          )}

          {/* Athletic Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Health Tracking */}
            <FeatureCard
              title="Health Tracking"
              icon={<AthleticIcons.Health />}
              metric={{ value: "75%", label: "Health Score", progress: 75 }}
              errorBoundaryName="Health Tracking"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Monitor sleep, activity, and wellness metrics with real-time data from your wearable devices.
              </p>
              <Chip color="primary" variant="flat" size="sm">
                Coming Soon
              </Chip>
            </FeatureCard>

            {/* Journal Entries */}
            <FeatureCard
              title="Daily Journals"
              icon={<AthleticIcons.Journal />}
              metric={{ value: "60%", label: "Weekly Goal", progress: 60 }}
              errorBoundaryName="Daily Journals"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Reflect on your day, track goals, and receive AI-powered insights to improve performance.
              </p>
              <Chip color="success" variant="flat" size="sm">
                AI Powered
              </Chip>
            </FeatureCard>

            {/* Quest System */}
            <FeatureCard
              title="Quest System"
              icon={<AthleticIcons.Quest />}
              metric={{ value: "40%", label: "Level Progress", progress: 40 }}
              errorBoundaryName="Quest System"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Complete challenges, earn points, and level up your athletic and academic performance.
              </p>
              <Chip color="secondary" variant="flat" size="sm">
                Gamified
              </Chip>
            </FeatureCard>

            {/* Performance Metrics */}
            <FeatureCard
              title="Performance Analytics"
              icon={<AthleticIcons.Performance />}
              metric={{ value: "85%", label: "Performance", progress: 85 }}
              errorBoundaryName="Performance Analytics"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Visualize your progress with comprehensive charts and insights into your athletic development.
              </p>
              <Chip color="warning" variant="flat" size="sm">
                Advanced Analytics
              </Chip>
            </FeatureCard>

            {/* Goal Setting */}
            <FeatureCard
              title="Goal Management"
              icon={<AthleticIcons.Goal />}
              metric={{ value: "92%", label: "Goals Met", progress: 92 }}
              errorBoundaryName="Goal Management"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Set, track, and achieve your athletic and academic goals with personalized action plans.
              </p>
              <Chip color="danger" variant="flat" size="sm">
                Smart Planning
              </Chip>
            </FeatureCard>

            {/* Team Connection */}
            <FeatureCard
              title="Team Integration"
              icon={<AthleticIcons.Team />}
              metric={{ value: "70%", label: "Team Sync", progress: 70 }}
              errorBoundaryName="Team Integration"
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Stay connected with your team, coaches, and compete in friendly challenges with teammates.
              </p>
              <Chip color="secondary" variant="flat" size="sm">
                Collaborative
              </Chip>
            </FeatureCard>
          </div>

          {/* Technology Stack */}
          <TechCard
            title="Mobile-First Technology"
            icon={<AthleticIcons.Mobile />}
            errorBoundaryName="Technology Stack"
            className="mb-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="text-3xl mb-2">⚛️</div>
                <Chip size="sm" variant="flat">React 18</Chip>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="text-3xl mb-2">📱</div>
                <Chip size="sm" variant="flat" color="primary">PWA Ready</Chip>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="text-3xl mb-2">📡</div>
                <Chip size="sm" variant="flat" color="success">Offline First</Chip>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="text-3xl mb-2">🚀</div>
                <Chip size="sm" variant="flat" color="secondary">Fast Loading</Chip>
              </div>
            </div>
          </TechCard>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
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
                <SecondaryActionButton
                  size="sm"
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-gray-300"
                >
                  Later
                </SecondaryActionButton>
                <PrimaryActionButton
                  size="sm"
                  onClick={handleInstallClick}
                >
                  Install
                </PrimaryActionButton>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <PrimaryActionButton
          size="lg"
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl mobile-hidden z-50 hover:scale-110 transition-transform duration-200"
          onClick={() => console.log('Quick action!')}
        >
          <span className="text-2xl">⚡</span>
        </PrimaryActionButton>
      </div>
    </PageErrorBoundary>
  );
}

