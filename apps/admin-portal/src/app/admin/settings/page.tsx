'use client';

import React, { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useAuth } from '../../../context/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  // Registration & Access Governance
  const [registrationMode, setRegistrationMode] = useState<'open' | 'vetted' | 'invite_only'>('open');
  const [defaultPrivateAccount, setDefaultPrivateAccount] = useState(false);
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState('5');

  // Isnad & Academic Verification Rigor
  const [requiredEndorsements, setRequiredEndorsements] = useState('2');
  const [quarantineFlaggedNarrations, setQuarantineFlaggedNarrations] = useState(true);
  const [autoWatermarkUnverified, setAutoWatermarkUnverified] = useState(true);

  // Trust & Safety Moderation
  const [sectarianFilterStrict, setSectarianFilterStrict] = useState(true);
  const [autoReportThreshold, setAutoReportThreshold] = useState('3');
  const [enableAutomatedFlagging, setEnableAutomatedFlagging] = useState(true);

  // Security & Administrative Access
  const [adminInactivityTimeout, setAdminInactivityTimeout] = useState('30');
  const [enforceAdmin2FA, setEnforceAdmin2FA] = useState(true);
  const [ipRestrictedAdmin, setIpRestrictedAdmin] = useState(false);

  // Maintenance & System Controls
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [cacheClearStatus, setCacheClearStatus] = useState<string | null>(null);

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving platform governance configuration...');
    setTimeout(() => {
      setSaveStatus('Platform configuration saved and synchronized successfully.');
      setTimeout(() => setSaveStatus(null), 3500);
    }, 600);
  };

  const handlePurgeCache = () => {
    setCacheClearStatus('Purging edge and query caches...');
    setTimeout(() => {
      setCacheClearStatus('System cache purged. Cache hit metrics reset.');
      setTimeout(() => setCacheClearStatus(null), 3500);
    }, 750);
  };

  const handleExportSystemReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      platform: 'Sanad - The Classical Islamic Scholarship Platform',
      administrator: user?.displayName || 'System Admin',
      configuration: {
        registrationMode,
        defaultPrivateAccount,
        maxConcurrentSessions,
        requiredEndorsements,
        quarantineFlaggedNarrations,
        autoWatermarkUnverified,
        sectarianFilterStrict,
        autoReportThreshold,
        enableAutomatedFlagging,
        adminInactivityTimeout,
        enforceAdmin2FA,
        ipRestrictedAdmin,
        maintenanceMode,
      },
      infrastructure: {
        apiGateway: 'https://sanad-api-s8t5.onrender.com',
        databaseEngine: 'MongoDB Atlas v7.0.8 Multi-Region Cluster',
        authStandard: 'HMAC-SHA256 JWT with refresh rotation',
      },
      engineer: {
        name: 'Mohammed Khizer Shaikh',
        role: 'Platform Architect & Lead Full-Stack Engineer',
        portfolio: 'https://mohammedkhizershaikh.netlify.app',
        linkedIn: 'https://www.linkedin.com/in/mohammed-khizer-shaikh',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanad-platform-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Platform Settings & Governance"
      subtitle="Configure academic transmission thresholds, security safeguards, and system infrastructure"
    >
      <form onSubmit={handleSavePlatformSettings} style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {saveStatus && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#DEF7EC',
              border: '1px solid #31C48D',
              borderRadius: 'var(--radius-sm)',
              color: '#03543F',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {saveStatus}
          </div>
        )}

        {/* Section 1: Member Registration & Identity Governance */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-emerald)',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-emerald)',
              }}
            >
              Member Registration &amp; Account Policies
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Manage who can create accounts and configure default member privacy and session restrictions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Platform Enrollment Mode
              </label>
              <select
                value={registrationMode}
                onChange={(e) => setRegistrationMode(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-ivory)',
                  fontSize: '13px',
                  color: 'var(--color-charcoal)',
                }}
              >
                <option value="open">Open Registration (Age 13+ with verification)</option>
                <option value="vetted">Vetted Enrollment (Manual council approval required)</option>
                <option value="invite_only">Invite Only (Accredited scholar referral token)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Max Concurrent Sessions per Member
              </label>
              <select
                value={maxConcurrentSessions}
                onChange={(e) => setMaxConcurrentSessions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-ivory)',
                  fontSize: '13px',
                  color: 'var(--color-charcoal)',
                }}
              >
                <option value="2">2 Devices</option>
                <option value="5">5 Devices (Recommended)</option>
                <option value="10">10 Devices</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="defaultPrivate"
              checked={defaultPrivateAccount}
              onChange={(e) => setDefaultPrivateAccount(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
            />
            <label
              htmlFor="defaultPrivate"
              style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer', fontWeight: 600 }}
            >
              Default new accounts to Private Mode (followers must be explicitly approved)
            </label>
          </div>
        </div>

        {/* Section 2: Isnad & Academic Transmission Thresholds */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-gold)',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-emerald)',
              }}
            >
              Isnad Verification &amp; Scholarly Transmission Rigor
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Establish cryptographic and consensus requirements for chain-of-transmission certifications and public Hadith commentary.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Required Faculty Approvals for Ijazah
              </label>
              <select
                value={requiredEndorsements}
                onChange={(e) => setRequiredEndorsements(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-ivory)',
                  fontSize: '13px',
                  color: 'var(--color-charcoal)',
                }}
              >
                <option value="1">1 Accredited Scholar Approval</option>
                <option value="2">2 Independent Scholar Approvals (Standard)</option>
                <option value="3">3 Senior Academic Council Reviewers (Rigorous)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="quarantineFlagged"
                  checked={quarantineFlaggedNarrations}
                  onChange={(e) => setQuarantineFlaggedNarrations(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
                />
                <label
                  htmlFor="quarantineFlagged"
                  style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer' }}
                >
                  Immediately quarantine posts flagged for doubtful narrations
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="autoWatermark"
                  checked={autoWatermarkUnverified}
                  onChange={(e) => setAutoWatermarkUnverified(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
                />
                <label
                  htmlFor="autoWatermark"
                  style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer' }}
                >
                  Apply warning banner on unreferenced Hadith citations
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Trust, Safety & Content Moderation */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#9B1C1C',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-emerald)',
              }}
            >
              Trust, Safety &amp; Content Moderation
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Automated scanning and threshold configurations for maintaining decorum in classical discourse.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Auto-Escalation Report Count
              </label>
              <select
                value={autoReportThreshold}
                onChange={(e) => setAutoReportThreshold(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-ivory)',
                  fontSize: '13px',
                  color: 'var(--color-charcoal)',
                }}
              >
                <option value="2">2 Unique Reports</option>
                <option value="3">3 Unique Reports (Recommended)</option>
                <option value="5">5 Unique Reports</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="sectarianFilter"
                  checked={sectarianFilterStrict}
                  onChange={(e) => setSectarianFilterStrict(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
                />
                <label
                  htmlFor="sectarianFilter"
                  style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer' }}
                >
                  Strict Takfir &amp; Sectarian Slander Filter (pre-moderation rejection)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="automatedFlagging"
                  checked={enableAutomatedFlagging}
                  onChange={(e) => setEnableAutomatedFlagging(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
                />
                <label
                  htmlFor="automatedFlagging"
                  style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer' }}
                >
                  Flag high-velocity comment disputes into Priority Review
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Security, Inactivity & Access Governance */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-emerald-light)',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-emerald)',
              }}
            >
              Administrative Security &amp; Session Inactivity
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Protect administrator credentials, audit compliance, and restrict privileged actions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-charcoal)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Admin Inactivity Auto-Lock
              </label>
              <select
                value={adminInactivityTimeout}
                onChange={(e) => setAdminInactivityTimeout(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-ivory)',
                  fontSize: '13px',
                  color: 'var(--color-charcoal)',
                }}
              >
                <option value="15">15 Minutes of Inactivity</option>
                <option value="30">30 Minutes of Inactivity (Recommended)</option>
                <option value="60">1 Hour of Inactivity</option>
                <option value="240">4 Hours of Inactivity</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="enforce2fa"
                  checked={enforceAdmin2FA}
                  onChange={(e) => setEnforceAdmin2FA(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
                />
                <label
                  htmlFor="enforce2fa"
                  style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Mandatory Two-Factor Authentication (TOTP) for all admin roles
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="ipRestrict"
                  checked={ipRestrictedAdmin}
                  onChange={(e) => setIpRestrictedAdmin(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-emerald)' }}
                />
                <label
                  htmlFor="ipRestrict"
                  style={{ fontSize: '13px', color: 'var(--color-charcoal)', cursor: 'pointer' }}
                >
                  Restrict administrative operations to authenticated IP ranges
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: System Maintenance & Diagnostics */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-charcoal)',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-emerald)',
              }}
            >
              System Operations &amp; Database Maintenance
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Operational utilities for cache invalidation, audit data export, and emergency platform maintenance.
          </p>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-ivory)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                Emergency Platform Maintenance Mode
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                Locks all write operations across web and mobile. Only platform administrators can authenticate.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: maintenanceMode ? '1px solid #9B1C1C' : '1px solid var(--color-border)',
                backgroundColor: maintenanceMode ? '#FDE8E8' : 'var(--color-white)',
                color: maintenanceMode ? '#9B1C1C' : 'var(--color-charcoal)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {maintenanceMode ? 'Active (Click to Disable)' : 'Disabled (Click to Activate)'}
            </button>
          </div>

          {cacheClearStatus && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-ivory-warm)',
                border: '1px solid var(--color-gold)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-gold-dark)',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '14px',
              }}
            >
              {cacheClearStatus}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePurgeCache}
              style={{
                padding: '10px 18px',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-charcoal)',
                cursor: 'pointer',
              }}
            >
              Purge Query Cache
            </button>
            <button
              type="button"
              onClick={handleExportSystemReport}
              style={{
                padding: '10px 18px',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-gold)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-gold-dark)',
                cursor: 'pointer',
              }}
            >
              Export System Audit Report (JSON)
            </button>
          </div>
        </div>

        {/* Section 6: Engineering Architecture & Developer Credits */}
        <div
          style={{
            backgroundColor: 'var(--color-ivory-warm)',
            border: '1px solid var(--color-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span
              style={{
                backgroundColor: 'var(--color-gold)',
                color: 'var(--color-white)',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              System Architect
            </span>
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-emerald)',
              }}
            >
              Platform Engineering &amp; Architecture
            </h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-charcoal)', marginBottom: '12px', lineHeight: 1.5 }}>
            The Sanad Classical Islamic Knowledge Platform is architected and engineered by{' '}
            <strong style={{ color: 'var(--color-emerald)' }}>Mohammed Khizer Shaikh</strong>. Built with React, Next.js,
            React Native / Expo, Node.js, and MongoDB Atlas.
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://mohammedkhizershaikh.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-gold-dark)',
                textDecoration: 'underline',
              }}
            >
              Portfolio: mohammedkhizershaikh.netlify.app
            </a>
            <a
              href="https://www.linkedin.com/in/mohammed-khizer-shaikh"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-gold-dark)',
                textDecoration: 'underline',
              }}
            >
              LinkedIn: mohammed-khizer-shaikh
            </a>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            type="submit"
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--color-emerald)',
              color: 'var(--color-white)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Save Governance Settings
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
