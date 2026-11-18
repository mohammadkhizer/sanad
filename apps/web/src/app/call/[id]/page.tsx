'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, ShieldCheck, Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function ConsultationCallPage() {
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sessionNotes, setSessionNotes] = useState(
    'Discussing authentication of tradition: "Innamal A’malu bin-Niyyat" and transmitter continuous chain.'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Badge variant="gold" className="mb-1">Encrypted Academic Consultation</Badge>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-sanad-emerald">
            Live Consultation with Senior Hadith Fellow
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/inbox')}>
          Return to Inbox
        </Button>
      </div>

      {/* Main Video Consultation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-2xl bg-[#072924] border-2 border-sanad-border h-[520px] relative overflow-hidden flex flex-col justify-between p-6 text-white shadow-2xl">
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live &bull; 14:32</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-xs font-bold text-sanad-gold backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Isnad Transmit</span>
            </div>
          </div>

          {/* Central Scholar Visual Simulation */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-sanad-emerald border-2 border-sanad-gold flex items-center justify-center font-arabic text-3xl font-bold text-sanad-gold shadow-lg mb-3">
              سند
            </div>
            <h2 className="text-lg font-bold font-serif text-white">Senior Hadith Department Fellow</h2>
            <p className="text-xs text-white/70">Dar al-Hadith Classical Seminary</p>
          </div>

          {/* Picture-in-Picture Student Video */}
          <div className="absolute right-6 bottom-24 w-36 h-24 rounded-xl border border-white/20 bg-black/70 flex items-center justify-center text-xs text-white/80 overflow-hidden shadow-md">
            {videoOn ? (
              <span className="font-semibold">Student Camera</span>
            ) : (
              <span className="text-white/40">Camera Disabled</span>
            )}
          </div>

          {/* In-Call Media Control Bar */}
          <div className="flex items-center justify-center gap-3 z-10 pt-4 border-t border-white/10">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full transition-colors ${
                micOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-rose-600 text-white'
              }`}
              title={micOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full transition-colors ${
                videoOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-rose-600 text-white'
              }`}
              title={videoOn ? 'Disable Camera' : 'Enable Camera'}
            >
              {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            <button
              onClick={() => router.push('/inbox')}
              className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Leave Consultation</span>
            </button>
          </div>
        </div>

        {/* Sidebar Consultation Notes */}
        <div className="rounded-2xl border border-sanad-border bg-white p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-sanad-emerald mb-3">
              Consultation Reference Notes
            </h3>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-lg border border-sanad-border text-xs focus:outline-none focus:border-sanad-emerald leading-relaxed"
            />
            <p className="text-[11px] text-sanad-muted mt-2">
              All references are timestamped and linked to your study notebook.
            </p>
          </div>

          <Button variant="default" size="sm" className="w-full mt-4">
            Save Notes to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

