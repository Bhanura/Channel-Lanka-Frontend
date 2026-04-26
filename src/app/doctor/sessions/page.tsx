'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/sessions').then(r => setSessions(r.data.data || [])).finally(() => setLoading(false));
  }, []);

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
            </div>
          ))}
          {sessions.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No sessions found. Register at a channeling center to start receiving sessions.</div>}
        </div>
      )}
    </DashboardShell>
  );
}
