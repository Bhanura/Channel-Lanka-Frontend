'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Send, User } from 'lucide-react';

export default function CenterMessagesPage() {
  const { user } = useAuth();

  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  
  const [threads, setThreads] = useState<any[]>([]);
  const [activeDoctor, setActiveDoctor] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    setLoadingThreads(true);
    // get threads for center
    // Note: the backend `/messages/threads` returns threads grouped by center.
    // Let's fetch all and filter by this center
    api.get('/messages/threads')
      .then(r => {
        // Find threads where this center is involved
        // But backend `getMyThreads` groups by center, meaning there's only 1 latest message per center...
        // Wait, for center admins, `getMyThreads` will return 1 message per center?
        // Ah, `getMyThreads` groups by `center_id`! If a center admin has multiple doctors, it will ONLY return 1 doctor per center!
        // That's a bug in `messages.service.js` for center admins! Let me fetch the doctors for this center and build the threads list manually.
      })
      .finally(() => setLoadingThreads(false));
  }, [selectedCenter]);

  // Temporary workaround: fetch registered doctors and use them as thread list
  const [doctors, setDoctors] = useState<any[]>([]);
  
  useEffect(() => {
    if (!selectedCenter) return;
    api.get(`/centers/${selectedCenter}/doctors`).then(r => setDoctors(r.data.data || []));
  }, [selectedCenter]);


  useEffect(() => {
    if (!activeDoctor || !selectedCenter) return;
    setLoadingMsgs(true);
    api.get(`/messages/thread?doctorId=${activeDoctor}&centerId=${selectedCenter}`)
      .then(r => {
        setMessages(r.data.data || []);
        api.patch(`/messages/thread/${selectedCenter}/read`);
      })
      .finally(() => setLoadingMsgs(false));
  }, [activeDoctor, selectedCenter]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeDoctor || !selectedCenter) return;

    // Find doctor's user_id
    const doctorUserId = doctors.find(d => d.doctor_id === activeDoctor)?.doctors?.user_id;

    if (!doctorUserId) {
      alert("Cannot send message: Doctor user not found.");
      return;
    }

    try {
      const res = await api.post('/messages/send', {
        receiverId: doctorUserId,
        centerId: selectedCenter,
        content: newMessage
      });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell title="Messages" subtitle="Communicate with your registered doctors">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => { setSelectedCenter(e.target.value); setActiveDoctor(null); }}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 24 }}>
        
        {/* Doctors List */}
        <div className="card" style={{ width: 320, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header"><div style={{ fontWeight: 600 }}>Registered Doctors</div></div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {doctors.map(d => (
              <div key={d.doctor_id} onClick={() => setActiveDoctor(d.doctor_id)}
                style={{ padding: 16, borderBottom: '1px solid var(--border)', cursor: 'pointer', background: activeDoctor === d.doctor_id ? 'var(--primary-50)' : 'transparent', borderLeft: activeDoctor === d.doctor_id ? '4px solid var(--primary-600)' : '4px solid transparent' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{d.doctors?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.doctors?.specialization}</div>
                  </div>
                </div>
              </div>
            ))}
            {doctors.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No doctors registered.</div>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeDoctor ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a doctor to start messaging
            </div>
          ) : (
            <>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 600 }}>{doctors.find(d => d.doctor_id === activeDoctor)?.doctors?.name}</div>
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
                {messages.length === 0 && !loadingMsgs && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No messages in this conversation.</div>}
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

