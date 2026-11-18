'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, MessageSquare, Video } from 'lucide-react';
import { platformApi, Conversation } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import Preloader from '../../components/Preloader';

export default function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    platformApi.chat
      .getConversations()
      .then((res) => {
        const list = res.conversations || [];
        setConversations(list);
        if (list.length > 0) {
          setActiveConvId(list[0].id);
        }
      })
      .catch(() => {
        setConversations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    platformApi.chat
      .getMessages(activeConvId)
      .then((res) => {
        setMessages(res.messages || []);
      })
      .catch(() => {
        setMessages([]);
      });
  }, [activeConvId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const text = inputText.trim();
    setInputText('');

    const optimisticMsg = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'me',
      text,
      createdAt: 'Just now',
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await platformApi.chat.sendMessage(activeConvId, text);
    } catch {
      // Revert or refresh on failure
    }
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

      {loading ? (
        <Preloader label="Opening Inbox..." description="Connecting to private consultation channels" />
      ) : conversations.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-sanad-ivory-warm border border-sanad-gold/40 flex items-center justify-center text-sanad-gold-dark mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-sanad-emerald mb-2">
            No Active Consultations Yet
          </h2>
          <p className="text-xs text-sanad-muted max-w-md mx-auto mb-6 leading-relaxed">
            You do not currently have any active direct consultation channels open with scholars or fellow learners. Browse the Explore Directory to initiate a consultation.
          </p>
          <Link href="/explore">
            <Button variant="default" size="sm" className="text-xs">
              Explore Faculty Directory
            </Button>
          </Link>
        </Card>
      ) : (
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
                    <div className="w-10 h-10 rounded-full bg-sanad-emerald text-white font-bold flex items-center justify-center text-xs shrink-0 select-none">
                      {c.participant.displayName ? c.participant.displayName.charAt(0) : 'U'}
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

          {/* Right 2 Columns: Chat Thread */}
          <div className="md:col-span-2 flex flex-col justify-between h-full bg-[#FCFBF8]">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-sanad-border bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sanad-emerald text-white font-bold flex items-center justify-center text-xs">
                      {activeConv.participant.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-sanad-charcoal flex items-center gap-1.5">
                        <span>{activeConv.participant.displayName}</span>
                        {activeConv.participant.isScholar && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-sanad-emerald" />
                        )}
                      </div>
                      <div className="text-[11px] text-sanad-muted">@{activeConv.participant.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/call/${activeConv.participant.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Video className="h-3.5 w-3.5 mr-1" />
                        Video Halaqah
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-sanad-muted">
                      No messages yet in this consultation. Send a note below to start the discussion.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === user?.id || m.senderId === 'me';
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-sanad-emerald text-white rounded-br-none'
                                : 'bg-white text-sanad-charcoal border border-sanad-border rounded-bl-none'
                            }`}
                          >
                            <p>{m.text}</p>
                            <span
                              className={`text-[9px] block text-right mt-1.5 ${
                                isMe ? 'text-white/60' : 'text-sanad-muted'
                              }`}
                            >
                              {m.createdAt}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-sanad-border bg-white flex gap-3"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your question or academic inquiry..."
                    className="flex-1 h-11 px-4 rounded-xl border border-sanad-border text-xs focus:outline-none focus:border-sanad-emerald"
                  />
                  <Button type="submit" className="h-11 px-5">
                    <Send className="h-4 w-4 mr-1.5" />
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-sanad-muted">
                Select a consultation from the list on the left.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
