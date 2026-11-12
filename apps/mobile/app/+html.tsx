import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const SCHEMA_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://sanad.app/#organization',
      name: 'Sanad',
      url: 'https://sanad.app',
      logo: 'https://sanad.app/assets/brand/icon.png',
      description: 'The premier verified-scholars-only platform for classical Islamic sciences, isnad methodology, authentic masterclasses, and traditional curriculum.',
      founder: {
        '@type': 'Person',
        name: 'Mohammed Khizer Shaikh',
        jobTitle: 'Lead Software Architect & Senior Engineer',
        url: 'https://mohammedkhizershaikh.netlify.app',
        sameAs: ['https://www.linkedin.com/in/mohammedkhizershaikh'],
      },
      knowsAbout: [
        'Hadith Sciences',
        'Usul al-Fiqh',
        'Islamic Jurisprudence',
        'Isnad Methodology',
        'Classical Arabic',
        'Manuscript Verification',
      ],
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Global',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://sanad.app/#website',
      url: 'https://sanad.app',
      name: 'Sanad - Authentic Scholarship Platform',
      publisher: {
        '@id': 'https://sanad.app/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://sanad.app/explore?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

export default function RootHtml({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* Primary SEO Meta Tags */}
        <title>Sanad | Verified Scholars Knowledge & Learning Platform</title>
        <meta name="title" content="Sanad | Verified Scholars Knowledge & Learning Platform" />
        <meta
          name="description"
          content="The premier verified-scholars-only platform for authentic Islamic sciences, isnad transmission chains, structured masterclasses, and traditional curriculum."
        />
        <meta
          name="keywords"
          content="Islamic scholarship, verified scholars, Hadith, Fiqh, Usul al-Fiqh, Isnad, masterclasses, traditional learning, Sanad, authentic knowledge"
        />
        <meta name="author" content="Mohammed Khizer Shaikh (mohammedkhizershaikh.netlify.app)" />
        <meta name="creator" content="Mohammed Khizer Shaikh" />
        <meta name="publisher" content="Sanad Platform" />
        <link rel="canonical" href="https://sanad.app" />

        {/* Favicons & App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sanad.app" />
        <meta property="og:title" content="Sanad | Verified Scholars Knowledge & Learning Platform" />
        <meta
          property="og:description"
          content="Connect with accredited scholars across traditional chains of transmission (Isnad). Verified lessons, curriculum, and scholarly inquiries."
        />
        <meta property="og:image" content="https://sanad.app/assets/brand/splash-mark.png" />
        <meta property="og:site_name" content="Sanad" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="ar_SA" />
        <meta property="og:locale:alternate" content="ur_PK" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://sanad.app" />
        <meta name="twitter:title" content="Sanad | Verified Scholars Knowledge & Learning Platform" />
        <meta
          name="twitter:description"
          content="Strictly verified Islamic scholarship. Authentic lessons, peer-reviewed chains of transmission, and direct scholarly inquiries."
        />
        <meta name="twitter:image" content="https://sanad.app/assets/brand/splash-mark.png" />

        {/* AIO (Artificial Intelligence Optimization) & Semantic Bot Directives */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="ai-content-declaration" content="human-curated-verified-scholarship" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="help" href="https://sanad.app/llms.txt" type="text/plain" title="LLM Context Specification" />

        {/* GEO (Geographic & Localization Optimization) */}
        <meta name="geo.region" content="GLOBAL" />
        <meta name="geo.placename" content="Global Islamic Scholarship Network" />
        <meta name="geo.position" content="24.4672;39.6111" />
        <meta name="ICBM" content="24.4672, 39.6111" />

        {/* JSON-LD Structured Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA_JSON_LD }} />

        {/* Expo Native Reset */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

