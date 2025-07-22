'use client';

import {
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { authLogger } from '@/lib/logger';

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const _router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  useEffect(() => {
    authLogger.debug('🔓 Login page loaded', { mode });
  }, [mode]);

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    authLogger.debug('🌐 Social login button clicked', { provider });
    authLogger.debug('🌐 About to trigger Kinde LoginLink redirect', {
      provider,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString(),
    });
  };

  const handleEmailLogin = () => {
    authLogger.debug('📧 Email login button clicked', { mode, email });
    authLogger.debug('📧 About to trigger Kinde LoginLink redirect', {
      mode,
      email,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50 p-4 dark:from-gray-900 dark:to-gray-800'>
      {/* Back to Home Button */}
      <Link
        href='/'
        className='absolute left-4 top-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
      >
        <ArrowLeft className='h-5 w-5' />
        <span>Back to Home</span>
      </Link>

      {/* Main Card */}
      <div className='w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800'>
        {/* Header with Logo */}
        <div className='mb-8 text-center'>
          <div className='mb-6 flex flex-col items-center justify-center'>
            <Image
              src='/logos/smartfyt-brain.png'
              alt='SmartFyt Brain'
              width={64}
              height={64}
              className='mb-3 h-16 w-auto'
            />
            <div className='text-center'>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                SmartFyt
              </h1>
            </div>
          </div>
          <h2 className='mb-2 text-2xl font-semibold text-gray-900 dark:text-white'>
            {mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            {mode === 'register'
              ? 'Join SmartFyt to start your performance journey'
              : 'Sign in to continue your performance journey'}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className='mb-6 space-y-3'>
          <LoginLink
            authUrlParams={{
              connection_id: 'google',
              scope: 'openid profile email offline_access',
            }}
            onClick={() => handleSocialLogin('google')}
          >
            <Button variant='outline' className='h-12 w-full'>
              <svg className='mr-3 h-5 w-5' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='currentColor'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='currentColor'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='currentColor'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              Continue with Google
            </Button>
          </LoginLink>

          <LoginLink
            authUrlParams={{
              connection_id: 'microsoft',
              scope: 'openid profile email offline_access',
            }}
            onClick={() => handleSocialLogin('microsoft')}
          >
            <Button variant='outline' className='h-12 w-full'>
              <svg className='mr-3 h-5 w-5' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M11.5 2.75h-8a.75.75 0 0 0-.75.75v8c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75zm-8 1.5h6.5v6.5h-6.5v-6.5zm8 1.5h8a.75.75 0 0 1 .75.75v8a.75.75 0 0 1-.75.75h-8a.75.75 0 0 1-.75-.75v-8a.75.75 0 0 1 .75-.75zm8 1.5h-6.5v6.5h6.5v-6.5z'
                />
              </svg>
              Continue with Microsoft
            </Button>
          </LoginLink>
        </div>

        {/* Divider */}
        <div className='mb-6 flex items-center'>
          <div className='flex-1 border-t border-gray-300 dark:border-gray-600' />
          <span className='mx-4 text-sm text-gray-500 dark:text-gray-400'>
            or
          </span>
          <div className='flex-1 border-t border-gray-300 dark:border-gray-600' />
        </div>

        {/* Email/Password Form */}
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Email
            </label>
            <div className='relative mt-1'>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400 dark:focus:ring-primary-400'
                placeholder='Enter your email'
                required
              />
              <Mail className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Password
            </label>
            <div className='relative mt-1'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400 dark:focus:ring-primary-400'
                placeholder='Enter your password'
                required
              />
              <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>
          </div>

          {/* Login/Register Button */}
          {mode === 'register' ? (
            <RegisterLink
              authUrlParams={{
                email,
                password,
                scope: 'openid profile email offline_access',
              }}
              onClick={handleEmailLogin}
            >
              <Button className='h-12 w-full bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'>
                Create Account
              </Button>
            </RegisterLink>
          ) : (
            <LoginLink
              authUrlParams={{
                email,
                password,
                scope: 'openid profile email offline_access',
              }}
              onClick={handleEmailLogin}
            >
              <Button className='h-12 w-full bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'>
                Sign In
              </Button>
            </LoginLink>
          )}
        </div>

        {/* Footer Links */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {mode === 'register'
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <Link
              href={mode === 'register' ? '/login' : '/login?mode=register'}
              className='font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300'
            >
              {mode === 'register' ? 'Sign in' : 'Create account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50 p-4 dark:from-gray-900 dark:to-gray-800'>
          <div className='w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800'>
            <div className='animate-pulse'>
              <div className='mb-4 h-8 rounded bg-gray-200'></div>
              <div className='mb-2 h-4 rounded bg-gray-200'></div>
              <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
