'use client';

import React from 'react';

export function HeroVisual() {
  return (
    <div className='relative mb-8 h-64 w-full overflow-hidden rounded-2xl md:h-80'>
      {/* Animated Background */}
      <div className='absolute inset-0 animate-pulse-glow bg-gradient-primary'></div>

      {/* Floating Elements */}
      <div className='absolute inset-0'>
        {/* Animated Icons */}
        <div
          className='absolute left-4 top-4 animate-bounce text-4xl'
          style={{ animationDelay: '0s' }}
        >
          🏃‍♂️
        </div>
        <div
          className='absolute right-8 top-8 animate-bounce text-3xl'
          style={{ animationDelay: '0.5s' }}
        >
          ⚡
        </div>
        <div
          className='absolute bottom-8 left-8 animate-bounce text-3xl'
          style={{ animationDelay: '1s' }}
        >
          🎯
        </div>
        <div
          className='absolute bottom-4 right-4 animate-bounce text-4xl'
          style={{ animationDelay: '1.5s' }}
        >
          🏆
        </div>

        {/* Progress Rings */}
        <div className='absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent'></div>
          </div>
        </div>

        <div className='absolute right-1/4 top-1/2 -translate-y-1/2 translate-x-1/2 transform'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30'>
            <div
              className='h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent'
              style={{ animationDirection: 'reverse' }}
            ></div>
          </div>
        </div>

        {/* Data Points */}
        <div className='absolute left-1/2 top-1/3 -translate-x-1/2 transform'>
          <div className='animate-fade-in rounded-lg bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm'>
            +25% Performance
          </div>
        </div>

        <div className='absolute bottom-1/3 right-1/2 translate-x-1/2 transform'>
          <div
            className='animate-fade-in rounded-lg bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm'
            style={{ animationDelay: '0.3s' }}
          >
            🏅 3 Achievements
          </div>
        </div>
      </div>

      {/* Overlay Gradient */}
      <div className='absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent'></div>
    </div>
  );
}

export function AnimatedStats() {
  return (
    <div className='mb-8 grid grid-cols-2 gap-4 md:grid-cols-4'>
      <div className='animate-fade-in rounded-xl bg-gradient-success p-4 text-center text-white'>
        <div className='text-2xl font-bold'>2.5K+</div>
        <div className='text-sm opacity-90'>Active Athletes</div>
      </div>
      <div
        className='animate-fade-in rounded-xl bg-gradient-warning p-4 text-center text-white'
        style={{ animationDelay: '0.1s' }}
      >
        <div className='text-2xl font-bold'>95%</div>
        <div className='text-sm opacity-90'>Success Rate</div>
      </div>
      <div
        className='animate-fade-in rounded-xl bg-gradient-danger p-4 text-center text-white'
        style={{ animationDelay: '0.2s' }}
      >
        <div className='text-2xl font-bold'>24/7</div>
        <div className='text-sm opacity-90'>Support</div>
      </div>
      <div
        className='animate-fade-in rounded-xl bg-gradient-primary p-4 text-center text-white'
        style={{ animationDelay: '0.3s' }}
      >
        <div className='text-2xl font-bold'>🏆</div>
        <div className='text-sm opacity-90'>Champions</div>
      </div>
    </div>
  );
}

export function MotivationalQuote() {
  return (
    <div className='mb-8 rounded-2xl bg-gradient-dark p-6 text-center text-white'>
      <div className='mb-2 text-2xl'>💪</div>
      <blockquote className='mb-2 text-lg font-semibold md:text-xl'>
        &quot;Champions aren&apos;t made in gyms. Champions are made from
        something they have deep inside them - a desire, a dream, a
        vision.&quot;
      </blockquote>
      <cite className='text-sm opacity-80'>- Muhammad Ali</cite>
    </div>
  );
}
