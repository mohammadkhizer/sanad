import React from 'react';
import Preloader from '../../components/Preloader';

export default function AdminLoading() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Preloader
        label="Loading Governance Telemetry..."
        description="Synchronizing administrative logs and platform state"
      />
    </div>
  );
}

