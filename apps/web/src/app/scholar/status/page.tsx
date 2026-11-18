'use client';

import React, { useState, useEffect } from 'react';
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
  GraduationCap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import Preloader from '../../../components/Preloader';
import { platformApi } from '../../../lib/api';

export default function ScholarStatusPage() {
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.scholar
      .getStatus()
      .then((res) => {
        setApplication(res.application);
      })
      .catch(() => {
        setApplication(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Preloader fullScreen label="Checking Application Dossier..." description="Accessing verification registry records" />;
  }

  if (!application) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 max-w-2xl mx-auto text-center">
        <Card className="p-10 border-dashed border-2 border-sanad-border bg-white shadow-sm">
          <div className="w-14 h-14 rounded-full bg-sanad-ivory-warm border border-sanad-gold/40 flex items-center justify-center text-sanad-gold-dark mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-sanad-emerald mb-2">
            No Active Accreditation Application
          </h2>
          <p className="text-xs text-sanad-muted max-w-md mx-auto mb-6 leading-relaxed">
            You have not yet submitted a faculty accreditation application. Accredited scholars are granted unconstrained Hadith publishing, isnad breakdown authorization, and verified public faculty credentials.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/scholar/apply">
              <Button variant="gold" size="sm">
                Apply for Faculty Accreditation
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="outline" size="sm">
                Return to Knowledge Feed
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isApproved = application.status === 'approved';
  const isUnderReview = application.status === 'under_review';
  const isPending = application.status === 'pending';
  const isRejected = application.status === 'rejected';

  const steps = [
    {
      title: 'Dossier Submission',
      desc: `Submitted for institution: ${application.institution || 'Classical Studies'}`,
      status: 'completed',
      date: new Date(application.createdAt).toLocaleDateString(),
      icon: CheckCircle2,
    },
    {
      title: 'Credential & Isnad Audit',
      desc: `${application.credentials?.length || 1} credential document(s) uploaded for verification`,
      status: isPending ? 'current' : 'completed',
      date: isPending ? 'In Progress' : 'Audited',
      icon: FileSearch,
    },
    {
      title: 'Academic Council Review',
      desc: 'Sanad governance committee evaluating methodology and unbroken transmission credentials',
      status: isUnderReview ? 'current' : isApproved ? 'completed' : isPending ? 'pending' : 'completed',
      date: isUnderReview ? 'In Deliberation' : isApproved ? 'Approved' : 'Pending Queue',
      icon: Users,
    },
    {
      title: 'Faculty Key & Verified Status',
      desc: isApproved
        ? 'Accreditation granted. Verified Scholar badge issued.'
        : isRejected
        ? `Application concluded: ${application.reviewNote || 'Review criteria unmet'}`
        : 'Awaiting council final resolution',
      status: isApproved ? 'completed' : isRejected ? 'rejected' : 'pending',
      date: isApproved ? 'Granted' : isRejected ? 'Concluded' : 'Pending',
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
          Application #{application._id?.toString().slice(-6).toUpperCase() || 'LIVE'}
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
                  Tracking verification progression in the Sanad Academic Council
                </CardDescription>
              </div>
              <Badge variant={isApproved ? 'gold' : isRejected ? 'destructive' : 'hasan'} className="text-xs capitalize">
                {application.status?.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              {steps.map((s, index) => {
                const Icon = s.icon;
                const isCompleted = s.status === 'completed';
                const isCurrent = s.status === 'current';
                const isStepRejected = s.status === 'rejected';
                const isLast = index === steps.length - 1;

                return (
                  <div key={s.title} className="relative flex items-start gap-4">
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
                          : isStepRejected
                          ? 'bg-rose-600 text-white'
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
