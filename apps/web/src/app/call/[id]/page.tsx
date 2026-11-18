'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, ShieldCheck, Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { platformApi } from '../../../lib/api';

export default function ConsultationCallPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params?.id as string;

  const [partner, setPartner] = useState<any | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sessionNotes, setSessionNotes] = useState(
    'Consultation notes and Hadith transmission references discussed during this session.'
  );

  useEffect(() => {
    if (!partnerId) return;
    platformApi.users
      .getUser(partnerId)
      .then((res) => {
        setPartner(res.user);
      })
      .catch(() => {
        setPartner(null);
      });
  }, [partnerId]);

  const partnerName = partner?.displayName || 'Faculty Fellow';
  const partnerInstitution = partner?.scholarProfile?.institution || 'Sanad Academic Foundation';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Badge variant="gold" className="mb-1">Encrypted Academic Consultation</Badge>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-sanad-emerald">
            Live Consultation with {partnerName}
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
              <span>Live Consultation</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full text-xs font-bold text-sanad-gold backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Isnad Transmit</span>
            </div>
          </div>

          {/* Central Scholar Visual Simulation */}
          <div className="flex-1 flex flex-col items-center justify-center text-center select-none">
            <div className="w-24 h-24 rounded-full bg-sanad-emerald border-2 border-sanad-gold flex items-center justify-center font-arabic text-3xl font-bold text-sanad-gold shadow-lg mb-3">
              {partnerName.charAt(0)}
            </div>
            <h2 className="text-lg font-bold font-serif text-white">{partnerName}</h2>
            <p className="text-xs text-white/70">{partnerInstitution}</p>
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
              Session Notes
            </h3>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={12}
              className="w-full text-xs text-sanad-slate leading-relaxed border border-sanad-border rounded-xl p-3 focus:outline-none focus:border-sanad-emerald resize-none"
              placeholder="Record narrator names, book page numbers, and questions..."
            />
          </div>

          <div className="pt-4 border-t border-sanad-border/80">
            <span className="text-[10px] text-sanad-muted block mb-2">
              All discussions are encrypted and bound by Sanad academic integrity governance.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => alert('Session notes saved locally.')}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
