'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, MessageSquare, PhoneCall, Video } from 'lucide-react';
import { platformApi, Conversation } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export default function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    platformApi.chat.getConversations().then((res) => {
      setConversations(res.conversations);
      if (res.conversations.length > 0) {
        setActiveConvId(res.conversations[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    platformApi.chat.getMessages(activeConvId).then((res) => {
      setMessages(res.messages);
    });
  }, [activeConvId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'user-me',
      text: inputText.trim(),
      createdAt: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    await platformApi.chat.sendMessage(activeConvId, newMsg.text);
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sanad-emerald">
          Scholar Consultations &amp; Direct Discussions
        </h1>
        <p className="text-sm text-sanad-muted mt-1">
          Direct communication channels with verified faculty fellows and registered study groups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[620px] rounded-2xl border border-sanad-border bg-white shadow-sm overflow-hidden">
        {/* Left Column: Conversations List */}
        <div className="border-r border-sanad-border overflow-y-auto">
          <div className="p-4 border-b border-sanad-border bg-sanad-ivory-warm/40 font-bold text-xs uppercase tracking-wider text-sanad-emerald">
            Active Consultations ({conversations.length})
          </div>

          <div className="divide-y divide-sanad-border/60">
            {conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-sanad-ivory-warm' : 'hover:bg-sanad-ivory'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-sanad-emerald text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {c.participant.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-xs text-sanad-charcoal truncate flex items-center gap-1">
                        <span>{c.participant.displayName}</span>
                        {c.participant.isScholar && (
                          <CheckCircle2 className="h-3 w-3 text-sanad-emerald shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-sanad-muted shrink-0">{c.lastMessageAt}</span>
                    </div>
                    <p className="text-xs text-sanad-muted truncate">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Chat Area */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-[#FAF8F5]">
          {/* Chat Header */}
          {activeConv ? (
            <div className="p-4 border-b border-sanad-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sanad-ivory-warm border border-sanad-gold flex items-center justify-center text-xs font-bold text-sanad-emerald">
                  {activeConv.participant.displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-sanad-charcoal flex items-center gap-1">
                    <span>{activeConv.participant.displayName}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-sanad-emerald" />
                  </div>
                  <div className="text-[11px] text-sanad-muted">
                    Accredited Faculty &bull; Active Consultative Link
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/call/${activeConv.id}`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-sanad-emerald">
                    <Video className="h-3.5 w-3.5" />
                    <span>Join Consultation</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-sanad-border bg-white font-bold text-xs">
              Select a conversation
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isMe = m.senderId === 'user-me' || m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-sanad-emerald text-white rounded-br-none shadow-sm'
                        : 'bg-white text-sanad-charcoal border border-sanad-border rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-sanad-muted mt-1 px-1">
                    {m.createdAt}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-sanad-border flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Inquire with faculty regarding text transmission or variant..."
              className="flex-1 h-11 px-4 rounded-xl border border-sanad-border text-xs focus:outline-none focus:border-sanad-emerald bg-sanad-ivory"
            />
            <Button type="submit" size="default" className="h-11 px-5">
              <Send className="h-4 w-4 mr-1.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

