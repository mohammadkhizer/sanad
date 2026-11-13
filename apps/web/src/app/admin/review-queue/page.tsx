'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { webApi } from '../../../lib/api';

export default function AdminReviewQueuePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await webApi.admin.getReviewQueue();
      setApplications(res.items || res.applications || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch review queue';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (appId: string, decision: 'approved' | 'rejected') => {
    setProcessingId(appId);
    setMessage(null);
    try {
      await webApi.admin.reviewApplication(appId, decision, `Application ${decision} via admin portal`);
      setMessage({ text: `Application ${decision} successfully.`, type: 'success' });
      fetchQueue();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review decision';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout
      title="Scholar Accreditation Review Queue"
      subtitle="Examine academic credentials, ijazahs, and institutional affiliations"
    >
      {message && (
        <div
          style={{
            backgroundColor: message.type === 'success' ? '#DEF7EC' : '#FDE8E8',
            border: `1px solid ${message.type === 'success' ? '#BCF0DA' : '#F8B4B4'}`,
            color: message.type === 'success' ? '#03543F' : '#9B1C1C',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: 600,
          }}
        >
          {message.text}
        </div>
      )}

      <div
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-emerald)' }}>
            Pending Applications ({applications.length})
          </h2>
          <button
            onClick={fetchQueue}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Refresh Queue
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
            Loading accreditation queue...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
              No Pending Applications
            </h3>
            <p style={{ fontSize: '13px' }}>
              All submitted scholar accreditation requests have been reviewed and decided.
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map((app) => (
              <div
                key={app._id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px',
                  backgroundColor: 'var(--color-ivory)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-emerald)' }}>
                      {app.applicantName || app.userId?.displayName || 'Scholar Applicant'}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                      Affiliation: <strong>{app.institution || 'Independent Islamic Scholar'}</strong>
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: '#FEF7E0',
                      color: '#B06000',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Pending Verification
                  </span>
                </div>

                {Boolean(app.statement) && (
                  <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--color-charcoal)', lineHeight: 1.5 }}>
                    <strong>Academic Statement:</strong> {app.statement}
                  </div>
                )}

                {Boolean(app.specialties?.length) && (
                  <div style={{ marginBottom: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>Specialties:</span>
                    {app.specialties.map((s: string) => (
                      <span
                        key={s}
                        style={{
                          backgroundColor: 'var(--color-white)',
                          border: '1px solid var(--color-border)',
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <button
                    disabled={processingId === app._id}
                    onClick={() => handleDecision(app._id, 'rejected')}
                    className="btn btn-outline"
                    style={{ fontSize: '13px', padding: '6px 14px', color: '#9B1C1C', borderColor: '#F8B4B4' }}
                  >
                    Reject
                  </button>
                  <button
                    disabled={processingId === app._id}
                    onClick={() => handleDecision(app._id, 'approved')}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '6px 18px' }}
                  >
                    {processingId === app._id ? 'Processing...' : 'Approve Accreditation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

