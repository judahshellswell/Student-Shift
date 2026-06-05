import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Firebase is client-only — prevent static prerendering of all routes
export const dynamic = 'force-dynamic';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthInitializer from '@/components/providers/AuthInitializer';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StudentShift — Find flexible work around your studies',
  description:
    'StudentShift connects students aged 16–24 to part-time and shift work in Jersey, Guernsey, Isle of Man, and the UK.',
  openGraph: {
    title: 'StudentShift',
    description: 'Find flexible work around your studies',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <QueryProvider>
          <ToastProvider>
            <AuthInitializer />
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
