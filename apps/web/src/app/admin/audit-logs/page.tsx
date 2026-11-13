'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { webApi } from '../../../lib/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await webApi.admin.getAuditLogs(100);
      setLogs(res.logs || res.auditLogs || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AdminLayout
      title="Immutable Governance Audit Trail"
      subtitle="Cryptographically verified logging of administrative actions and role transitions"
    >
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
            System Audit Log Records ({logs.length})
          </h2>
          <button
            onClick={fetchLogs}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Refresh Logs
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
            Loading audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
            No audit records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-muted)' }}>
                  <th style={{ padding: '10px 16px' }}>Action</th>
                  <th style={{ padding: '10px 16px' }}>Actor</th>
                  <th style={{ padding: '10px 16px' }}>Target</th>
                  <th style={{ padding: '10px 16px' }}>Details</th>
                  <th style={{ padding: '10px 16px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any, idx: number) => (
                  <tr key={log._id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-emerald)' }}>
                      {log.action}
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {log.actorId ? String(log.actorId) : 'System'}
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-muted)' }}>
                      {log.targetType}: {log.targetId ? String(log.targetId) : 'N/A'}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', maxWidth: '300px' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                      </pre>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
