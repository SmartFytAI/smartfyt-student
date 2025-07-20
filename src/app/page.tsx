'use client';

import {
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import Image from 'next/image';
import _Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageErrorBoundary } from '@/components/error/error-boundary';
// import { usePWAInstall } from '@/components/pwa-installer';
// import {
//   AthleticCard,
//   FeatureCard,
//   StatusCard,
//   TechCard,
// } from '@/components/ui/athletic-card';
// import { AthleticIcons } from '@/components/ui/athletic-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

export default function HomePage() {
  const {
    user,
    // isLoading: authLoading,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  // const { showInstallButton, handleInstallClick } = usePWAInstall();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    logger.debug('Homepage auth effect:', {
      authLoading,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
    });

    if (!authLoading && isAuthenticated && user) {
      logger.debug('Redirecting authenticated user to dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Handle scroll for header fade
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading while checking auth status
  if (authLoading) {
    logger.debug('Homepage showing loading state');
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (will redirect)
  if (isAuthenticated && user) {
    logger.debug('Homepage not rendering - user is authenticated');
    return null;
  }

  return (
    <PageErrorBoundary>
      <div className='min-h-screen bg-white dark:bg-gray-900'>
        {/* Scroll-based Header with Logo */}
        <div
          className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
            isScrolled
              ? 'bg-black/50 shadow-lg backdrop-blur-sm'
              : 'bg-transparent'
          }`}
        >
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center gap-3'>
              <Image
                src='/logos/smartfyt-brain.png'
                alt='SmartFyt Brain'
                width={48}
                height={48}
                className='h-12 w-auto'
              />
              {isScrolled && (
                <span className='text-xl font-bold text-white'>SmartFyt</span>
              )}
            </div>
            {isScrolled && (
              <div className='flex gap-4'>
                <LoginLink
                  authUrlParams={{
                    scope: 'openid profile email offline_access',
                    post_login_redirect_url: '/api/auth/creation',
                  }}
                  onClick={() => {
                    logger.debug('🔑 Header Sign In button clicked');
                  }}
                >
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white sm:w-auto'
                >
                    Sign In
                  </Button>
                </LoginLink>
                <RegisterLink
                  authUrlParams={{
                    scope: 'openid profile email offline_access',
                    post_login_redirect_url: '/api/auth/creation',
                  }}
                  onClick={() => {
                    logger.debug('🚀 Header Get Started button clicked');
                  }}
                >
                  <Button
                    size='sm'
                    className='bg-orange-500 text-white hover:bg-orange-600'
                  >
                    Get Started
                  </Button>
                </RegisterLink>
              </div>
            )}
          </div>
        </div>

        {/* Add to Home Screen Button */}
        {/* {showInstallButton && (
          <div className='fixed bottom-4 right-4 z-50'>
            <button
              onClick={handleInstallClick}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
            >
              <span>📱</span>
              <span>Add to Home Screen</span>
            </button>
          </div>
        )} */}

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
                <RegisterLink
                  authUrlParams={{
                    scope: 'openid profile email offline_access',
                    post_login_redirect_url: '/api/auth/creation',
                  }}
                >
                  <Button
                    size='lg'
                    className='w-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white hover:bg-orange-600 sm:w-auto'
                    onClick={() => {
                      logger.debug('🚀 Hero Get Started button clicked');
                    }}
                  >
                    Get Started
                  </Button>
                </RegisterLink>
                <LoginLink
                  authUrlParams={{
                    scope: 'openid profile email offline_access',
                    post_login_redirect_url: '/api/auth/creation',
                  }}
                >
                  <Button
                    size='lg'
                    className='w-full border-2 border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold text-orange-500 hover:bg-orange-500 hover:text-white sm:w-auto'
                    onClick={() => {
                      logger.debug('🔑 Hero Sign In button clicked');
                    }}
                  >
                    Sign In
                  </Button>
                </LoginLink>
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
              onClick={() => {
                logger.debug('🚀 CTA Start Free Trial button clicked');
                router.push('/login?mode=register');
              }}
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className='bg-black py-8'>
          <div className='mx-auto max-w-6xl px-6'>
            <div className='flex flex-col items-center justify-between gap-4 text-center text-white sm:flex-row'>
              <div className='flex items-center gap-3'>
                <Image
                  src='/logos/smartfyt-brain.png'
                  alt='SmartFyt Brain'
                  width={24}
                  height={24}
                  className='h-6 w-auto'
                />
                <span className='text-sm font-medium'>
                  © 2024 SmartFyt. All rights reserved.
                </span>
              </div>
              <div className='flex gap-6 text-sm text-gray-300'>
                <button className='transition-colors hover:text-white'>
                  Privacy Policy
                </button>
                <button className='transition-colors hover:text-white'>
                  Terms of Service
                </button>
                <button className='transition-colors hover:text-white'>
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
