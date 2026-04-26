'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { CheckCircle, XCircle, Plus, Trash2, Eye, Search } from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', specialization: '', licenseNumber: '', phone: '', nic: '' });
  const [createResult, setCreateResult] = useState<any>(null);

  const fetchDoctors = () => {
    setLoading(true);
    api.get(`/admin/doctors?status=${statusFilter}`).then(r => setDoctors(r.data.data.doctors || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchDoctors(); }, [statusFilter]);

  const verify = async (id: string, status: string) => {
    await api.patch(`/admin/doctors/${id}/verify`, { status });
    fetchDoctors();
  };

  const deleteDoctor = async (id: string) => {
    if (!confirm('Delete this doctor? This cannot be undone.')) return;
    await api.delete(`/admin/doctors/${id}`);
    fetchDoctors();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api.post('/admin/doctors', createForm);
    setCreateResult(r.data.data);
  };

  const filtered = doctors.filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardShell title="Manage Doctors" subtitle="Approve, reject, and manage doctor accounts">
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input className="form-input" style={{ maxWidth: 260 }} placeholder="Search by name or specialization…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Create Doctor Account</button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal animate-fade-in">
            <div className="modal-header"><h2 style={{ fontWeight: 700, fontSize: 18 }}>Create Doctor Account</h2></div>
            {createResult ? (
              <div className="modal-body">
                <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 8, padding: 20, textAlign: 'center' }}>
                  <CheckCircle size={32} color="#2e7d32" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700 }}>Doctor account created!</div>
                  <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Share these credentials with the doctor:</div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: 12, marginTop: 12, fontFamily: 'monospace', fontSize: 13 }}>
                    <div>Email: <strong>{createForm.email}</strong></div>
                    <div>Temp Password: <strong>{createResult.tempPassword}</strong></div>
                  </div>
                </div>
                <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 16 }} onClick={() => { setShowCreate(false); setCreateResult(null); fetchDoctors(); }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Specialization *</label><input className="form-input" value={createForm.specialization} onChange={e => setCreateForm(f => ({ ...f, specialization: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Temp Password *</label><input className="form-input" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">License #</label><input className="form-input" value={createForm.licenseNumber} onChange={e => setCreateForm(f => ({ ...f, licenseNumber: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Create Account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
            <table>
              <thead><tr>
                <th>Name</th><th>Specialization</th><th>License</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.doctor_id}>
                    <td><div style={{ fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.users?.email}</div></td>
                    <td>{d.specialization}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.license_number || '—'}</td>
                    <td>
                      <span className={`badge ${d.verification_status === 'approved' ? 'badge-success' : d.verification_status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {d.verification_status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {d.verification_status === 'pending' && (<>
                          <button className="btn btn-sm" style={{ background: '#e8f5e9', color: '#2e7d32' }} onClick={() => verify(d.doctor_id, 'approved')}><CheckCircle size={14} /> Approve</button>
                          <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => verify(d.doctor_id, 'rejected')}><XCircle size={14} /> Reject</button>
                        </>)}
                        {d.verification_status === 'approved' && (
                          <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => verify(d.doctor_id, 'rejected')}><XCircle size={14} /> Revoke</button>
                        )}
                        <button className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828' }} onClick={() => deleteDoctor(d.doctor_id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No doctors found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
