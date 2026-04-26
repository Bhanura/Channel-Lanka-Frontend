'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Plus, Shield } from 'lucide-react';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/admin/admins').then(r => setAdmins(r.data.data || [])).catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/admins', form);
    setMsg(`Admin ${form.email} added!`);
    setForm({ email: '', password: '' });
    api.get('/admin/admins').then(r => setAdmins(r.data.data || []));
  };

  return (
    <DashboardShell title="Platform Admins" subtitle="Manage platform admin accounts">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Admin</button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            {msg && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{msg}</div>}
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
              <div className="form-group" style={{ margin: 0 }}><label className="form-label">Password</label><input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Email</th><th>Role</th><th>Created At</th></tr></thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.user_id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={14} color="var(--primary-600)" />{a.email}</div></td>
                  <td><span className="badge badge-info">Platform Admin</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
