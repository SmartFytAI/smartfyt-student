'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { PageErrorBoundary } from '@/components/error/error-boundary';
import { ThemeToggle } from '@/components/theme/theme-toggle';
// import {
//   AthleticCard,
//   FeatureCard,
//   StatusCard,
//   TechCard,
// } from '@/components/ui/athletic-card';
// import { AthleticIcons } from '@/components/ui/athletic-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useHealthCheck, useSports, useSchools } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const {
    user,
    // isLoading: authLoading,
    isAuthenticated,
    login,
    logout,
  } = useAuth();
  const {
    // data: healthCheck,
    // isLoading: healthLoading,
    // error: healthError,
  } = useHealthCheck();
  const {
    // data: sports,
    // isLoading: sportsLoading
  } = useSports();
  const {
    // data: schools,
    // isLoading: schoolsLoading
  } = useSchools();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
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

  // If user is authenticated, show dashboard instead of landing page
  if (isAuthenticated && user) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-6xl p-6'>
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary-100'>
                  <span className='text-xl text-primary-600'>🎯</span>
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Welcome back, {user.name}!
                  </h1>
                  <p className='text-gray-600'>
                    Ready to crush your goals today?
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <ThemeToggle />
                <Button variant='outline' onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard content will go here - similar to Ladder's app interface */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-lg bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold'>
                Today&apos;s Workout
              </h3>
              <div className='py-8 text-center'>
                <div className='mb-2 text-4xl'>🏃‍♂️</div>
                <p className='text-gray-600'>No workout scheduled</p>
                <Button className='mt-4'>Plan Workout</Button>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold'>Weekly Progress</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span>Workouts</span>
                  <span className='font-semibold'>0/5</span>
                </div>
                <Progress value={0} className='h-2' />
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold'>Quick Actions</h3>
              <div className='space-y-3'>
                <Button variant='outline' className='w-full justify-start'>
                  📝 Log Workout
                </Button>
                <Button variant='outline' className='w-full justify-start'>
                  📊 View Progress
                </Button>
                <Button variant='outline' className='w-full justify-start'>
                  🎯 Set Goals
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary>
      <div className='min-h-screen bg-white'>
        {/* Hero Section - Full Page */}
        <div className='relative h-screen overflow-hidden'>
          {/* Hero Background Image */}
          <div className='absolute inset-0 z-0'>
            <Image
              src='/images/pexels-victorfreitas-841130.jpg'
              alt='Athlete training'
              fill
              className='object-cover'
              priority
            />
            <div className='absolute inset-0 bg-black/50'></div>
          </div>

          {/* Hero Content */}
          <div className='relative z-10 flex h-full items-center justify-center'>
            <div className='mx-auto max-w-6xl px-6 text-center text-white'>
              <h1 className='mb-6 text-5xl font-bold lg:text-7xl'>
                SmartFyt Student Athlete
              </h1>
              <p className='mx-auto mb-8 max-w-3xl text-xl opacity-90 lg:text-2xl'>
                Your personalized student-athlete mental and physical
                performance improvement platform
              </p>

              {/* Muhammad Ali Quote */}
              <div className='mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
                <p className='mb-2 text-lg italic text-white/90'>
                  &quot;Champions aren&apos;t made in gyms. Champions are made
                  from something they have deep inside them - a desire, a dream,
                  a vision.&quot;
                </p>
                <p className='font-semibold text-white/70'>- Muhammad Ali</p>
              </div>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Button
                  size='lg'
                  className='bg-orange-500 px-8 py-4 text-lg font-semibold text-white hover:bg-orange-600'
                  onClick={login}
                >
                  Start Free Trial
                </Button>
                <Button
                  size='lg'
                  className='border-2 border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold text-orange-500 hover:bg-orange-500 hover:text-white'
                  onClick={login}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section - Like Ladder's "Results in less time" section */}
        <div className='bg-gray-50 py-20'>
          <div className='mx-auto max-w-6xl px-6'>
            <div className='mb-16 text-center'>
              <h2 className='mb-4 text-4xl font-bold text-gray-900'>
                Experience the SmartFyt Advantage
              </h2>
              <p className='mx-auto max-w-2xl text-xl text-gray-600'>
                Your secret weapon for success—personalized insights to help you
                win in school, sports, and life.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100'>
                  <span className='text-2xl'>🧠</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>
                  AI-Powered Insights
                </h3>
                <p className='text-gray-600'>
                  Our AI analyzes performance data to provide personalized
                  recommendations for improvement in both academics and
                  athletics.
                </p>
              </div>

              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100'>
                  <span className='text-2xl'>🏆</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>
                  Team & School Leaderboards
                </h3>
                <p className='text-gray-600'>
                  Foster healthy competition with gamified leaderboards that
                  track progress and celebrate achievements.
                </p>
              </div>

              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100'>
                  <span className='text-2xl'>📊</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>
                  Performance Analytics
                </h3>
                <p className='text-gray-600'>
                  Visualize trends in custom scores like Focus, Effort,
                  Readiness, and Motivation to monitor growth over time.
                </p>
              </div>

              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100'>
                  <span className='text-2xl'>📝</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>Daily Journaling</h3>
                <p className='text-gray-600'>
                  Track key metrics and reflect on progress with AI-guided
                  prompts that foster accountability and self-awareness.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App Preview Section */}
        <div className='bg-white py-20'>
          <div className='mx-auto max-w-6xl px-6'>
            <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
              <div>
                <h2 className='mb-6 text-4xl font-bold text-gray-900'>
                  More than just a fitness app, SmartFyt is a lifestyle
                </h2>
                <div className='space-y-6'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100'>
                      <span className='text-xl'>🎯</span>
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        Holistic Growth Tracking
                      </h3>
                      <p className='text-gray-600'>
                        Monitor both academic and athletic performance with
                        custom metrics designed for student-athlete success.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100'>
                      <span className='text-xl'>💬</span>
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        Coaching Tools
                      </h3>
                      <p className='text-gray-600'>
                        Define your Team Philosophy and add Team Notes, enabling
                        our AI to emulate your voice in feedback and journaling
                        prompts.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100'>
                      <span className='text-xl'>⚡</span>
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        Mobile-First Experience
                      </h3>
                      <p className='text-gray-600'>
                        Progressive Web App that works offline, installs on your
                        phone, and provides a native mobile experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='relative'>
                <div className='rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white'>
                  <div className='text-center'>
                    <div className='mb-4 text-6xl'>📱</div>
                    <h3 className='mb-2 text-2xl font-bold'>
                      SmartFyt Student Athlete
                    </h3>
                    <p className='mb-6 text-primary-100'>
                      Your performance tracking companion
                    </p>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between rounded-lg bg-white/10 p-3'>
                        <span>Today&apos;s Workout</span>
                        <Badge
                          variant='secondary'
                          className='bg-white text-primary-600'
                        >
                          Ready
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between rounded-lg bg-white/10 p-3'>
                        <span>Weekly Goal</span>
                        <span className='font-semibold'>75%</span>
                      </div>
                      <div className='flex items-center justify-between rounded-lg bg-white/10 p-3'>
                        <span>Team Rank</span>
                        <span className='font-semibold'>#3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-primary-600 py-20'>
          <div className='mx-auto max-w-4xl px-6 text-center'>
            <h2 className='mb-6 text-4xl font-bold text-white'>
              Ready to transform your athletic performance?
            </h2>
            <p className='mb-8 text-xl text-primary-100'>
              Join thousands of student-athletes who are already crushing their
              goals.
            </p>
            <Button
              size='lg'
              className='bg-white px-8 py-4 text-lg font-semibold text-primary-600 hover:bg-gray-100'
              onClick={login}
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>

        {/* PWA Install Prompt */}
        {showInstallPrompt && (
          <div className='fixed bottom-0 left-0 right-0 z-50 bg-gray-900 p-4 text-white'>
            <div className='mx-auto flex max-w-6xl items-center justify-between'>
              <div>
                <h3 className='font-semibold'>
                  Install SmartFyt Student Athlete
                </h3>
                <p className='text-sm text-gray-300'>
                  Get the full mobile app experience
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowInstallPrompt(false)}
                  className='text-gray-300'
                >
                  Later
                </Button>
                <Button size='sm' onClick={handleInstallClick}>
                  Install
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageErrorBoundary>
  );
}
