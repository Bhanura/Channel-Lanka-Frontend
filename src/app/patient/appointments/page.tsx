'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import Link from 'next/link';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/patients/appointments').then(r => setAppointments(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${id}/cancel`);
    setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status: 'cancelled' } : a));
  };

  const statusBadge: Record<string, string> = { booked: 'badge-warning', confirmed: 'badge-success', completed: 'badge-muted', cancelled: 'badge-danger', no_show: 'badge-danger' };
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <DashboardShell title="My Appointments" subtitle="View and manage your bookings">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'booked', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: filter === s ? 'var(--primary-600)' : 'var(--primary-50)', color: filter === s ? '#fff' : 'var(--text-secondary)' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map(a => (
            <div key={a.appointment_id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.channel_sessions?.doctors?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--primary-600)' }}>{a.channel_sessions?.doctors?.specialization}</div>
                    </div>
                    <span className={`badge ${statusBadge[a.status] || 'badge-muted'}`}>{a.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={13} />{a.channel_sessions?.date}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Clock size={13} />{a.channel_sessions?.start_time}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={13} />{a.channel_sessions?.rooms?.channeling_centers?.name}</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 20, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Token: <strong>#{a.appointment_number}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Amount: <strong style={{ color: a.payments?.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>LKR {a.payments?.total_amount || '—'}</strong></span>
                  </div>
                </div>
                {a.status === 'booked' && (
                  <button className="btn btn-sm" style={{ background: '#ffebee', color: 'var(--danger)' }} onClick={() => cancel(a.appointment_id)}>
                    <XCircle size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No appointments found.</div>}
        </div>
      )}
    </DashboardShell>
  );
}
