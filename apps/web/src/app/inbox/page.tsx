'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  CheckCircle2,
  MessageSquare,
  Video,
  Plus,
  Search,
  X,
  User as UserIcon,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { platformApi, Conversation } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Preloader, Spinner } from '../../components/Preloader';

function InboxMain() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetUserIdParam = searchParams.get('userId') || searchParams.get('to');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // New Chat Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchDirectoryQuery, setSearchDirectoryQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Initial load of conversations
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await platformApi.chat.getConversations();
        if (!isMounted) return;
        const list = res.conversations || [];
        setConversations(list);

        // If targetUserIdParam is specified in URL
        if (targetUserIdParam) {
          const existing = list.find(
            (c) => c.participant.id === targetUserIdParam || c.id === targetUserIdParam
          );
          if (existing) {
            setActiveConvId(existing.id);
          } else {
            // Fetch target user details to create a draft conversation
            try {
              const uRes = await platformApi.users.getUser(targetUserIdParam);
              if (uRes.user && isMounted) {
                const targetU = uRes.user;
                const draftConv: Conversation = {
                  id: targetUserIdParam,
                  participant: {
                    id: targetUserIdParam,
                    displayName: targetU.displayName || 'Academic Peer',
                    username: targetU.username || 'member',
                    avatarUrl: targetU.avatarUrl,
                    isScholar: Boolean(
                      targetU.scholarProfile?.verified || targetU.roles?.includes('scholar')
                    ),
                  },
                  lastMessage: 'New consultation thread',
                  lastMessageAt: 'Now',
                  unreadCount: 0,
                };
                setConversations((prev) => [draftConv, ...prev.filter((c) => c.id !== targetUserIdParam)]);
                setActiveConvId(targetUserIdParam);
              }
            } catch {
              if (list.length > 0) setActiveConvId(list[0].id);
            }
          }
        } else if (list.length > 0) {
          setActiveConvId(list[0].id);
        }
      } catch {
        if (isMounted) setConversations([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [targetUserIdParam]);

  // Load & continuously poll active conversation messages (every 2.5s)
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await platformApi.chat.getMessages(activeConvId);
        if (!isMounted) return;
        const newMsgs = res.messages || [];

        setMessages((prev) => {
          if (prev.length !== newMsgs.length) {
            return newMsgs;
          }
          const lastPrev = prev[prev.length - 1];
          const lastNew = newMsgs[newMsgs.length - 1];
          if (lastPrev?.id !== lastNew?.id || lastPrev?.text !== lastNew?.text) {
            return newMsgs;
          }
          return prev;
        });

        // If activeConvId was a temporary target user ID, update to permanent conversationId
        if (res.conversationId && res.conversationId !== activeConvId) {
          setActiveConvId(res.conversationId);
        }
      } catch {
        // Continue quietly
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConvId]);

  // Background thread poller for new incoming conversations and threads (every 3.5s)
  useEffect(() => {
    let isMounted = true;

    const pollThreads = async () => {
      try {
        const res = await platformApi.chat.getConversations();
        if (!isMounted || !res.conversations) return;

        setConversations((prev) => {
          const prevMap = new Map(prev.map((c) => [c.id, c.lastMessage]));
          const hasChange =
            prev.length !== res.conversations.length ||
            res.conversations.some((c) => prevMap.get(c.id) !== c.lastMessage);
          return hasChange ? res.conversations : prev;
        });

        // Auto-select first thread if none is currently selected
        if (!activeConvId && res.conversations.length > 0) {
          setActiveConvId(res.conversations[0].id);
        }
      } catch {
        // Silently continue polling
      }
    };

    const interval = setInterval(pollThreads, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConvId]);

  // Load user directory when new chat modal opens
  useEffect(() => {
    if (showNewModal) {
      setLoadingDirectory(true);
      platformApi.users
        .listUsers()
        .then((res) => {
          const myId = user?.id || (user as any)?._id;
          // Filter out current user from target selection
          const filtered = (res.users || []).filter((u) => {
            const uId = u._id || u.id;
            return uId !== myId;
          });
          setDirectoryUsers(filtered);
        })
        .catch(() => {
          setDirectoryUsers([]);
        })
        .finally(() => {
          setLoadingDirectory(false);
        });
    }
  }, [showNewModal, user?.id]);

  const selectUserForChat = (targetUser: any) => {
    const targetId = (targetUser._id || targetUser.id)?.toString();
    if (!targetId) return;

    setShowNewModal(false);

    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.participant.id === targetId || c.id === targetId
    );

    if (existing) {
      setActiveConvId(existing.id);
    } else {
      // Add draft conversation
      const isScholar = Boolean(
        targetUser.scholarProfile?.verified || targetUser.roles?.includes('scholar')
      );
      const draftConv: Conversation = {
        id: targetId,
        participant: {
          id: targetId,
          displayName: targetUser.displayName || 'Academic Peer',
          username: targetUser.username || 'member',
          avatarUrl: targetUser.avatarUrl,
          isScholar,
        },
        lastMessage: 'Direct consultation initiated',
        lastMessageAt: 'Just now',
        unreadCount: 0,
      };

      setConversations((prev) => [draftConv, ...prev.filter((c) => c.id !== targetId)]);
      setActiveConvId(targetId);
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    const tempMsgId = `msg-${Date.now()}`;
    const myId = user?.id || (user as any)?._id || 'me';
    const optimisticMsg = {
      id: tempMsgId,
      senderId: myId,
      text,
      createdAt: 'Just now',
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const sendRes = await platformApi.chat.sendMessage(activeConvId, text);
      if (sendRes?.conversationId && sendRes.conversationId !== activeConvId) {
        setActiveConvId(sendRes.conversationId);
      }

      // Refresh conversation list immediately
      const updatedRes = await platformApi.chat.getConversations();
      if (updatedRes.conversations && updatedRes.conversations.length > 0) {
        setConversations(updatedRes.conversations);
      }
    } catch (sendErr) {
      console.error('Send message error:', sendErr);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(
    (c) => c.id === activeConvId || c.participant.id === activeConvId
  );

  const filteredDirectoryUsers = directoryUsers.filter((u) => {
    const q = searchDirectoryQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (u.displayName || '').toLowerCase().includes(q);
    const userMatch = (u.username || '').toLowerCase().includes(q);
    const instMatch = (u.scholarProfile?.institution || '').toLowerCase().includes(q);
    const roleMatch = Array.isArray(u.roles) ? u.roles.some((r: string) => r.toLowerCase().includes(q)) : false;
    return nameMatch || userMatch || instMatch || roleMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sanad-gold-subtle text-sanad-gold-dark text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Consultations &amp; Direct Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sanad-emerald">
            Scholar &amp; Learner Channels
          </h1>
          <p className="text-sm text-sanad-muted mt-1">
            Exchange scholarly inquiries, isnad clarifications, and academic reflections with any verified teacher or registered student.
          </p>
        </div>

        <Button
          onClick={() => setShowNewModal(true)}
          className="self-start sm:self-auto gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Consultation</span>
        </Button>
      </div>

      {loading ? (
        <Preloader label="Opening Inbox..." description="Connecting to private consultation channels" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[640px] rounded-2xl border border-sanad-border bg-white shadow-sm overflow-hidden">
          {/* Left Column: Conversations List */}
          <div className="border-r border-sanad-border flex flex-col h-full bg-[#FAF8F5]">
            <div className="p-4 border-b border-sanad-border bg-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-sanad-emerald">
                Active Consultations ({conversations.length})
              </span>
              <button
                onClick={() => setShowNewModal(true)}
                className="text-xs font-bold text-sanad-gold-dark hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Start Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-sanad-border/60">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-sanad-muted space-y-3">
                  <div className="w-10 h-10 rounded-full bg-sanad-ivory-warm border border-sanad-gold/40 flex items-center justify-center text-sanad-gold-dark mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-sanad-charcoal">No open discussions yet.</p>
                  <p className="text-[11px] leading-relaxed">
                    Click &ldquo;Start Chat&rdquo; above to message any teacher, researcher, or fellow student.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewModal(true)}
                    className="w-full text-xs mt-2"
                  >
                    + Find User to Message
                  </Button>
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = c.id === activeConvId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-white shadow-inner border-l-4 border-l-sanad-emerald' : 'hover:bg-sanad-ivory-warm/60'
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
                })
              )}
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
                      {activeConv.participant.displayName ? activeConv.participant.displayName.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-sanad-charcoal flex items-center gap-1.5">
                        <span>{activeConv.participant.displayName}</span>
                        {activeConv.participant.isScholar && (
                          <Badge variant="gold" className="text-[10px] py-0 px-1.5">
                            Verified Faculty
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-sanad-muted">
                        @{activeConv.participant.username} &bull; Academic Channel
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={
                        activeConv.participant.isScholar
                          ? `/scholar/${activeConv.participant.id}`
                          : `/profile/${activeConv.participant.id}`
                      }
                    >
                      <Button variant="outline" size="sm" className="text-xs">
                        <UserIcon className="h-3.5 w-3.5 mr-1" />
                        View Dossier
                      </Button>
                    </Link>
                    <Link href={`/call/${activeConv.participant.id}`}>
                      <Button variant="gold" size="sm" className="text-xs">
                        <Video className="h-3.5 w-3.5 mr-1" />
                        Video Halaqah
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-xs text-sanad-muted max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-sanad-ivory-warm border border-sanad-gold/40 flex items-center justify-center text-sanad-gold-dark mx-auto mb-2">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sanad-emerald text-sm">Initiate Consultation</p>
                      <p className="leading-relaxed">
                        Send a message below to begin direct academic communication with {activeConv.participant.displayName}.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const myId = user?.id || (user as any)?._id;
                      const isMe = m.senderId === myId || m.senderId === 'me';
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
                  <div ref={messagesEndRef} />
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
                    placeholder={`Message ${activeConv.participant.displayName}...`}
                    className="flex-1 h-11 px-4 rounded-xl border border-sanad-border text-xs focus:outline-none focus:border-sanad-emerald"
                  />
                  <Button type="submit" disabled={sending || !inputText.trim()} className="h-11 px-5">
                    {sending ? (
                      <Spinner size={16} />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1.5" />
                        Send
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-sanad-muted space-y-3">
                <div className="w-12 h-12 rounded-full bg-sanad-ivory-warm border border-sanad-gold flex items-center justify-center text-sanad-gold-dark">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-sanad-emerald">
                  No Conversation Selected
                </h3>
                <p className="max-w-xs text-sanad-slate/80 leading-relaxed">
                  Select a consultation channel from the left sidebar or start a new chat with any registered user.
                </p>
                <Button size="sm" onClick={() => setShowNewModal(true)}>
                  + Start New Consultation
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Consultation / User Picker Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-sanad-border shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-sanad-border flex items-center justify-between bg-sanad-ivory-warm/40">
              <div>
                <h3 className="font-serif text-lg font-bold text-sanad-emerald">
                  Start New Consultation
                </h3>
                <p className="text-xs text-sanad-muted mt-0.5">
                  Select any faculty, researcher, or student to open a direct channel.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg text-sanad-muted hover:text-sanad-charcoal hover:bg-sanad-ivory-warm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-sanad-border bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sanad-muted" />
                <Input
                  value={searchDirectoryQuery}
                  onChange={(e) => setSearchDirectoryQuery(e.target.value)}
                  placeholder="Search by name, handle, or institution..."
                  className="pl-10 h-10 text-xs rounded-xl"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-sanad-border/60 p-2">
              {loadingDirectory ? (
                <div className="p-8 text-center text-xs text-sanad-muted flex flex-col items-center gap-2">
                  <Spinner size={20} />
                  <span>Loading directory members...</span>
                </div>
              ) : filteredDirectoryUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-sanad-muted">
                  No directory users matched &ldquo;{searchDirectoryQuery}&rdquo;.
                </div>
              ) : (
                filteredDirectoryUsers.map((u) => {
                  const uId = u._id || u.id;
                  const isScholar = Boolean(u.scholarProfile?.verified || u.roles?.includes('scholar'));
                  return (
                    <button
                      key={uId}
                      onClick={() => selectUserForChat(u)}
                      className="w-full text-left p-3 rounded-xl hover:bg-sanad-ivory-warm transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-sanad-emerald text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {u.displayName ? u.displayName.charAt(0) : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-sanad-charcoal flex items-center gap-1.5 truncate">
                            <span>{u.displayName}</span>
                            {isScholar && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-sanad-emerald shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-sanad-muted truncate">
                            @{u.username || 'user'}{' '}
                            {u.scholarProfile?.institution ? `• ${u.scholarProfile.institution}` : ''}
                          </div>
                        </div>
                      </div>

                      <Badge variant={isScholar ? 'gold' : 'outline'} className="text-[10px] shrink-0">
                        {isScholar ? 'Faculty' : 'Member'}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-sanad-border bg-sanad-ivory/50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowNewModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<Preloader label="Opening Inbox..." description="Connecting to private consultation channels" />}>
      <InboxMain />
    </Suspense>
  );
}
