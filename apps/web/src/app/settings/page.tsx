'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Settings,
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
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

type SettingsTab = 'account' | 'security' | 'sessions' | 'language' | 'developer';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  // Simulated toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const sessions = [
    {
      id: 'sess-1',
      device: 'Chrome on Windows 11',
      location: 'Current Session (Web Client)',
      ip: '192.168.1.100',
      current: true,
      lastActive: 'Active now',
    },
    {
      id: 'sess-2',
      device: 'Sanad Mobile App (iOS)',
      location: 'Riyadh, Saudi Arabia',
      ip: '176.28.45.12',
      current: false,
      lastActive: 'Yesterday, 21:40',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Feed</span>
          </Link>
          <Badge variant="outline" className="text-xs">
            Platform Settings &amp; Privacy
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Sidebar Nav */}
          <div className="space-y-1">
            {[
              { id: 'account', label: 'Account Details', icon: Settings },
              { id: 'security', label: 'Security & 2FA', icon: Shield },
              { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
              { id: 'language', label: 'Language & Theme', icon: Globe },
              { id: 'developer', label: 'Developer & Credits', icon: Code2 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-sanad-emerald text-white shadow-sm'
                      : 'text-sanad-slate hover:bg-sanad-ivory-warm hover:text-sanad-emerald'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-sanad-border/60">
              <Link
                href="/delete-account"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Delete Account</span>
              </Link>
            </div>
          </div>

          {/* Main Settings Panel */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'account' && (
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Account Overview
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate">
                      Manage your profile credentials and contact email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Full Name
                      </label>
                      <Input
                        defaultValue={user?.displayName || 'Seeker of Sacred Knowledge'}
                        readOnly
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Email Address
                      </label>
                      <Input
                        defaultValue={user?.email || 'seeker@sanad.app'}
                        readOnly
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Public Username
                      </label>
                      <Input
                        defaultValue={`@${user?.username || 'ilm_seeker'}`}
                        readOnly
                      />
                    </div>
                    <div className="pt-3">
                      <Link href="/profile/edit">
                        <Button size="sm">Edit Public Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Security &amp; Authentication
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate">
                      Two-factor authentication and password updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-sanad-border bg-sanad-ivory/40">
                      <div>
                        <span className="font-bold text-sm text-sanad-emerald block">
                          Two-Factor Authentication (TOTP)
                        </span>
                        <p className="text-xs text-sanad-slate mt-0.5">
                          Protects account access using standard authenticator applications (Google Authenticator, Authy)
                        </p>
                      </div>
                      <Badge variant={twoFactorEnabled ? 'hasan' : 'daif'}>
                        {twoFactorEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="p-4 rounded-xl border border-sanad-border bg-white space-y-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-sanad-gold" />
                        <span className="font-bold text-xs text-sanad-emerald">
                          Account Password
                        </span>
                      </div>
                      <p className="text-xs text-sanad-slate">
                        To rotate your password, an OTP confirmation will be dispatched to your email address.
                      </p>
                      <Link href="/forgot-password">
                        <Button variant="outline" size="sm" className="text-xs">
                          Change Password
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'sessions' && (
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Active Authorized Sessions
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate">
                      Devices currently authenticated to your Sanad account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 rounded-xl border border-sanad-border bg-white flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sanad-ivory-warm border border-sanad-border flex items-center justify-center text-sanad-emerald shrink-0">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-sanad-emerald">
                                {s.device}
                              </span>
                              {s.current && (
                                <Badge variant="gold" className="text-[9px] py-0">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-sanad-slate block">
                              {s.location} &bull; {s.lastActive}
                            </span>
                          </div>
                        </div>

                        {!s.current && (
                          <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'language' && (
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      Language &amp; Classical Aesthetics
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate">
                      Select interface language and display density
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Interface Language
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`p-3.5 rounded-xl border text-left transition-colors ${
                            language === 'en'
                              ? 'border-sanad-emerald bg-sanad-ivory-warm font-bold text-sanad-emerald'
                              : 'border-sanad-border bg-white text-sanad-slate'
                          }`}
                        >
                          <span className="text-sm block">English (Scholarly)</span>
                          <span className="text-[11px] text-sanad-slate">Standard Latin Terminology</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage('ar')}
                          className={`p-3.5 rounded-xl border text-right transition-colors ${
                            language === 'ar'
                              ? 'border-sanad-emerald bg-sanad-ivory-warm font-bold text-sanad-emerald'
                              : 'border-sanad-border bg-white text-sanad-slate'
                          }`}
                        >
                          <span className="font-arabic text-base block">العربية الفصحى</span>
                          <span className="text-[11px] text-sanad-slate font-sans">المصطلحات التراثية</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'developer' && (
                <Card className="border-sanad-border bg-white shadow-sm">
                  <CardHeader className="border-b border-sanad-border/60 pb-5">
                    <CardTitle className="font-serif text-xl font-bold text-sanad-emerald">
                      System Architecture &amp; Developer Attribution
                    </CardTitle>
                    <CardDescription className="text-xs text-sanad-slate">
                      Architectural overview and engineering provenance of the Sanad platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="p-5 rounded-2xl border border-sanad-gold/50 bg-gradient-to-br from-sanad-ivory via-sanad-ivory-warm/40 to-white">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sanad-gold-dark block mb-1">
                        Principal System Architect &amp; Developer
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-sanad-emerald">
                        Mohammed Khizer Shaikh
                      </h3>
                      <p className="text-xs text-sanad-slate mt-2 leading-relaxed">
                        Full-Stack System Engineering, Classical Isnad Verification Protocol Architecture, and Distributed Security Architecture for the Sanad Verified Scholarship Ecosystem.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <a
                          href="https://mohammedkhizershaikh.netlify.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sanad-emerald text-white text-xs font-bold hover:bg-sanad-emerald-deep transition-colors"
                        >
                          <span>Portfolio Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/mohammed-khizer-shaikh"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-sanad-border bg-white text-sanad-emerald text-xs font-bold hover:bg-sanad-ivory-warm transition-colors"
                        >
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-sanad-slate">
                      <div className="flex justify-between py-1.5 border-b border-sanad-border/40">
                        <span className="font-semibold text-sanad-emerald">Platform Core</span>
                        <span>Next.js 14, Framer Motion, shadcn UI, Tailwind CSS</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-sanad-border/40">
                        <span className="font-semibold text-sanad-emerald">Authentication Layer</span>
                        <span>Zero-Leakage SMTP Email OTP &amp; TOTP 2FA</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="font-semibold text-sanad-emerald">Academic Governance</span>
                        <span>Strict Separation: Member Web vs. Admin Console</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}