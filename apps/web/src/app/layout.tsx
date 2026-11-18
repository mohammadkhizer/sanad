import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Sanad - The Classical Islamic Scholarship & Knowledge Platform',
  description:
    'Dedicated social and educational platform reserved exclusively for verified classical Islamic scholars and students of sacred knowledge. Rigorous Isnad verification and peer review.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between selection:bg-sanad-gold-subtle selection:text-sanad-emerald">
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
