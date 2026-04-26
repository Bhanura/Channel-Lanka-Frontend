'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/centers?status=${statusFilter}`).then(r => setCenters(r.data.data.centers || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [statusFilter]);

  const verify = async (id: string, status: string) => {
    const reason = status === 'rejected' ? prompt('Rejection reason (optional):') || '' : '';
    await api.patch(`/admin/centers/${id}/verify`, { status, reason });
    fetch();
  };
  const deleteCenter = async (id: string) => {
    if (!confirm('Delete this center?')) return;
    await api.delete(`/admin/centers/${id}`);
    fetch();
  };

  return (
    <DashboardShell title="Manage Centers" subtitle="Verify and manage channeling centers">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select className="form-input form-select" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
            <table>
              <thead><tr><th>Center Name</th><th>Location</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {centers.map(c => (
                  <tr key={c.center_id}>
                    <td><div style={{ fontWeight: 600 }}>{c.name}</div></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.location}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.email}</td>
                    <td><span className={`badge ${c.verification_status === 'approved' ? 'badge-success' : c.verification_status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{c.verification_status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {c.verification_status === 'pending' && (<>
                          <button className="btn btn-sm" style={{ background: '#e8f5e9', color: '#2e7d32' }} onClick={() => verify(c.center_id, 'approved')}><CheckCircle size={14} /> Approve</button>
                          <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => verify(c.center_id, 'rejected')}><XCircle size={14} /> Reject</button>
                        </>)}
                        {c.verification_status === 'approved' && (
                          <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => verify(c.center_id, 'rejected')}><XCircle size={14} /> Revoke</button>
                        )}
                        <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => deleteCenter(c.center_id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {centers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No centers found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
