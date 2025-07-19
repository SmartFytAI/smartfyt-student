import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/lib/react-query';
import { PWAInstaller } from '@/components/pwa-installer';
import { AuthProvider } from '@/components/auth/auth-provider';
import { HeroUIClientProvider } from '@/components/providers/heroui-provider';
import { AppErrorBoundary } from '@/components/error/error-boundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'SmartFyt Student',
    template: '%s | SmartFyt Student',
  },
  description: 'Student-athlete performance tracking and wellness dashboard - now on mobile!',
  keywords: [
    'student-athlete', 
    'performance', 
    'wellness', 
    'tracking', 
    'health',
    'mobile app',
    'fitness',
    'sports'
  ],
  authors: [{ name: 'SmartFyt Team' }],
  creator: 'SmartFyt Team',
  publisher: 'SmartFyt',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // PWA Metadata
  applicationName: 'SmartFyt Student',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartFyt Student',
  },
  
  // Open Graph
  openGraph: {
    type: 'website',
    siteName: 'SmartFyt Student',
    title: 'SmartFyt Student - Mobile Performance Tracking',
    description: 'Track your athletic performance, health metrics, and achieve your goals on mobile.',
          images: [
        {
          url: '/icon-512x512.svg',
          width: 512,
          height: 512,
          alt: 'SmartFyt Student App',
        },
      ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'SmartFyt Student - Mobile Performance Tracking',
    description: 'Track your athletic performance, health metrics, and achieve your goals on mobile.',
    images: ['/icon-512x512.svg'],
  },
  
  // Icons for PWA
  icons: {
    icon: [
      { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-180x180.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000',
      },
    ],
  },
  
  // Web App Manifest
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SmartFyt Student" />
        
        {/* Preconnect to API */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900 dark:text-gray-100 h-full`}
      >
        <AppErrorBoundary>
          <AuthProvider>
            <ReactQueryProvider>
              <HeroUIClientProvider>
                <PWAInstaller />
                <div className="min-h-screen safe-area-inset">
                  {children}
                </div>
              </HeroUIClientProvider>
            </ReactQueryProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
