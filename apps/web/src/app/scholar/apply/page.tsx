'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Spinner } from '../../../components/Preloader';

interface CredentialEntry {
  type: 'ijazah' | 'degree' | 'certification';
  title: string;
  institution: string;
  year: number;
  fileName: string;
}

export default function ScholarApplyPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [institution, setInstitution] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('Arabic, English');
  const [statement, setStatement] = useState('');
  const [endorsementEmail, setEndorsementEmail] = useState('');
  const [credentials, setCredentials] = useState<CredentialEntry[]>([
    {
      type: 'ijazah',
      title: 'Ijazah in Kutub al-Sittah with Connected Isnad',
      institution: 'Dar al-Hadith Seminary',
      year: 2021,
      fileName: 'ijazah_kutub_sittah.pdf',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddCredential = () => {
    setCredentials([
      ...credentials,
      {
        type: 'ijazah',
        title: '',
        institution: institution || '',
        year: new Date().getFullYear(),
        fileName: 'academic_certificate.pdf',
      },
    ]);
  };

  const handleRemoveCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
  };

  const handleUpdateCredential = (index: number, field: keyof CredentialEntry, value: any) => {
    const updated = [...credentials];
    updated[index] = { ...updated[index], [field]: value };
    setCredentials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!institution.trim() || !specialties.trim()) {
      setError('Please provide your primary institution and scholarly specialties.');
      setStep(1);
      return;
    }

    if (credentials.length === 0) {
      setError('At least one authentic Ijazah or University Degree document must be declared.');
      setStep(2);
      return;
    }

    if (!statement.trim()) {
      setError('Please provide a statement of scholarly methodology.');
      setStep(3);
      return;
    }

    setLoading(true);

    try {
      // Simulate submission to verification queue
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => {
        router.push('/scholar/status');
      }, 1500);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            Faculty Accreditation Dossier
          </Badge>
        </div>

        {/* Step indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { num: 1, title: 'Affiliation & Fields' },
            { num: 2, title: 'Ijazahs & Degrees' },
            { num: 3, title: 'Methodology & Ethics' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-center transition-all ${
                step === s.num
                  ? 'border-sanad-gold bg-sanad-gold-subtle text-sanad-emerald font-bold'
                  : step > s.num
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-sanad-border bg-white text-sanad-slate'
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest block">Step {s.num}</span>
              <span className="text-xs font-semibold">{s.title}</span>
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-sanad-border bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-sanad-border/60 pb-6">
              <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-sanad-gold" />
                Scholar Accreditation Application
              </CardTitle>
              <CardDescription className="text-xs text-sanad-slate">
                To preserve authentic transmission, Sanad requires all publishing scholars to complete academic and lineage verification
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Application submitted successfully! Redirecting to tracker...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Institutional Affiliation / Classical Seminary *
                      </label>
                      <Input
                        placeholder="e.g. Al-Azhar University, Islamic University of Madinah, Darul Uloom"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Disciplines &amp; Specialties (comma-separated) *
                      </label>
                      <Input
                        placeholder="e.g. Hadith Sciences, Usul al-Fiqh, Arabic Grammar, Hanafi/Shafi'i Fiqh"
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Teaching Languages *
                      </label>
                      <Input
                        placeholder="e.g. Arabic, English, Urdu, Turkish"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!institution.trim() || !specialties.trim()) {
                            setError('Please fill in both institution and specialties.');
                            return;
                          }
                          setError(null);
                          setStep(2);
                        }}
                      >
                        <span>Next: Credentials &amp; Documents</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                          Declared Ijazahs &amp; Degrees *
                        </label>
                        <span className="text-[11px] text-sanad-slate">
                          Traditional chains of transmission or accredited graduate degrees
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCredential}
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Credential
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {credentials.map((c, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory/30 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-sanad-emerald">
                              Document #{i + 1}
                            </span>
                            {credentials.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCredential(i)}
                                className="text-sanad-slate hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <select
                              value={c.type}
                              onChange={(e) => handleUpdateCredential(i, 'type', e.target.value)}
                              className="h-9 px-2 rounded-lg border border-sanad-border bg-white text-xs"
                            >
                              <option value="ijazah">Traditional Ijazah</option>
                              <option value="degree">University Degree</option>
                              <option value="certification">Academic Certificate</option>
                            </select>

                            <Input
                              placeholder="Title / Discipline"
                              value={c.title}
                              onChange={(e) => handleUpdateCredential(i, 'title', e.target.value)}
                              className="h-9 text-xs sm:col-span-2"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <Input
                              placeholder="Issuing Institute or Teacher"
                              value={c.institution}
                              onChange={(e) => handleUpdateCredential(i, 'institution', e.target.value)}
                              className="h-9 text-xs"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Year"
                                value={c.year}
                                onChange={(e) => handleUpdateCredential(i, 'year', Number(e.target.value))}
                                className="h-9 text-xs w-24"
                              />
                              <div className="flex-1 px-3 py-1.5 rounded-lg border border-dashed border-sanad-border bg-white text-[11px] text-sanad-slate flex items-center justify-between">
                                <span className="truncate">{c.fileName}</span>
                                <Upload className="w-3.5 h-3.5 text-sanad-gold shrink-0" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (credentials.length === 0) {
                            setError('Please declare at least one credential.');
                            return;
                          }
                          setError(null);
                          setStep(3);
                        }}
                      >
                        <span>Next: Methodology Statement</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Statement of Methodology &amp; Classical Curriculum *
                      </label>
                      <textarea
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                        placeholder="Detail your curriculum of studied texts, teachers with connected chains, and adherence to authentic classical consensus..."
                        rows={5}
                        className="w-full p-3.5 rounded-xl border border-sanad-border bg-white text-sm text-sanad-charcoal focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Peer Scholar Endorsement (Email Address)
                      </label>
                      <Input
                        type="email"
                        placeholder="endorser@sanad.accredited"
                        value={endorsementEmail}
                        onChange={(e) => setEndorsementEmail(e.target.value)}
                      />
                      <span className="text-[10px] text-sanad-slate block">
                        Optional: An already accredited Sanad faculty member who can attest to your credentials
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-sanad-gold/40 bg-sanad-gold-subtle/40 flex items-start gap-3 text-xs text-sanad-slate">
                      <ShieldCheck className="w-5 h-5 text-sanad-gold-dark shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sanad-emerald block">Scholarly Integrity Pledge</span>
                        <p className="mt-0.5">
                          By submitting, you pledge under oath that all submitted Ijazahs and academic claims reflect authentic historical study.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(2)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Spinner size={16} />
                            Submitting Dossier...
                          </span>
                        ) : (
                          'Submit Accreditation Dossier'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}
