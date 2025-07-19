import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/lib/react-query';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SmartFyt Student',
  description: 'Student-athlete performance tracking and wellness dashboard',
  keywords: ['student-athlete', 'performance', 'wellness', 'tracking', 'health'],
  authors: [{ name: 'SmartFyt Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <ReactQueryProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
