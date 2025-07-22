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
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-secondary-600'></div>
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
              <div className='flex gap-2 sm:gap-4'>
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
                    className='w-full border-2 border-primary-500 bg-transparent px-3 py-2 text-sm text-primary-500 transition-colors hover:bg-primary-500 hover:text-white sm:w-auto sm:px-4'
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
                    className='bg-primary-500 px-3 py-2 text-sm text-white transition-colors hover:bg-primary-600 sm:px-4'
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
              className='bg-secondary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-secondary-700 transition-colors flex items-center gap-2'
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
              sizes='100vw'
            />
            <div className='absolute inset-0 bg-black/50'></div>
          </div>

          {/* Hero Content */}
          <div className='relative z-10 flex h-full items-center justify-center'>
            <div className='mx-auto max-w-6xl px-4 text-center text-white sm:px-6'>
              <h1 className='mb-4 text-3xl font-bold leading-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-7xl'>
                SmartFyt Student Athlete
              </h1>
              <p className='mx-auto mb-6 max-w-3xl text-lg leading-relaxed opacity-90 sm:mb-8 sm:text-xl lg:text-2xl'>
                Your personalized student-athlete mental and physical
                performance improvement platform
              </p>

              {/* Muhammad Ali Quote */}
              <div className='mb-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:mb-8 sm:p-6'>
                <p className='mb-2 text-base italic leading-relaxed text-white/90 sm:text-lg'>
                  &quot;Champions aren&apos;t made in gyms. Champions are made
                  from something they have deep inside them - a desire, a dream,
                  a vision.&quot;
                </p>
                <p className='font-semibold text-white/70'>- Muhammad Ali</p>
              </div>
              <div className='flex flex-col justify-center gap-3 sm:flex-row sm:gap-4'>
                <RegisterLink
                  authUrlParams={{
                    scope: 'openid profile email offline_access',
                    post_login_redirect_url: '/api/auth/creation',
                  }}
                >
                  <Button
                    size='lg'
                    className='w-full bg-primary-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-600 sm:w-auto sm:px-8 sm:py-4 sm:text-lg'
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
                    className='w-full border-2 border-primary-500 bg-transparent px-6 py-3 text-base font-semibold text-primary-500 transition-colors hover:bg-primary-500 hover:text-white sm:w-auto sm:px-8 sm:py-4 sm:text-lg'
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
        <div className='bg-gray-50 py-12 sm:py-16 lg:py-20'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <div className='mb-12 text-center sm:mb-16'>
              <h2 className='mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl'>
                Experience the SmartFyt Advantage
              </h2>
              <p className='mx-auto max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl'>
                Your secret weapon for success—personalized insights to help you
                win in school, sports, and life.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4'>
              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 sm:h-16 sm:w-16'>
                  <span className='text-xl sm:text-2xl'>🧠</span>
                </div>
                <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                  AI-Powered Insights
                </h3>
                <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                  Our AI analyzes performance data to provide personalized
                  recommendations for improvement in both academics and
                  athletics.
                </p>
              </div>

              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 sm:h-16 sm:w-16'>
                  <span className='text-xl sm:text-2xl'>🏆</span>
                </div>
                <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                  Team & School Leaderboards
                </h3>
                <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                  Foster healthy competition with gamified leaderboards that
                  track progress and celebrate achievements.
                </p>
              </div>

              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 sm:h-16 sm:w-16'>
                  <span className='text-xl sm:text-2xl'>📊</span>
                </div>
                <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                  Performance Analytics
                </h3>
                <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                  Visualize trends in custom scores like Focus, Effort,
                  Readiness, and Motivation to monitor growth over time.
                </p>
              </div>

              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 sm:h-16 sm:w-16'>
                  <span className='text-xl sm:text-2xl'>📝</span>
                </div>
                <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                  Daily Journaling
                </h3>
                <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                  Track key metrics and reflect on progress with AI-guided
                  prompts that foster accountability and self-awareness.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App Preview Section */}
        <div className='bg-white py-12 sm:py-16 lg:py-20'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <div className='grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2'>
              <div>
                <h2 className='mb-6 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl'>
                  More than just a fitness app, SmartFyt is a lifestyle
                </h2>
                <div className='space-y-6'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-12 sm:w-12'>
                      <span className='text-lg sm:text-xl'>🎯</span>
                    </div>
                    <div>
                      <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                        Holistic Growth Tracking
                      </h3>
                      <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                        Monitor both academic and athletic performance with
                        custom metrics designed for student-athlete success.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-12 sm:w-12'>
                      <span className='text-lg sm:text-xl'>💬</span>
                    </div>
                    <div>
                      <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                        Coaching Tools
                      </h3>
                      <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                        Define your Team Philosophy and add Team Notes, enabling
                        our AI to emulate your voice in feedback and journaling
                        prompts.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-12 sm:w-12'>
                      <span className='text-lg sm:text-xl'>⚡</span>
                    </div>
                    <div>
                      <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                        Mobile-First Experience
                      </h3>
                      <p className='text-sm leading-relaxed text-gray-600 sm:text-base'>
                        Progressive Web App that works offline, installs on your
                        phone, and provides a native mobile experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='relative'>
                <div className='rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white sm:rounded-3xl sm:p-8'>
                  <div className='text-center'>
                    <div className='mb-4 text-4xl sm:text-6xl'>📱</div>
                    <h3 className='mb-2 text-xl font-bold sm:text-2xl'>
                      SmartFyt Student Athlete
                    </h3>
                    <p className='mb-6 text-sm text-primary-100 sm:text-base'>
                      Your performance tracking companion
                    </p>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between rounded-lg bg-white/10 p-3'>
                        <span className='text-sm sm:text-base'>
                          Today&apos;s Workout
                        </span>
                        <Badge
                          variant='secondary'
                          className='bg-white text-xs text-primary-600 sm:text-sm'
                        >
                          Ready
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between rounded-lg bg-white/10 p-3'>
                        <span className='text-sm sm:text-base'>
                          Weekly Goal
                        </span>
                        <span className='text-sm font-semibold sm:text-base'>
                          75%
                        </span>
                      </div>
                      <div className='flex items-center justify-between rounded-lg bg-white/10 p-3'>
                        <span className='text-sm sm:text-base'>Team Rank</span>
                        <span className='text-sm font-semibold sm:text-base'>
                          #3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-primary-600 py-12 sm:py-16 lg:py-20'>
          <div className='mx-auto max-w-4xl px-4 text-center sm:px-6'>
            <h2 className='mb-4 text-2xl font-bold leading-tight text-white sm:mb-6 sm:text-3xl lg:text-4xl'>
              Ready to transform your athletic performance?
            </h2>
            <p className='mb-6 text-base leading-relaxed text-primary-100 sm:mb-8 sm:text-lg lg:text-xl'>
              Join thousands of student-athletes who are already crushing their
              goals.
            </p>
            <Button
              size='lg'
              className='w-full bg-white px-6 py-3 text-base font-semibold text-primary-600 transition-colors hover:bg-gray-100 sm:w-auto sm:px-8 sm:py-4 sm:text-lg'
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
        <div className='bg-black py-6 sm:py-8'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <div className='flex flex-col items-center justify-between gap-4 text-center text-white sm:flex-row'>
              <div className='flex items-center gap-3'>
                <Image
                  src='/logos/smartfyt-brain.png'
                  alt='SmartFyt Brain'
                  width={24}
                  height={24}
                  className='h-6 w-auto'
                />
                <span className='text-xs font-medium sm:text-sm'>
                  © 2024 SmartFyt. All rights reserved.
                </span>
              </div>
              <div className='flex gap-4 text-xs text-gray-300 sm:gap-6 sm:text-sm'>
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
