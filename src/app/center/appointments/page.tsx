'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';

export default function CenterAppointmentsPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    api.get(`/sessions/center/${selectedCenter}`)
      .then(r => setSessions(r.data.data || []))
      .finally(() => setLoading(false));
  }, [selectedCenter]);

  useEffect(() => {
    if (!selectedSession) {
      setAppointments([]);
      return;
    }
    setLoading(true);
    api.get(`/appointments/session/${selectedSession}`)
      .then(r => setAppointments(r.data.data || []))
      .finally(() => setLoading(false));
  }, [selectedSession]);

  const statusBadge: Record<string, string> = { booked: 'badge-warning', confirmed: 'badge-success', completed: 'badge-muted', cancelled: 'badge-danger', no_show: 'badge-danger' };

  return (
    <DashboardShell title="Center Appointments" subtitle="View patient bookings across all sessions">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => { setSelectedCenter(e.target.value); setSelectedSession(''); }}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        
        {/* Sessions List */}
        <div className="card" style={{ width: 320, flexShrink: 0 }}>
          <div className="card-header"><div style={{ fontWeight: 600 }}>Select a Session</div></div>
          <div style={{ display: 'grid', gap: 1 }}>
            {sessions.map(s => (
              <div key={s.session_id} 
                onClick={() => setSelectedSession(s.session_id)}
                style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedSession === s.session_id ? 'var(--primary-50)' : 'transparent', borderLeft: selectedSession === s.session_id ? '4px solid var(--primary-600)' : '4px solid transparent' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.doctors?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{s.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{s.start_time}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--primary-600)', marginTop: 8, fontWeight: 600 }}>
                  <Users size={12} style={{ display: 'inline', marginRight: 4 }} /> 
                  {s.appointments?.[0]?.count || 0} / {s.patient_limit} booked
                </div>
              </div>
            ))}
            {sessions.length === 0 && !loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No sessions found.</div>}
          </div>
        </div>

        {/* Appointments List */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-header"><div style={{ fontWeight: 600 }}>Booked Patients</div></div>
          <div className="table-wrapper">
            {!selectedSession ? <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Select a session from the left to view appointments</div> : 
             loading ? <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
              <table>
                <thead><tr><th>Token</th><th>Patient</th><th>Phone</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.appointment_id}>
                      <td><div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary-600)' }}>#{a.appointment_number}</div></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.patients?.name || 'Guest User'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.patients?.users?.email}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{a.patients?.phone || '—'}</td>
                      <td><span className={`badge ${statusBadge[a.status] || 'badge-muted'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                  {appointments.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No patients booked for this session yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
