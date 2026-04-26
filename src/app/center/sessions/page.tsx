'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, Plus, Users, Clock, Edit3 } from 'lucide-react';

export default function CenterSessionsPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctorId: '', roomId: '', date: '', startTime: '', endTime: '', patientLimit: 20, doctorFee: 0 });

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    api.get(`/centers/${selectedCenter}/stats`);
    api.get(`/sessions/center/${selectedCenter}`).then(r => setSessions(r.data.data || []));
    api.get(`/centers/${selectedCenter}/rooms`).then(r => setRooms(r.data.data || []));
    api.get(`/centers/${selectedCenter}/doctors`).then(r => setDoctors(r.data.data || []));
  }, [selectedCenter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/sessions/center/${selectedCenter}`, { ...form, startTime: form.startTime, endTime: form.endTime });
    setShowForm(false);
    api.get(`/sessions/center/${selectedCenter}`).then(r => setSessions(r.data.data || []));
  };

  const statusColor: Record<string, string> = { scheduled: 'badge-info', active: 'badge-success', completed: 'badge-muted', cancelled: 'badge-danger' };

  return (
    <DashboardShell title="Manage Sessions" subtitle="Create and manage doctor channeling sessions">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} /> New Session</button>
      </div>

      {/* Create Session Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal animate-fade-in">
            <div className="modal-header"><h2 style={{ fontWeight: 700 }}>Create Channeling Session</h2></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Doctor *</label>
                  <select className="form-input form-select" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} required>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.doctors?.name} — {d.doctors?.specialization}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Room *</label>
                  <select className="form-input form-select" value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} required>
                    <option value="">Select Room</option>
                    {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.name} — LKR {r.charge}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Doctor Fee (LKR)</label><input type="number" className="form-input" value={form.doctorFee} onChange={e => setForm(f => ({ ...f, doctorFee: parseFloat(e.target.value) }))} /></div>
                <div className="form-group"><label className="form-label">Start Time</label><input type="time" className="form-input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">End Time</label><input type="time" className="form-input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Patient Limit</label><input type="number" className="form-input" value={form.patientLimit} onChange={e => setForm(f => ({ ...f, patientLimit: parseInt(e.target.value) }))} min={1} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Doctor</th><th>Room</th><th>Date</th><th>Time</th><th>Bookings</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.session_id}>
                  <td><div style={{ fontWeight: 600 }}>{s.doctors?.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.doctors?.specialization}</div></td>
                  <td style={{ fontSize: 13 }}>{s.rooms?.name}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{s.date}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.start_time} – {s.end_time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={13} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600 }}>{s.appointments?.[0]?.count || 0}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/ {s.patient_limit}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${statusColor[s.status] || 'badge-muted'}`}>{s.status}</span></td>
                  <td>
                    {['scheduled', 'active'].includes(s.status) && (
                      <Link href={`/doctor/sessions/${s.session_id}/queue`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: 12 }}>
                        Queue
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No sessions yet. Create your first session!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
