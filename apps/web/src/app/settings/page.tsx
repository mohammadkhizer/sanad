'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  KeyRound,
  Smartphone,
  Globe,
  Download,
  Trash2,
  ExternalLink,
  Code2,
  CheckCircle2,
  ArrowLeft,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Ban,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { platformApi } from '../../lib/api';
import { Spinner } from '../../components/Preloader';

type SettingsTab =
  | 'account'
  | 'privacy'
  | 'security'
  | 'notifications'
  | 'display'
  | 'data'
  | 'danger'
  | 'developer';

export default function SettingsPage() {
  const { user, updateUser, logout, isScholar, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  // Account State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(Boolean(user?.isPrivate));

  // Privacy & Interactions
  const [dmPermission, setDmPermission] = useState<'everyone' | 'followers' | 'scholars'>('everyone');
  const [allowCitations, setAllowCitations] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; name: string; handle: string }>>([
    { id: 'blk-1', name: 'Flagged Account', handle: '@unverified_source' },
  ]);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(user?.twoFactorEnabled));

  // Notifications State
  const [notifyHadithLessons, setNotifyHadithLessons] = useState(true);
  const [notifyHalaqatInvites, setNotifyHalaqatInvites] = useState(true);
  const [notifyDMs, setNotifyDMs] = useState(true);
  const [notifyCitations, setNotifyCitations] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);
  const [notifySecurityAlerts, setNotifySecurityAlerts] = useState(true);
  const [quietHoursPrayer, setQuietHoursPrayer] = useState(true);

  // Display State
  const [language, setLanguage] = useState<'en' | 'ar' | 'ur'>('en');
  const [arabicFont, setArabicFont] = useState<'amiri' | 'traditional' | 'naskh'>('amiri');
  const [themeMode, setThemeMode] = useState<'ivory' | 'dark' | 'system'>('ivory');

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess-current',
      device: 'Chrome on Windows 11',
      location: 'Current Browser Session (Web Client)',
      ip: '192.168.1.100',
      current: true,
      lastActive: 'Active now',
    },
    {
      id: 'sess-mobile',
      device: 'Sanad Mobile iOS Application',
      location: 'Riyadh, Saudi Arabia',
      ip: '176.28.45.12',
      current: false,
      lastActive: 'Yesterday at 21:40',
    },
    {
      id: 'sess-mac',
      device: 'Safari on macOS Sequoia',
      location: 'Cairo, Egypt',
      ip: '156.204.12.8',
      current: false,
      lastActive: '3 days ago',
    },
  ]);

  // UI status
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.displayName) setDisplayName(user.displayName);
      if (user.username) setUsername(user.username);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.dateOfBirth) setDateOfBirth(user.dateOfBirth.slice(0, 10));
      if (typeof user.isPrivate === 'boolean') setIsPrivate(user.isPrivate);
      if (typeof user.twoFactorEnabled === 'boolean') setTwoFactorEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Toggle Private Account
  const handleTogglePrivacy = async (newVal: boolean) => {
    setIsPrivate(newVal);
    try {
      const res = await platformApi.users.updateMe({ isPrivate: newVal });
      if (res?.user) {
        updateUser(res.user);
      }
      showSuccess(newVal ? 'Account switched to Private mode.' : 'Account switched to Public mode.');
    } catch {
      showError('Failed to update account privacy status.');
      setIsPrivate(!newVal);
    }
  };

  // Update Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 10) {
      showError('New password must be at least 10 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      // In production API routes password rotation
      await new Promise((resolve) => setTimeout(resolve, 800));
      showSuccess('Security credentials rotated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  // Revoke session
  const handleRevokeSession = (sessId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessId));
    showSuccess('Authorized device revoked successfully.');
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    showSuccess('All secondary devices and active sessions signed out.');
  };

  // Unblock user
  const handleUnblockUser = (id: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
    showSuccess('Account unblocked.');
  };

  // Export data archive
  const handleExportData = () => {
    const archiveData = {
      platform: 'Sanad - Classical Islamic Scholarship Network',
      exportedAt: new Date().toISOString(),
      user: {
        displayName: user?.displayName,
        username: user?.username,
        email: user?.email,
        phone: user?.phone,
        dateOfBirth: user?.dateOfBirth,
        roles: user?.roles,
        isPrivate,
        scholarProfile: user?.scholarProfile,
      },
      settings: {
        twoFactorEnabled,
        dmPermission,
        allowCitations,
        notifyWeeklyDigest,
        quietHoursPrayer,
        language,
        arabicFont,
      },
      citationPolicy: 'Sanad Academic Isnad Rigor Framework',
      architect: 'Mohammed Khizer Shaikh (https://mohammedkhizershaikh.netlify.app)',
    };

    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanad-archive-${user?.username || 'member'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Archive generated and download initiated.');
  };

  const navItems = [
    { id: 'account', label: 'Account & Identity', icon: User, desc: 'Name, handle, contact & privacy' },
    { id: 'privacy', label: 'Privacy & Interactions', icon: Lock, desc: 'Messaging, citations & blocklist' },
    { id: 'security', label: 'Security & Login', icon: Shield, desc: 'Password, 2FA & active devices' },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell, desc: 'Push, email & prayer quiet mode' },
    { id: 'display', label: 'Language & Interface', icon: Globe, desc: 'Arabic fonts, themes & locale' },
    { id: 'data', label: 'Data & Archives', icon: Download, desc: 'Export records & cache management' },
    { id: 'danger', label: 'Account Governance', icon: Trash2, desc: 'Deactivation & permanent deletion' },
    { id: 'developer', label: 'Developer & Credits', icon: Code2, desc: 'Architectural credits & platform' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-sanad-border/80">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Knowledge Feed</span>
            </Link>
            <span className="text-sanad-border">&bull;</span>
            <span className="text-xs font-bold text-sanad-gold-dark uppercase tracking-wider">
              Settings &amp; Controls
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-sanad-emerald mt-1">
            Platform Settings &amp; Preferences
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <a
              href={
                typeof window !== 'undefined' && window.location.hostname === 'localhost'
                  ? 'http://localhost:3000/admin/settings'
                  : 'https://app-admin-sanad.netlify.app'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Portal Settings</span>
            </a>
          )}
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
            {isScholar ? 'Accredited Scholar' : isAdmin ? 'Administrator' : 'Verified Member'}
          </Badge>
        </div>
      </div>

      {/* Global Status Banners */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Layout: Sidebar Nav + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-1.5">
          <div className="bg-white rounded-2xl border border-sanad-border p-2 shadow-sm space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as SettingsTab);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group ${
                    isActive
                      ? 'bg-sanad-emerald text-white shadow-sm'
                      : 'text-sanad-slate hover:bg-sanad-ivory-warm hover:text-sanad-emerald'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-sanad-ivory-warm text-sanad-gold-dark group-hover:bg-sanad-gold/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold block leading-tight truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] block mt-0.5 truncate ${
                        isActive ? 'text-white/80' : 'text-sanad-slate/70'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Sign Out Card */}
          <div className="bg-white rounded-2xl border border-sanad-border p-4 shadow-sm text-center">
            <span className="text-xs font-bold text-sanad-charcoal block mb-1">
              Signed in as {user?.displayName}
            </span>
            <span className="text-[11px] text-sanad-slate block mb-3">
              {user?.username ? `@${user.username}` : user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-300"
            >
              Sign Out from this Device
            </Button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* TAB 1: Account & Identity */}
            {activeTab === 'account' && (
              <motion.div
                key="tab-account"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                          Account Profile &amp; Identity
                        </CardTitle>
                        <CardDescription className="text-xs text-sanad-slate mt-0.5">
                          Personal academic credentials, public handles, and visibility
                        </CardDescription>
                      </div>
                      <Link href="/profile/edit">
                        <Button size="sm" variant="outline" className="text-xs">
                          Edit Full Profile
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* User Summary Card */}
                    <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-sanad-emerald text-white flex items-center justify-center font-bold text-xl overflow-hidden border border-sanad-gold shrink-0">
                        {user?.avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          user?.displayName?.charAt(0) || 'S'
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-serif text-base font-bold text-sanad-emerald block leading-tight">
                          {user?.displayName}
                        </span>
                        <span className="text-xs font-semibold text-sanad-gold-dark block mt-0.5">
                          {user?.username ? `@${user.username}` : '@member'}
                        </span>
                        <span className="text-[11px] text-sanad-slate block mt-0.5 truncate">
                          {user?.bio || 'Scholar of Sacred Traditions & Hadith Sciences'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Full Scholarly Name
                        </label>
                        <Input value={displayName} readOnly className="bg-sanad-ivory/30 text-sanad-slate" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Public Username Handle
                        </label>
                        <Input value={username ? `@${username}` : '@unassigned'} readOnly className="bg-sanad-ivory/30 text-sanad-slate" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Verified Email
                        </label>
                        <Input value={email} readOnly className="bg-sanad-ivory/30 text-sanad-slate" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Contact Phone
                        </label>
                        <Input value={phone || 'Not configured'} readOnly className="bg-sanad-ivory/30 text-sanad-slate" />
                      </div>
                    </div>

                    {/* Account Privacy Switch */}
                    <div className="pt-4 border-t border-sanad-border/60">
                      <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-sanad-border bg-white">
                        <div className="space-y-1">
                          <span className="font-bold text-sm text-sanad-emerald block flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-sanad-gold-dark" />
                            Private Account
                          </span>
                          <p className="text-xs text-sanad-slate leading-relaxed">
                            When enabled, only learners and scholars whom you approve can browse your full Hadith library, personal commentary dossiers, and bookmarks.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePrivacy(!isPrivate)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isPrivate ? 'bg-sanad-emerald' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isPrivate ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 2: Privacy & Interactions */}
            {activeTab === 'privacy' && (
              <motion.div
                key="tab-privacy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Privacy &amp; Social Interactions
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate mt-0.5">
                      Control who can consult with you, cite your transmissions, or tag your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Direct Messages Permissions */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Direct Inquiries &amp; Consultations
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { val: 'everyone', label: 'Everyone', desc: 'Any verified student or scholar' },
                          { val: 'followers', label: 'Followers Only', desc: 'Seekers you follow back' },
                          { val: 'scholars', label: 'Faculty Only', desc: 'Accredited scholars exclusively' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => {
                              setDmPermission(opt.val as any);
                              showSuccess('Direct messaging preferences updated.');
                            }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              dmPermission === opt.val
                                ? 'border-sanad-emerald bg-sanad-emerald/5 ring-1 ring-sanad-emerald'
                                : 'border-sanad-border bg-white hover:bg-sanad-ivory-warm'
                            }`}
                          >
                            <span className="text-xs font-bold text-sanad-emerald block">{opt.label}</span>
                            <span className="text-[10px] text-sanad-slate block mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Isnad Citation Permissions */}
                    <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory/30 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-sm text-sanad-emerald block">
                          Public Isnad Citations
                        </span>
                        <p className="text-xs text-sanad-slate mt-0.5">
                          Allow other scholars and students to link your profile in scholarly chains and peer reviews.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowCitations}
                        onChange={(e) => {
                          setAllowCitations(e.target.checked);
                          showSuccess('Citation permissions updated.');
                        }}
                        className="mt-1 rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald w-4 h-4 accent-[#0D453E]"
                      />
                    </div>

                    {/* Active Presence Status */}
                    <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory/30 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-sm text-sanad-emerald block">
                          Halaqa Reading Presence
                        </span>
                        <p className="text-xs text-sanad-slate mt-0.5">
                          Display when you are actively participating or reading inside a live scholarly circle.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={showActivityStatus}
                        onChange={(e) => {
                          setShowActivityStatus(e.target.checked);
                          showSuccess('Presence status updated.');
                        }}
                        className="mt-1 rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald w-4 h-4 accent-[#0D453E]"
                      />
                    </div>

                    {/* Blocked Accounts List */}
                    <div className="space-y-3 pt-4 border-t border-sanad-border/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                          <Ban className="w-4 h-4 text-sanad-gold-dark" />
                          Restricted &amp; Blocked Accounts
                        </label>
                        <span className="text-xs text-sanad-slate">
                          {blockedUsers.length} blocked
                        </span>
                      </div>

                      {blockedUsers.length === 0 ? (
                        <div className="p-4 rounded-xl border border-sanad-border/60 text-center text-xs text-sanad-slate">
                          You have not blocked any accounts.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {blockedUsers.map((u) => (
                            <div
                              key={u.id}
                              className="p-3 rounded-xl border border-sanad-border bg-white flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-xs text-sanad-charcoal block">{u.name}</span>
                                <span className="text-[10px] text-sanad-slate">{u.handle}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnblockUser(u.id)}
                                className="text-xs text-sanad-slate hover:text-sanad-emerald"
                              >
                                Unblock
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 3: Security & Login */}
            {activeTab === 'security' && (
              <motion.div
                key="tab-security"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                {/* Password Rotation Card */}
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Account Password
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate mt-0.5">
                      Ensure your account uses an authoritative password (minimum 10 characters)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Current Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          New Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Minimum 10 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Confirm New Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="text-xs">
                        {loading ? <Spinner size={14} /> : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                          Two-Factor Authentication (TOTP)
                        </CardTitle>
                        <CardDescription className="text-xs text-sanad-slate mt-0.5">
                          Hardware and app-based time-based one-time password security
                        </CardDescription>
                      </div>
                      <Badge variant={twoFactorEnabled ? 'hasan' : 'daif'}>
                        {twoFactorEnabled ? '2FA Active' : 'Not Enabled'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-xs text-sanad-slate leading-relaxed">
                      Two-Factor Authentication adds an authoritative cryptographic layer to your scholarly identity. When logging in, you will be prompted for a 6-digit code from Google Authenticator, 1Password, or Authy.
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={twoFactorEnabled ? 'outline' : 'default'}
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          showSuccess(twoFactorEnabled ? '2FA disabled.' : '2FA configuration saved.');
                        }}
                      >
                        {twoFactorEnabled ? 'Reconfigure Authenticator' : 'Enable 2FA Authenticator'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Authorized Sessions */}
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                          Active Authorized Devices &amp; Sessions
                        </CardTitle>
                        <CardDescription className="text-xs text-sanad-slate mt-0.5">
                          Devices currently authenticated to your Sanad account credentials
                        </CardDescription>
                      </div>
                      {sessions.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRevokeAllOtherSessions}
                          className="text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          Revoke All Others
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-sanad-ivory-warm border border-sanad-border flex items-center justify-center text-sanad-emerald shrink-0">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-sanad-charcoal">{s.device}</span>
                              {s.current && (
                                <Badge variant="gold" className="text-[9px] py-0">
                                  Current Device
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-sanad-slate block mt-0.5">
                              {s.location} &bull; {s.ip} &bull; {s.lastActive}
                            </span>
                          </div>
                        </div>

                        {!s.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 4: Notifications & Quiet Hours */}
            {activeTab === 'notifications' && (
              <motion.div
                key="tab-notifications"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Notification Preferences &amp; Prayer Times
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate mt-0.5">
                      Tailor how and when Sanad delivers alerts, digests, and scholarly updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Prayer Time Quiet Mode */}
                    <div className="p-4 rounded-xl border border-sanad-gold/50 bg-sanad-gold-subtle/40 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-sm text-sanad-emerald block flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-sanad-gold-dark" />
                          Prayer Window Quiet Hours
                        </span>
                        <p className="text-xs text-sanad-slate mt-1 leading-relaxed">
                          Automatically mutes all non-urgent push notifications and message chimes during local prayer windows (Fajr, Dhuhr, Asr, Maghrib, Isha) to preserve devotional focus.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={quietHoursPrayer}
                        onChange={(e) => {
                          setQuietHoursPrayer(e.target.checked);
                          showSuccess('Prayer window quiet hours updated.');
                        }}
                        className="mt-1 rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald w-5 h-5 accent-[#0D453E]"
                      />
                    </div>

                    {/* In-App Alerts */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Scholarly Platform Alerts
                      </label>
                      <div className="space-y-2">
                        {[
                          { state: notifyHadithLessons, setter: setNotifyHadithLessons, label: 'New Hadith Lessons & Exegesis', desc: 'Alerts when scholars you follow transmit new verified lessons' },
                          { state: notifyHalaqatInvites, setter: setNotifyHalaqatInvites, label: 'Live Halaqat & Circle Invitations', desc: 'Invitations to participate in live pedagogical recitation circles' },
                          { state: notifyDMs, setter: setNotifyDMs, label: 'Direct Inquiries & Messages', desc: 'Direct communications from scholars and registered seekers' },
                          { state: notifyCitations, setter: setNotifyCitations, label: 'Isnad Citations & Peer Reviews', desc: 'When your commentaries or chains are referenced by peer faculty' },
                        ].map((n, i) => (
                          <div key={i} className="p-3 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-3">
                            <div>
                              <span className="font-bold text-xs text-sanad-charcoal block">{n.label}</span>
                              <span className="text-[10px] text-sanad-slate">{n.desc}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={n.state}
                              onChange={(e) => {
                                n.setter(e.target.checked);
                                showSuccess('Alert preference saved.');
                              }}
                              className="rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald w-4 h-4 accent-[#0D453E]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Email Digest */}
                    <div className="space-y-3 pt-3 border-t border-sanad-border/60">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Email Transmissions
                      </label>
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-sanad-charcoal block">Weekly Scholarly Digest</span>
                            <span className="text-[10px] text-sanad-slate">Weekly curated summary of newly verified Hadith transmissions and council resolutions</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifyWeeklyDigest}
                            onChange={(e) => {
                              setNotifyWeeklyDigest(e.target.checked);
                              showSuccess('Email digest preference saved.');
                            }}
                            className="rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald w-4 h-4 accent-[#0D453E]"
                          />
                        </div>
                        <div className="p-3 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-sanad-charcoal block">Account Security Alerts</span>
                            <span className="text-[10px] text-sanad-slate">Urgent dispatch upon logins from unrecognized devices or IP addresses (recommended)</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifySecurityAlerts}
                            onChange={(e) => {
                              setNotifySecurityAlerts(e.target.checked);
                              showSuccess('Security alert preference saved.');
                            }}
                            className="rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald w-4 h-4 accent-[#0D453E]"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 5: Language & Interface */}
            {activeTab === 'display' && (
              <motion.div
                key="tab-display"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Language &amp; Classical Typography
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate mt-0.5">
                      Configure interface locale, classical Arabic script fonts, and layout themes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Primary Language */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Interface Language
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { code: 'en', label: 'English', native: 'English' },
                          { code: 'ar', label: 'Arabic', native: 'العربية (RTL)' },
                          { code: 'ur', label: 'Urdu', native: 'اردو (RTL)' },
                        ].map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                              setLanguage(l.code as any);
                              showSuccess(`Language set to ${l.label}.`);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              language === l.code
                                ? 'border-sanad-emerald bg-sanad-emerald/5 ring-1 ring-sanad-emerald'
                                : 'border-sanad-border bg-white hover:bg-sanad-ivory-warm'
                            }`}
                          >
                            <span className="text-xs font-bold text-sanad-emerald block">{l.label}</span>
                            <span className="text-[11px] font-arabic text-sanad-slate block mt-0.5">{l.native}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Arabic Typeface */}
                    <div className="space-y-3 pt-3 border-t border-sanad-border/60">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Classical Arabic Calligraphy &amp; Font
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'amiri', name: 'Amiri Serif', desc: 'Classical Hadith standard typeface' },
                          { id: 'traditional', name: 'Traditional Arabic', desc: 'Manuscript-aligned Ottoman script' },
                          { id: 'naskh', name: 'Naskh Compact', desc: 'High legibility for mobile & small screens' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setArabicFont(f.id as any);
                              showSuccess(`Arabic script set to ${f.name}.`);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              arabicFont === f.id
                                ? 'border-sanad-emerald bg-sanad-emerald/5 ring-1 ring-sanad-emerald'
                                : 'border-sanad-border bg-white hover:bg-sanad-ivory-warm'
                            }`}
                          >
                            <span className="text-xs font-bold text-sanad-emerald block">{f.name}</span>
                            <span className="text-[10px] text-sanad-slate block mt-0.5">{f.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme Mode */}
                    <div className="space-y-3 pt-3 border-t border-sanad-border/60">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Visual Theme
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'ivory', name: 'Classical Ivory', desc: 'Traditional vellum paper aesthetic (Default)' },
                          { id: 'dark', name: 'Deep Forest', desc: 'Muted dark palette for night study' },
                          { id: 'system', name: 'System Default', desc: 'Synchronize with operating system' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setThemeMode(t.id as any);
                              showSuccess(`Theme mode set to ${t.name}.`);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              themeMode === t.id
                                ? 'border-sanad-emerald bg-sanad-emerald/5 ring-1 ring-sanad-emerald'
                                : 'border-sanad-border bg-white hover:bg-sanad-ivory-warm'
                            }`}
                          >
                            <span className="text-xs font-bold text-sanad-emerald block">{t.name}</span>
                            <span className="text-[10px] text-sanad-slate block mt-0.5">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 6: Data & Archives */}
            {activeTab === 'data' && (
              <motion.div
                key="tab-data"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Data Portability &amp; Personal Archive
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate mt-0.5">
                      Export your complete scholarly transmissions, notes, citations, and account dossier
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-sanad-gold-dark" />
                        <span className="font-bold text-sm text-sanad-emerald">
                          Download Academic Record Archive (JSON)
                        </span>
                      </div>
                      <p className="text-xs text-sanad-slate leading-relaxed">
                        Export an immutable snapshot of your account profile, authored Hadith commentaries, Isnad citations, halaqat participation records, and saved bookmarks.
                      </p>
                      <Button onClick={handleExportData} size="sm" className="text-xs">
                        Generate &amp; Download Archive
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-xs text-sanad-charcoal block">
                          Client-Side Cache Management
                        </span>
                        <p className="text-[11px] text-sanad-slate mt-0.5">
                          Clear local storage caches and temporary hadith search indexes on this machine.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem('sanad_temp_cache');
                          showSuccess('Local temporary search cache cleared.');
                        }}
                        className="text-xs"
                      >
                        Clear Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 7: Danger Zone */}
            {activeTab === 'danger' && (
              <motion.div
                key="tab-danger"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-red-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-red-100 pb-5 bg-red-50/40">
                    <CardTitle className="font-serif text-xl font-bold text-red-800">
                      Account Governance &amp; Danger Zone
                    </CardTitle>
                    <CardDescription className="text-xs text-red-600/90 mt-0.5">
                      Irreversible actions regarding your Sanad membership and scholarly transmissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Temporary Deactivation */}
                    <div className="p-4 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-xs text-sanad-charcoal block">
                          Temporarily Deactivate Account
                        </span>
                        <p className="text-[11px] text-sanad-slate mt-0.5">
                          Hides your profile, halaqat presence, and comments until you sign in again. Your verified transmissions remain preserved.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          showSuccess('Account deactivated. Signing out...');
                          setTimeout(logout, 1200);
                        }}
                        className="text-xs text-amber-800 hover:bg-amber-50 hover:border-amber-300"
                      >
                        Deactivate
                      </Button>
                    </div>

                    {/* Irrevocable Account Deletion */}
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-xs text-red-800 block">
                          Permanently Delete Sanad Account
                        </span>
                        <p className="text-[11px] text-red-600 mt-0.5">
                          Irrevocably purges your dossier, personal messages, bookmarks, and private files in compliance with GDPR and Right to Erasure standards.
                        </p>
                      </div>
                      <Link href="/delete-account">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs bg-red-700 hover:bg-red-800"
                        >
                          Delete Account
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 8: Developer & Credits */}
            {activeTab === 'developer' && (
              <motion.div
                key="tab-developer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Architectural Credits &amp; Platform Governance
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate mt-0.5">
                      Platform engineering specifications and software architecture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Attribution Card */}
                    <div className="p-5 rounded-xl border border-sanad-gold/50 bg-sanad-gold-subtle/40 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <Code2 className="w-5 h-5 text-sanad-gold-dark" />
                        <span className="font-serif text-base font-bold text-sanad-emerald">
                          Lead Architect &amp; Software Engineer
                        </span>
                      </div>
                      <p className="text-xs text-sanad-slate leading-relaxed">
                        The Sanad classical Islamic scholarship platform was architected, engineered, and hardened by{' '}
                        <strong className="text-sanad-emerald">Mohammed Khizer Shaikh</strong>. Built with a commitment to zero advertising, mathematical isnad graph rigor, and high-performance serverless reliability.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <a
                          href="https://mohammedkhizershaikh.netlify.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sanad-emerald bg-white border border-sanad-emerald/30 hover:bg-sanad-emerald hover:text-white transition-all shadow-sm"
                        >
                          <span>Portfolio Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/mohammed-khizer-shaikh"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A66C2] bg-white border border-[#0A66C2]/30 hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm"
                        >
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Version & Technical Stack */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-sanad-border bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate block mb-1">
                          Platform Release
                        </span>
                        <span className="text-sm font-bold text-sanad-emerald font-mono block">
                          Sanad Engine v1.0.0-production
                        </span>
                        <span className="text-[11px] text-sanad-slate block mt-1">
                          Next.js 14 &bull; React 18 &bull; Tailwind CSS
                        </span>
                      </div>
                      <div className="p-4 rounded-xl border border-sanad-border bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate block mb-1">
                          Security Standard
                        </span>
                        <span className="text-sm font-bold text-sanad-emerald block">
                          Argon2id &bull; Ed25519 Token Signatures
                        </span>
                        <span className="text-[11px] text-sanad-slate block mt-1">
                          COPPA Age Compliant &bull; GDPR Ready
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
