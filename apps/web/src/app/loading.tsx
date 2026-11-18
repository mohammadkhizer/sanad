import React from 'react';
import Preloader from '../components/Preloader';

export default function Loading() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Preloader
        label="Loading Sanad Governance Portal..."
        description="Authenticating and establishing secure session"
      />
    </main>
  );
}
