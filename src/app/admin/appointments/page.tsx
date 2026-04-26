'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/appointments?page=${page}&limit=20`).then(r => {
      setAppointments(r.data.data.appointments || []);
      setTotal(r.data.data.total || 0);
    }).finally(() => setLoading(false));
  }, [page]);

  const statusBadge: Record<string, string> = { booked: 'badge-warning', confirmed: 'badge-success', completed: 'badge-muted', cancelled: 'badge-danger', no_show: 'badge-danger' };

  return (
    <DashboardShell title="All Appointments" subtitle="System-wide booking registry">
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
            <table>
              <thead><tr><th>Appointment</th><th>Patient</th><th>Doctor & Session</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.appointment_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>#{a.appointment_number}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.patients?.name || <span style={{ color: 'var(--text-muted)' }}>Guest / Unlinked</span>}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.channel_sessions?.doctors?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.channel_sessions?.date} at {a.channel_sessions?.start_time}</div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 13, color: 'var(--success)' }}>
                      LKR {a.payments?.total_amount?.toFixed(2) || '—'}
                    </td>
                    <td><span className={`badge ${statusBadge[a.status] || 'badge-muted'}`}>{a.status}</span></td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No appointments found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
        {total > 20 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 12px' }}>Page {page} of {Math.ceil(total / 20)}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
