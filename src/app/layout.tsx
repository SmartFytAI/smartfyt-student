import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { GlobalLoadingIndicator } from '@/components/ui/global-loading-indicator';
import { ReactQueryProvider } from '@/lib/react-query';

import './globals.css';

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

export const metadata: Metadata = {
  title: {
    default: 'SmartFyt Student Athlete',
    template: '%s | SmartFyt Student Athlete',
  },
  description:
    'Track your athletic performance, health metrics, and achieve your goals on mobile.',
  keywords: [
    'student athlete',
    'performance tracking',
    'health metrics',
    'mobile app',
    'fitness',
    'sports',
  ],
  authors: [{ name: 'SmartFyt Team' }],
  creator: 'SmartFyt',
  publisher: 'SmartFyt',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // Format detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // PWA Metadata
  applicationName: 'SmartFyt Student Athlete',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartFyt Student Athlete',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    siteName: 'SmartFyt Student Athlete',
    title: 'SmartFyt Student Athlete - Mobile Performance Tracking',
    description:
      'Track your athletic performance, health metrics, and achieve your goals on mobile.',
    images: [
      {
        url: '/logos/smartfyt-brain.png',
        width: 512,
        height: 512,
        alt: 'SmartFyt Student App',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'SmartFyt Student Athlete - Mobile Performance Tracking',
    description:
      'Track your athletic performance, health metrics, and achieve your goals on mobile.',
    images: ['/logos/smartfyt-brain.png'],
  },

  // Icons for PWA
  icons: {
    icon: [
      { url: '/logos/smartfyt-brain.png', sizes: '192x192', type: 'image/png' },
      { url: '/logos/smartfyt-brain.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logos/smartfyt-brain.png', sizes: '180x180', type: 'image/png' },
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
    <html lang='en' className='h-full' suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta
          name='apple-mobile-web-app-title'
          content='SmartFyt Student Athlete'
        />

        {/* Preconnect to API */}
        <link
          rel='preconnect'
          href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full text-gray-900 antialiased dark:text-gray-100`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <ThemeProvider>
              <GlobalLoadingIndicator />
              <div className='safe-area-inset min-h-screen'>{children}</div>
            </ThemeProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
