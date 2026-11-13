'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { webApi } from '../../../lib/api';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'open' | 'resolved' | ''>('open');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await webApi.admin.getReports(statusFilter || undefined);
      setReports(res.reports || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch reports';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (reportId: string, action: 'resolve' | 'dismiss' | 'escalate') => {
    try {
      await webApi.admin.resolveReport(reportId, action, `Actioned via web admin portal`);
      setMessage({ text: `Report successfully marked as ${action}.`, type: 'success' });
      fetchReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to action report';
      setMessage({ text: msg, type: 'error' });
    }
  };

  return (
    <AdminLayout
      title="Trust & Safety Moderation Queue"
      subtitle="Handle reports regarding impersonation, misconduct, or policy violations"
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setStatusFilter('open')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: statusFilter === 'open' ? 'var(--color-emerald)' : 'var(--color-white)',
            color: statusFilter === 'open' ? '#FFFFFF' : 'var(--color-charcoal)',
            border: '1px solid var(--color-border)',
          }}
        >
          Open Reports
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: statusFilter === 'resolved' ? 'var(--color-emerald)' : 'var(--color-white)',
            color: statusFilter === 'resolved' ? '#FFFFFF' : 'var(--color-charcoal)',
            border: '1px solid var(--color-border)',
          }}
        >
          Resolved Reports
        </button>
        <button
          onClick={() => setStatusFilter('')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: statusFilter === '' ? 'var(--color-emerald)' : 'var(--color-white)',
            color: statusFilter === '' ? '#FFFFFF' : 'var(--color-charcoal)',
            border: '1px solid var(--color-border)',
          }}
        >
          All Cases
        </button>
      </div>

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
            Active Moderation Cases ({reports.length})
          </h2>
          <button
            onClick={fetchReports}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
            Loading moderation queue...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
              No Reports in Queue
            </h3>
            <p style={{ fontSize: '13px' }}>
              The platform trust and safety queue is clear.
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.map((report) => (
              <div
                key={report._id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  backgroundColor: 'var(--color-ivory)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: '#FDE8E8',
                        color: '#9B1C1C',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {report.reason || 'Misconduct'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      Target: {report.targetType} ({report.targetId})
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: report.status === 'open' ? '#B06000' : '#137333',
                    }}
                  >
                    Status: {report.status?.toUpperCase() || 'OPEN'}
                  </span>
                </div>

                {Boolean(report.details) && (
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
                    {report.details}
                  </p>
                )}

                {report.status === 'open' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                    <button
                      onClick={() => handleResolve(report._id, 'dismiss')}
                      className="btn btn-outline"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolve(report._id, 'resolve')}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '6px 16px' }}
                    >
                      Take Action & Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

