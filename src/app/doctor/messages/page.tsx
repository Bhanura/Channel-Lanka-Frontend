'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Send, Building2 } from 'lucide-react';

function DoctorMessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const defaultCenter = searchParams.get('center');

  const [threads, setThreads] = useState<any[]>([]);
  const [activeCenter, setActiveCenter] = useState<string | null>(defaultCenter);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/doctors/profile').then(r => setDoctorProfile(r.data.data));
    fetchThreads();
  }, []);

  const fetchThreads = () => {
    setLoadingThreads(true);
    api.get('/messages/threads')
      .then(r => setThreads(r.data.data || []))
      .finally(() => setLoadingThreads(false));
  };

  useEffect(() => {
    if (!activeCenter || !doctorProfile) return;
    setLoadingMsgs(true);
    api.get(`/messages/thread?doctorId=${doctorProfile.doctor_id}&centerId=${activeCenter}`)
      .then(r => {
        setMessages(r.data.data || []);
        api.patch(`/messages/thread/${activeCenter}/read`);
      })
      .finally(() => setLoadingMsgs(false));
  }, [activeCenter, doctorProfile]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeCenter || !doctorProfile) return;

    // Find center admin's user ID to send to (this requires backend to handle if we don't know the exact receiver id)
    // Actually the backend just needs receiverId. But wait, if a doctor messages a center, they message the center admin.
    // I will fetch the center admin's user_id from the threads or we can just send it and the backend might handle it.
    // Let's find the receiver ID from the thread if possible.
    let receiverId = null;
    const thread = threads.find(t => t.center_id === activeCenter);
    if (thread) {
      receiverId = thread.sender_id === user?.user_id ? thread.receiver_id : thread.sender_id;
    }

    if (!receiverId) {
      // If we don't have a receiverId from thread, we might need a separate API call to get center admin.
      // But for simplicity, the center connection request should have initiated a thread.
      alert("Cannot send message: Receiver not found.");
      return;
    }

    try {
      const res = await api.post('/messages/send', {
        receiverId,
        centerId: activeCenter,
        content: newMessage
      });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
      fetchThreads(); // update latest message
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell title="Messages" subtitle="Communicate with your channeling centers">
      <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 24 }}>
        
        {/* Threads List */}
        <div className="card" style={{ width: 320, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header"><div style={{ fontWeight: 600 }}>Conversations</div></div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingThreads ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
              threads.map(t => (
                <div key={t.id} onClick={() => setActiveCenter(t.center_id)}
                  style={{ padding: 16, borderBottom: '1px solid var(--border)', cursor: 'pointer', background: activeCenter === t.center_id ? 'var(--primary-50)' : 'transparent', borderLeft: activeCenter === t.center_id ? '4px solid var(--primary-600)' : '4px solid transparent' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={18} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{t.channeling_centers?.name || 'Center'}</div>
                      <div style={{ fontSize: 12, color: t.is_read || t.sender_id === user?.user_id ? 'var(--text-secondary)' : 'var(--primary-600)', fontWeight: t.is_read || t.sender_id === user?.user_id ? 400 : 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {t.sender_id === user?.user_id ? 'You: ' : ''}{t.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {threads.length === 0 && !loadingThreads && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No messages yet.</div>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeCenter ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 600 }}>{threads.find(t => t.center_id === activeCenter)?.channeling_centers?.name || 'Chat'}</div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loadingMsgs ? <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading messages…</div> : (
                  messages.map(m => {
                    const isMe = m.sender_id === user?.user_id;
                    return (
                      <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', background: isMe ? 'var(--primary-600)' : 'var(--surface-2)', color: isMe ? '#fff' : 'var(--text-primary)', padding: '10px 16px', borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0', fontSize: 14 }}>
                          {m.content}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                  <input className="form-input" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message…" style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}><Send size={16} /></button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}

export default function DoctorMessagesPage() {
  return (
    <Suspense fallback={<div>Loading messages...</div>}>
      <DoctorMessagesContent />
    </Suspense>
  );
}

