'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Plus, Users, Shield } from 'lucide-react';

export default function CenterStaffPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'staff' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers.center_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    setLoading(true);
    api.get(`/centers/${selectedCenter}/staff`)
      .then(r => setStaff(r.data.data || []))
      .finally(() => setLoading(false));
  }, [selectedCenter]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg({ type: '', text: '' });
    try {
      await api.post(`/centers/${selectedCenter}/staff`, form);
      setMsg({ type: 'success', text: `Staff account ${form.email} created!` });
      setShowForm(false);
      setForm({ email: '', password: '', role: 'staff' });
      api.get(`/centers/${selectedCenter}/staff`).then(r => setStaff(r.data.data || []));
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to add staff' });
    }
  };

  return (
    <DashboardShell title="Center Staff" subtitle="Manage sub-admins and receptionists for your center">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      {msg.text && (
        <div style={{ background: msg.type === 'success' ? '#e8f5e9' : '#ffebee', color: msg.type === 'success' ? '#2e7d32' : '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add Staff Member</button>
      </div>

      {showForm && (
        <div className="card mb-4 animate-fade-in">
          <div className="card-body">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>New Staff Member</div>
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">Temporary Password *</label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0, width: 140 }}>
                <label className="form-label">Role</label>
                <select className="form-input form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="staff">Staff / Reception</option>
                  <option value="admin">Center Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Create Account</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {loading && selectedCenter ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading staff…</div> : (
            <table>
              <thead><tr><th>Email</th><th>Center Role</th><th>Added On</th></tr></thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.admin_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <Shield size={16} color={s.center_role === 'owner' ? 'var(--primary-600)' : 'var(--text-muted)'} />
                        {s.users?.email}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.center_role === 'owner' ? 'badge-primary' : s.center_role === 'admin' ? 'badge-info' : 'badge-muted'}`}>
                        {s.center_role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
