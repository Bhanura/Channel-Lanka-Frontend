'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchSessions = () => {
    setLoading(true);
    api.get('/doctors/sessions').then(r => setSessions(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return alert("Please provide a reason for cancellation");
    setIsCanceling(true);
    try {
      await api.post(`/sessions/${cancelingId}/cancel-by-doctor`, { reason: cancelReason });
      setCancelingId(null);
      setCancelReason("");
      fetchSessions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to cancel session');
    } finally {
      setIsCanceling(false);
    }
  };

  const statusColor: Record<string, string> = { scheduled: 'badge-info', active: 'badge-success', completed: 'badge-muted', cancelled: 'badge-danger' };

  return (
    <DashboardShell title="My Sessions" subtitle="All your scheduled channeling sessions">
      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {sessions.map(s => (
            <div key={s.session_id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{s.rooms?.channeling_centers?.name}</div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={13} />{s.date}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Clock size={13} />{s.start_time} – {s.end_time}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Users size={13} />
                      <strong>{s.appointments?.[0]?.count || 0}</strong> / {s.patient_limit} patients
                    </span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Room: {s.rooms?.name} · Fee: LKR {s.doctor_fee}
                  </div>
                </div>
                <span className={`badge ${statusColor[s.status] || 'badge-muted'}`}>{s.status}</span>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                {['scheduled', 'active'].includes(s.status) && (
                  <Link href={`/doctor/sessions/${s.session_id}/queue`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }}>
                    Manage Queue
                  </Link>
                )}
                {s.status === 'scheduled' && (
                  <button onClick={() => setCancelingId(s.session_id)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '6px 12px', fontSize: 13 }}>
                    Cancel Session
                  </button>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No sessions found. Register at a channeling center to start receiving sessions.</div>}
        </div>
      )}

      {cancelingId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, margin: 0 }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: 18 }}>
              <AlertCircle size={20} /> Cancel Session
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 12 }}>
              Are you sure you want to cancel this session? This action cannot be undone. All appointed patients will be refunded and notified.
            </p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Reason for Cancellation</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="E.g., Unexpected medical emergency..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => { setCancelingId(null); setCancelReason(""); }} disabled={isCanceling}>Keep Session</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleCancel} disabled={isCanceling}>
                {isCanceling ? 'Canceling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
