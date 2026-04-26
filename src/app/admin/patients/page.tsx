'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { User } from 'lucide-react';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/patients?page=${page}&limit=20`).then(r => {
      setPatients(r.data.data.patients || []);
      setTotal(r.data.data.total || 0);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <DashboardShell title="Registered Patients" subtitle="System-wide patient registry">
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
            <table>
              <thead><tr><th>Patient</th><th>Email</th><th>Phone</th><th>Registered Date</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.patient_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          {p.gender && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.gender.charAt(0).toUpperCase() + p.gender.slice(1)}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.users?.email}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.phone || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {patients.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No patients found</td></tr>}
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
