import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sanad | Verified-Scholars Social and Learning Platform',
  description:
    'The authentic verified-scholars-only platform for classical Islamic sciences, isnad chains, masterclasses, and peer-reviewed discourse.',
  keywords: [
    'Islamic scholarship',
    'verified scholars',
    'Hadith',
    'Fiqh',
    'Isnad',
    'Usul al-Fiqh',
    'Halaqah',
    'Sanad',
  ],
  authors: [{ name: 'Mohammed Khizer Shaikh', url: 'https://mohammedkhizershaikh.netlify.app' }],
  creator: 'Mohammed Khizer Shaikh',
  metadataBase: new URL('https://sanad.app'),
  alternates: {
    canonical: 'https://sanad.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Sanad | Authentic Verified-Scholars Platform',
    description:
      'Verified-scholars-only social and learning platform preserving authentic isnad tradition.',
    url: 'https://sanad.app',
    siteName: 'Sanad',
    images: [
      {
        url: '/assets/splash-mark.png',
        width: 512,
        height: 512,
        alt: 'Sanad Platform Brand Mark',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  other: {
    'geo.region': 'GLOBAL',
    'geo.placename': 'Global Islamic Scholarship Network',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
