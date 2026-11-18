'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileSearch,
  Users,
  Award,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function ScholarStatusPage() {
  const steps = [
    {
      title: 'Dossier Submission',
      desc: 'Digital certificates, Ijazahs, and biographical curriculum received',
      status: 'completed',
      date: '17 Nov 2026',
      icon: CheckCircle2,
    },
    {
      title: 'Credential & Isnad Audit',
      desc: 'Independent verification of teacher seals, unbroken chains, and university transcripts',
      status: 'completed',
      date: '18 Nov 2026',
      icon: FileSearch,
    },
    {
      title: 'Academic Council Review',
      desc: 'Senior faculty council deliberating on methodological integrity and research standing',
      status: 'current',
      date: 'In Progress',
      icon: Users,
    },
    {
      title: 'Accreditation & Faculty Key Issuance',
      desc: 'Public verified scholar badge and unconstrained pedagogical publishing enabled',
      status: 'pending',
      date: 'Expected in 48 hours',
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Feed</span>
          </Link>
          <Badge variant="gold" className="text-xs">
            Application #SND-8492
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-sanad-border bg-white shadow-sm overflow-hidden mb-6">
            <CardHeader className="border-b border-sanad-border/60 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-sanad-gold" />
                    Accreditation Status
                  </CardTitle>
                  <CardDescription className="text-xs text-sanad-slate mt-1">
                    Tracking real-time verification progression for prospective faculty
                  </CardDescription>
                </div>
                <Badge variant="hasan" className="text-xs">
                  Active Review
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                {steps.map((s, index) => {
                  const Icon = s.icon;
                  const isCompleted = s.status === 'completed';
                  const isCurrent = s.status === 'current';
                  const isLast = index === steps.length - 1;

                  return (
                    <div key={s.title} className="relative flex items-start gap-4">
                      {/* Vertical line */}
                      {!isLast && (
                        <div
                          className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-sanad-border'
                          }`}
                        />
                      )}

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-sanad-gold text-white animate-pulse'
                            : 'bg-sanad-ivory-warm text-sanad-slate border border-sanad-border'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-sanad-emerald">{s.title}</h4>
                          <span className="text-[11px] font-semibold text-sanad-slate">{s.date}</span>
                        </div>
                        <p className="text-xs text-sanad-slate mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-sanad-border/60 bg-sanad-ivory-warm/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-sanad-emerald block">
                    Have additional Ijazah documents to submit?
                  </span>
                  <span className="text-[11px] text-sanad-slate">
                    You can append supplementary materials directly to your active file.
                  </span>
                </div>
                <Link href="/scholar/apply">
                  <Button variant="outline" size="sm" className="text-xs">
                    Append Files
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}
