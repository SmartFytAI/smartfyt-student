"use client"

import React from 'react'

export function HeroVisual() {
  return (
    <div className="relative w-full h-64 md:h-80 mb-8 overflow-hidden rounded-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-primary animate-pulse-glow"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        {/* Animated Icons */}
        <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
          🏃‍♂️
        </div>
        <div className="absolute top-8 right-8 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>
          ⚡
        </div>
        <div className="absolute bottom-8 left-8 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>
          🎯
        </div>
        <div className="absolute bottom-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>
          🏆
        </div>
        
        {/* Progress Rings */}
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 border-4 border-white/30 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-20 h-20 border-4 border-white/30 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
        </div>
        
        {/* Data Points */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-semibold animate-fade-in">
            +25% Performance
          </div>
        </div>
        
        <div className="absolute bottom-1/3 right-1/2 transform translate-x-1/2">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-semibold animate-fade-in" style={{ animationDelay: '0.3s' }}>
            🏅 3 Achievements
          </div>
        </div>
      </div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>
    </div>
  )
}

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-success rounded-xl p-4 text-white text-center animate-fade-in">
        <div className="text-2xl font-bold">2.5K+</div>
        <div className="text-sm opacity-90">Active Athletes</div>
      </div>
      <div className="bg-gradient-warning rounded-xl p-4 text-white text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="text-2xl font-bold">95%</div>
        <div className="text-sm opacity-90">Success Rate</div>
      </div>
      <div className="bg-gradient-danger rounded-xl p-4 text-white text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="text-2xl font-bold">24/7</div>
        <div className="text-sm opacity-90">Support</div>
      </div>
      <div className="bg-gradient-primary rounded-xl p-4 text-white text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="text-2xl font-bold">🏆</div>
        <div className="text-sm opacity-90">Champions</div>
      </div>
    </div>
  )
}

export function MotivationalQuote() {
  return (
    <div className="bg-gradient-dark rounded-2xl p-6 mb-8 text-white text-center">
      <div className="text-2xl mb-2">💪</div>
      <blockquote className="text-lg md:text-xl font-semibold mb-2">
        "Champions aren't made in gyms. Champions are made from something they have deep inside them - a desire, a dream, a vision."
      </blockquote>
      <cite className="text-sm opacity-80">- Muhammad Ali</cite>
    </div>
  )
} 