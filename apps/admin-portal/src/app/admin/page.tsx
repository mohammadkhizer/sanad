'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import Preloader, { Spinner } from '../../components/Preloader';
import { webApi } from '../../lib/api';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    scholarsCount: 0,
    adminsCount: 0,
    pendingApps: 0,
    activeReports: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, reviewRes, reportsRes, auditRes] = await Promise.allSettled([
          webApi.admin.getUsers(),
          webApi.admin.getReviewQueue(),
          webApi.admin.getReports('open'),
          webApi.admin.getAuditLogs(5),
        ]);

        const users = usersRes.status === 'fulfilled' ? usersRes.value?.users || [] : [];
        const scholars = users.filter((u: any) => u.roles?.includes('scholar'));
        const admins = users.filter((u: any) => u.roles?.includes('admin'));

        const apps = reviewRes.status === 'fulfilled' ? reviewRes.value?.items || reviewRes.value?.applications || [] : [];
        const reports = reportsRes.status === 'fulfilled' ? reportsRes.value?.reports || [] : [];
        const logs = auditRes.status === 'fulfilled' ? auditRes.value?.logs || auditRes.value?.auditLogs || [] : [];

        setStats({
          totalUsers: users.length,
          scholarsCount: scholars.length,
          adminsCount: admins.length,
          pendingApps: apps.length,
          activeReports: reports.length,
        });
        setRecentLogs(logs);
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <AdminLayout
      title="Platform Operations & Health"
      subtitle="Comprehensive metrics and administrative command center"
    >
      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '30px',
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
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
            Registered Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-emerald)', margin: '8px 0 4px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            {loading ? <Spinner size={22} color="var(--color-emerald)" /> : stats.totalUsers}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Across all platform roles
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
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
            Accredited Scholars
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#137333', margin: '8px 0 4px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            {loading ? <Spinner size={22} color="#137333" /> : stats.scholarsCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Verified institutional teachers
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
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
            Pending Applications
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#B06000', margin: '8px 0 4px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            {loading ? <Spinner size={22} color="#B06000" /> : stats.pendingApps}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Awaiting accreditation review
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
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
            Trust & Safety Queue
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: stats.activeReports > 0 ? '#C81E1E' : 'var(--color-emerald)', margin: '8px 0 4px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            {loading ? <Spinner size={22} color="var(--color-emerald)" /> : stats.activeReports}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Open moderation cases
          </div>
        </div>
      </div>

      {/* Quick Action Panes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '12px' }}>
            User & Role Governance
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Search user profiles by username, view internal vs public IDs, and assign roles (Administrator, Scholar, Moderator, Member).
          </p>
          <Link href="/admin/users" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            Manage Users & Roles
          </Link>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '12px' }}>
            Scholar Verification Queue
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Audit candidate ijazahs, university credentials, and academic statements to maintain rigorous educational integrity.
          </p>
          <Link href="/admin/review-queue" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }}>
            Inspect Review Queue
          </Link>
        </div>
      </div>

      {/* Recent Audit Trail Snippet */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-emerald)' }}>
            Recent Immutable Audit Actions
          </h2>
          <Link href="/admin/audit-logs" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-emerald)' }}>
            View Full Trail
          </Link>
        </div>

        {loading ? (
          <Preloader inline label="Loading platform audit trail..." description="Synchronizing recent administrative actions" />
        ) : recentLogs.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '13px' }}>
            No recent audit records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-muted)' }}>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                  <th style={{ padding: '8px 12px' }}>Target</th>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log: any, idx: number) => (
                  <tr key={log._id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {log.targetType}: {log.targetId}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)' }}>
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

