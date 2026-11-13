'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { webApi } from '../../../lib/api';

interface ScholarItem {
  _id: string;
  publicId?: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  roles: string[];
  scholarProfile?: {
    verified: boolean;
    institution?: string;
    country?: string;
    yearsOfExperience?: number;
    specialties?: string[];
  };
  monitoringStats?: {
    totalActivities: number;
    unauthorizedIncidents: number;
    securityStatus: 'clean' | 'flagged';
    lastActivity?: any;
  };
}

interface ActivityItem {
  _id: string;
  scholarId: string;
  action: string;
  category: string;
  title: string;
  description: string;
  isUnauthorized: boolean;
  severity: 'info' | 'warning' | 'critical';
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  dismissed?: boolean;
  createdAt: string;
}

export default function ScholarActivityMonitoringPage() {
  const [scholars, setScholars] = useState<ScholarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

  // Stats
  const [metaStats, setMetaStats] = useState({
    totalScholars: 0,
    unauthorizedAlertsCount: 0,
    activeCountries: [] as string[],
  });

  // Selected Scholar Inspector
  const [selectedScholar, setSelectedScholar] = useState<ScholarItem | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Security Notice Dispatch Form
  const [alertTitle, setAlertTitle] = useState('Security Notice: Unauthorized Activity Detected');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'warning' | 'critical'>('warning');
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const fetchScholars = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await webApi.admin.getScholarMonitoring({
        country: selectedCountry !== 'all' ? selectedCountry : undefined,
        experience: selectedExperience !== 'all' ? selectedExperience : undefined,
        username: searchUsername.trim() || undefined,
      });

      setScholars(res.scholars || []);
      if (res.meta) {
        setMetaStats({
          totalScholars: res.meta.totalScholars || 0,
          unauthorizedAlertsCount: res.meta.unauthorizedAlertsCount || 0,
          activeCountries: res.meta.activeCountries || [],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load scholar monitoring data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholars();
  }, [selectedCountry, selectedExperience]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScholars();
  };

  const openScholarInspector = async (scholar: ScholarItem) => {
    setSelectedScholar(scholar);
    setTimelineLoading(true);
    setAlertSuccess(null);
    setAlertMessage('');
    try {
      const res = await webApi.admin.getScholarActivityTimeline(scholar._id);
      setActivities(res.activities || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch timeline';
      alert(msg);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleSendSecurityNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholar || !alertMessage.trim()) return;

    try {
      setSendingAlert(true);
      setAlertSuccess(null);
      await webApi.admin.sendScholarSecurityAlert(selectedScholar._id, {
        flagTitle: alertTitle.trim(),
        message: alertMessage.trim(),
        severity: alertSeverity,
      });

      setAlertSuccess('Security alert delivered directly to scholar device.');
      setAlertMessage('');
      // Refresh activities
      const res = await webApi.admin.getScholarActivityTimeline(selectedScholar._id);
      setActivities(res.activities || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deliver security alert';
      alert(msg);
    } finally {
      setSendingAlert(false);
    }
  };

  const handleDismissActivity = async (actId: string) => {
    try {
      await webApi.admin.dismissActivityAlert(actId);
      setActivities((prev) =>
        prev.map((a) => (a._id === actId ? { ...a, dismissed: true } : a))
      );
      fetchScholars();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Dismissal failed';
      alert(msg);
    }
  };

  const countriesList = [
    'All Countries',
    'Saudi Arabia',
    'Egypt',
    'United Kingdom',
    'United States',
    'Turkey',
    'Pakistan',
    'Jordan',
    'Morocco',
    'Malaysia',
  ];

  return (
    <AdminLayout
      title="Scholar Activity Monitoring & Security Audit"
      subtitle="Surveillance of accredited scholar actions, unauthorized publishing attempts, and direct security notifications"
    >
      {/* Top Telemetry Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
            Monitored Scholars
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-emerald)', marginTop: '4px' }}>
            {metaStats.totalScholars}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Accredited publishing licenses
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
            Unauthorized Alerts
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: metaStats.unauthorizedAlertsCount > 0 ? '#C81E1E' : 'var(--color-emerald)',
              marginTop: '4px',
            }}
          >
            {metaStats.unauthorizedAlertsCount}
          </div>
          <div style={{ fontSize: '12px', color: metaStats.unauthorizedAlertsCount > 0 ? '#9B1C1C' : 'var(--color-muted)', marginTop: '4px' }}>
            {metaStats.unauthorizedAlertsCount > 0
              ? 'Requires administrative review'
              : 'All activities within certified bounds'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
            Active Jurisdictions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-gold-hover)', marginTop: '4px' }}>
            {metaStats.activeCountries.length || 9}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Cross-border scholar networks
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Username Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search scholar by @username, name, or Public ID..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="form-input"
              style={{ fontSize: '13px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ fontSize: '13px', padding: '0 18px', flexShrink: 0 }}>
              Search
            </button>
          </form>

          {/* Country Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Country:
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="form-input"
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              {countriesList.map((c) => (
                <option key={c} value={c === 'All Countries' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Experience:
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="form-input"
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="all">All Experience Levels</option>
              <option value="junior">Emerging (&lt;5 Years)</option>
              <option value="mid">Mid-Level (5 - 15 Years)</option>
              <option value="senior">Senior / Veteran (15+ Years)</option>
            </select>
          </div>

          {(searchUsername || selectedCountry !== 'all' || selectedExperience !== 'all') && (
            <button
              onClick={() => {
                setSearchUsername('');
                setSelectedCountry('all');
                setSelectedExperience('all');
              }}
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Scholars Activity Directory */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-ivory)',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Scholar Activity Surveillance Roster ({scholars.length} Records)
          </div>
          <button
            onClick={fetchScholars}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Refresh Feed
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '14px' }}>
            Querying active scholar monitoring telemetry...
          </div>
        ) : error ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#9B1C1C', fontSize: '14px' }}>
            {error}
          </div>
        ) : scholars.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-muted)' }}>
            No scholars match the specified country, experience, or username filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#FAF7F0',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-muted)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>Scholar Persona</th>
                  <th style={{ padding: '14px 18px' }}>Origin & Experience</th>
                  <th style={{ padding: '14px 18px' }}>Academic Seat</th>
                  <th style={{ padding: '14px 18px' }}>Security Status</th>
                  <th style={{ padding: '14px 18px' }}>Recent Action</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Surveillance</th>
                </tr>
              </thead>
              <tbody>
                {scholars.map((scholar) => {
                  const unauthCount = scholar.monitoringStats?.unauthorizedIncidents || 0;
                  const isFlagged = unauthCount > 0;
                  const lastAct = scholar.monitoringStats?.lastActivity;

                  return (
                    <tr
                      key={scholar._id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: isFlagged ? '#FEF2F2' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Scholar Persona */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-emerald)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '15px',
                              flexShrink: 0,
                            }}
                          >
                            {scholar.displayName ? scholar.displayName[0].toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-charcoal)' }}>
                              {scholar.displayName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-emerald)', fontWeight: 600 }}>
                              @{scholar.username || 'unassigned'}
                            </div>
                            {scholar.publicId && (
                              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-muted)' }}>
                                {scholar.publicId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Origin & Experience */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                          {scholar.scholarProfile?.country || 'Saudi Arabia'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                          {scholar.scholarProfile?.yearsOfExperience ?? 10} Years Experience
                        </div>
                      </td>

                      {/* Academic Seat */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: 'var(--color-charcoal)', fontWeight: 500 }}>
                          {scholar.scholarProfile?.institution || 'Classical Seminary'}
                        </div>
                        {scholar.scholarProfile?.specialties && scholar.scholarProfile.specialties.length > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                            {scholar.scholarProfile.specialties.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Security Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {isFlagged ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#FDE8E8',
                              border: '1px solid #F98080',
                              color: '#9B1C1C',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#E02424',
                              }}
                            />
                            {unauthCount} Unauthorized Attempt{unauthCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#E6F4EA',
                              border: '1px solid #A8DAB5',
                              color: '#137333',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#31C48D',
                              }}
                            />
                            Monitoring Active (Clean)
                          </span>
                        )}
                      </td>

                      {/* Recent Action */}
                      <td style={{ padding: '14px 18px' }}>
                        {lastAct ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '12px', color: lastAct.isUnauthorized ? '#9B1C1C' : 'var(--color-charcoal)' }}>
                              {lastAct.title}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                              {new Date(lastAct.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                            Idle
                          </span>
                        )}
                      </td>

                      {/* Surveillance Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => openScholarInspector(scholar)}
                          className={isFlagged ? 'btn btn-gold' : 'btn btn-primary'}
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          Inspect Activity
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scholar Detailed Activity & Security Modal */}
      {selectedScholar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-ivory)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gold-hover)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.8px' }}>
                  Live Telemetry Stream
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-emerald)', marginTop: '2px' }}>
                  {selectedScholar.displayName} (@{selectedScholar.username || 'scholar'})
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                  Country: {selectedScholar.scholarProfile?.country || 'Saudi Arabia'} | Experience: {selectedScholar.scholarProfile?.yearsOfExperience ?? 10} Yrs | Institution: {selectedScholar.scholarProfile?.institution || 'Classical Seminary'}
                </div>
              </div>

              <button
                onClick={() => setSelectedScholar(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--color-muted)',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              {/* Security Alert Dispatch Form */}
              <div
                style={{
                  backgroundColor: '#FAF5EC',
                  border: '1px solid #E6D29A',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#8C6C0A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Issue Security Notice & In-App Notification
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px' }}>
                  Dispatch an administrative security alert directly to this scholar device and platform notification inbox.
                </p>

                {alertSuccess && (
                  <div style={{ padding: '8px 12px', backgroundColor: '#E6F4EA', color: '#137333', fontSize: '12px', fontWeight: 600, borderRadius: '4px', marginBottom: '12px' }}>
                    {alertSuccess}
                  </div>
                )}

                <form onSubmit={handleSendSecurityNotice} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Alert Title"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '13px', flex: 1 }}
                      required
                    />
                    <select
                      value={alertSeverity}
                      onChange={(e) => setAlertSeverity(e.target.value as any)}
                      className="form-input"
                      style={{ fontSize: '13px', width: '140px' }}
                    >
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Enter security warning or notification instructions for this scholar..."
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    className="form-input"
                    rows={2}
                    style={{ fontSize: '13px', resize: 'vertical' }}
                    required
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={sendingAlert || !alertMessage.trim()}
                      className="btn btn-gold"
                      style={{ fontSize: '13px', padding: '8px 18px' }}
                    >
                      {sendingAlert ? 'Delivering...' : 'Send Security Notification'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity Timeline */}
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
                Activity Stream & Unauthorized Surveillance
              </div>

              {timelineLoading ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '13px' }}>
                  Loading surveillance activity history...
                </div>
              ) : activities.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '13px' }}>
                  No activity events recorded for this scholar profile yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activities.map((act) => {
                    const isUnauth = act.isUnauthorized;
                    const isCritical = act.severity === 'critical';
                    const isWarning = act.severity === 'warning';

                    return (
                      <div
                        key={act._id}
                        style={{
                          border: '1px solid',
                          borderColor: isUnauth ? '#F98080' : 'var(--color-border)',
                          backgroundColor: isUnauth ? '#FFF5F5' : '#FAFAFA',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: isCritical ? '#FDE8E8' : isWarning ? '#FEF08A' : '#E6F4EA',
                                color: isCritical ? '#9B1C1C' : isWarning ? '#854D0E' : '#137333',
                              }}
                            >
                              {act.severity.toUpperCase()}
                            </span>

                            {isUnauth && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#9B1C1C',
                                  color: '#FFFFFF',
                                }}
                              >
                                Unauthorized Flag
                              </span>
                            )}

                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-muted)' }}>
                              [{act.category}] {act.action}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                            {new Date(act.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: isUnauth ? '#9B1C1C' : 'var(--color-charcoal)' }}>
                          {act.title}
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--color-charcoal)', lineHeight: 1.5, margin: 0 }}>
                          {act.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--color-muted)' }}>
                          <div>
                            IP: {act.ip || '127.0.0.1'} | Client: {act.userAgent || 'Sanad Client'}
                          </div>

                          {isUnauth && !act.dismissed && (
                            <button
                              onClick={() => handleDismissActivity(act._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-emerald)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '11px',
                                textDecoration: 'underline',
                              }}
                            >
                              Acknowledge / Dismiss Flag
                            </button>
                          )}

                          {act.dismissed && (
                            <span style={{ fontStyle: 'italic', color: '#137333' }}>
                              Reviewed & Dismissed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'var(--color-ivory)',
              }}
            >
              <button
                onClick={() => setSelectedScholar(null)}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '8px 20px' }}
              >
                Close Surveillance Pane
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
