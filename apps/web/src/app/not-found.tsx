import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="section" style={{ minHeight: '60vh', textAlign: 'center', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="hero-pill" style={{ margin: '0 auto 16px' }}>404 Not Found</div>
          <h1 className="hero-title" style={{ fontSize: '36px', marginBottom: '16px' }}>Page Not Found</h1>
          <p className="hero-subtitle" style={{ marginBottom: '24px' }}>
            The requested page does not exist or has been relocated within the Sanad platform.
          </p>
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

