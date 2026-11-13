'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { webApi } from '../../../lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const availableRoles = ['member', 'scholar', 'moderator', 'admin'];

  const fetchUsers = async (query?: string) => {
    setLoading(true);
    try {
      const res = await webApi.admin.getUsers(query);
      setUsers(res.users || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch users';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search);
  }, [search]);

  const handleEditRoles = (user: any) => {
    setEditingUser(user);
    setSelectedRoles(user.roles || ['member']);
    setMessage(null);
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) {
        alert('User must have at least one assigned role.');
        return;
      }
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    setSaving(true);
    setMessage(null);

    try {
      await webApi.admin.updateUserRole(editingUser._id || editingUser.id, selectedRoles);
      setMessage({ text: `Roles updated successfully for ${editingUser.displayName}.`, type: 'success' });
      setEditingUser(null);
      fetchUsers(search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update roles';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="User & Identity Governance"
      subtitle="Search users across all roles, inspect public/private IDs, and manage permission tiers"
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

      {/* Search Input Box */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username (@handle), name, public ID, or discipline..."
          style={{
            flex: 1,
            height: '40px',
            padding: '0 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '14px',
          }}
        />
        {Boolean(search) && (
          <button
            onClick={() => setSearch('')}
            className="btn btn-outline"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Users Table */}
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
            User Accounts ({users.length})
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Showing verified database records
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
            No users found matching query.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-muted)' }}>
                  <th style={{ padding: '10px 16px' }}>User Details</th>
                  <th style={{ padding: '10px 16px' }}>Username</th>
                  <th style={{ padding: '10px 16px' }}>Public ID</th>
                  <th style={{ padding: '10px 16px' }}>Roles</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-charcoal)' }}>{u.displayName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                        {u.email || u.phone || 'No direct contact'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-emerald)' }}>
                      {u.username ? `@${u.username}` : '-'}
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-muted)' }}>
                      {u.publicId || 'Pending'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(u.roles || []).map((r: string) => {
                          const bg =
                            r === 'admin'
                              ? '#FEF7E0'
                              : r === 'scholar'
                                ? '#E6F4EA'
                                : r === 'moderator'
                                  ? '#E8F0FE'
                                  : '#F1F3F4';
                          const color =
                            r === 'admin'
                              ? '#B06000'
                              : r === 'scholar'
                                ? '#137333'
                                : r === 'moderator'
                                  ? '#1A73E8'
                                  : '#5F6368';
                          return (
                            <span
                              key={r}
                              style={{
                                backgroundColor: bg,
                                color,
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {r}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#0D652D',
                          backgroundColor: '#E6F4EA',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.status || 'Active'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEditRoles(u)}
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Edit Roles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Roles Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
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
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '8px' }}>
              Assign Roles for {editingUser.displayName}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px' }}>
              Select the administrative and community permission levels for this account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {availableRoles.map((role) => {
                const isChecked = selectedRoles.includes(role);
                return (
                  <label
                    key={role}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: isChecked ? 'var(--color-emerald)' : 'var(--color-border)',
                      backgroundColor: isChecked ? '#FAF5EC' : 'var(--color-white)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRole(role)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {role}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                        {role === 'admin'
                          ? 'Full system governance, audit access, and user role configuration'
                          : role === 'scholar'
                            ? 'Accredited teacher: publish curriculum lessons and host study circles'
                            : role === 'moderator'
                              ? 'Trust & safety enforcement and community report handling'
                              : 'Standard member access to attend circles and explore discourse'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveRoles}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '8px 20px' }}
              >
                {saving ? 'Saving...' : 'Apply Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

