'use client';

import {
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { authLogger } from '@/lib/logger';

export default function LoginPage() {
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
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4'>
      {/* Back to Home Button */}
      <Link
        href='/'
        className='absolute left-4 top-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-800 dark:hover:text-gray-200'
      >
        <ArrowLeft className='h-5 w-5' />
        <span>Back to Home</span>
      </Link>

      {/* Main Card */}
      <div className='w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl'>
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
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>SmartFyt</h1>
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
                  d='M11.5 2.75h-8v8h8v-8zM11.5 13.25h-8v8h8v-8zM22.5 2.75h-8v8h8v-8zM22.5 13.25h-8v8h8v-8z'
                />
              </svg>
              Continue with Microsoft
            </Button>
          </LoginLink>
        </div>

        {/* Divider */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400'>
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Email
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
              <input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-3 pl-10 pr-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Password
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-3 pl-10 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
              <button
                type='button'
                className='absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                onClick={() => setShowPassword(!showPassword)}
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
          {mode === 'login' ? (
            <LoginLink
              authUrlParams={{
                scope: 'openid profile email offline_access',
              }}
              onClick={handleEmailLogin}
            >
              <Button className='h-12 w-full text-lg'>Sign In</Button>
            </LoginLink>
          ) : (
            <RegisterLink
              authUrlParams={{
                scope: 'openid profile email offline_access',
              }}
              onClick={handleEmailLogin}
            >
              <Button className='h-12 w-full text-lg'>Create Account</Button>
            </RegisterLink>
          )}
        </form>

        {/* Footer */}
        <div className='mt-8 text-center'>
          {mode === 'login' ? (
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Don&apos;t have an account?{' '}
              <Link
                href='/login?mode=register'
                className='font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Already have an account?{' '}
              <Link
                href='/login?mode=login'
                className='font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
