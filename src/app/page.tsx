'use client';

import { useHealthCheck, useSports, useSchools } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AthleticCard, 
  FeatureCard, 
  StatusCard, 
  TechCard 
} from '@/components/ui/athletic-card';
import { AthleticIcons } from '@/components/ui/athletic-icons';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import Image from 'next/image';

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

  // If user is authenticated, show dashboard instead of landing page
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                  <p className="text-gray-600">Ready to crush your goals today?</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          
          {/* Dashboard content will go here - similar to Ladder's app interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Workout</h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏃‍♂️</div>
                <p className="text-gray-600">No workout scheduled</p>
                <Button className="mt-4">Plan Workout</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Workouts</span>
                  <span className="font-semibold">0/5</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📝 Log Workout
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📊 View Progress
                </Button>
                <Button variant="outline" className="w-full justify-start">
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
      <div className="min-h-screen bg-white">
      {/* Hero Section - Full Page */}
      <div className="relative h-screen overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pexels-victorfreitas-841130.jpg"
            alt="Athlete training"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-6 text-center text-white">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              SmartFyt Student Athlete
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your personalized student-athlete mental and physical performance improvement platform 
            </p>
            
            {/* Muhammad Ali Quote */}
            <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-lg italic text-white/90 mb-2">
                "Champions aren't made in gyms. Champions are made from something they have deep inside them - a desire, a dream, a vision."
              </p>
              <p className="text-white/70 font-semibold">- Muhammad Ali</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-orange-500 text-white hover:bg-orange-600 font-semibold text-lg px-8 py-4"
                onClick={login}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold text-lg px-8 py-4"
                onClick={login}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - Like Ladder's "Results in less time" section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience the SmartFyt Advantage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your secret weapon for success—personalized insights to help you win in school, sports, and life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Our AI analyzes performance data to provide personalized recommendations for improvement in both academics and athletics.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Team & School Leaderboards</h3>
              <p className="text-gray-600">Foster healthy competition with gamified leaderboards that track progress and celebrate achievements.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
              <p className="text-gray-600">Visualize trends in custom scores like Focus, Effort, Readiness, and Motivation to monitor growth over time.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily Journaling</h3>
              <p className="text-gray-600">Track key metrics and reflect on progress with AI-guided prompts that foster accountability and self-awareness.</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Preview Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                More than just a fitness app, SmartFyt is a lifestyle
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Holistic Growth Tracking</h3>
                    <p className="text-gray-600">Monitor both academic and athletic performance with custom metrics designed for student-athlete success.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Coaching Tools</h3>
                    <p className="text-gray-600">Define your Team Philosophy and add Team Notes, enabling our AI to emulate your voice in feedback and journaling prompts.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Mobile-First Experience</h3>
                    <p className="text-gray-600">Progressive Web App that works offline, installs on your phone, and provides a native mobile experience.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold mb-2">SmartFyt Student Athlete</h3>
                  <p className="text-primary-100 mb-6">Your performance tracking companion</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <span>Today's Workout</span>
                      <Badge variant="secondary" className="bg-white text-primary-600">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <span>Weekly Goal</span>
                      <span className="font-semibold">75%</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <span>Team Rank</span>
                      <span className="font-semibold">#3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your athletic performance?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of student-athletes who are already crushing their goals.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4"
            onClick={login}
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <h3 className="font-semibold">Install SmartFyt Student Athlete</h3>
              <p className="text-gray-300 text-sm">Get the full mobile app experience</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallPrompt(false)}
                className="text-gray-300"
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={handleInstallClick}
              >
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

