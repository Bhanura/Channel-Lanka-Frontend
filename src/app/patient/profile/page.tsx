'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { User, Save, Upload, AlertCircle } from 'lucide-react';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', dob: '', gender: 'male', nic: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/patients/profile')
      .then(r => setProfile({ ...r.data.data, email: r.data.data.users?.email || '' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      await api.put('/patients/profile', profile);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to update profile' });
    } finally { setSaving(false); }
  };

  return (
    <DashboardShell title="My Profile" subtitle="Manage your personal information">
      <div style={{ maxWidth: 640 }}>
        {msg.text && (
          <div style={{ background: msg.type === 'success' ? '#e8f5e9' : '#ffebee', color: msg.type === 'success' ? '#2e7d32' : '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {msg.text}
          </div>
        )}

        {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading profile…</div> : (
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Personal Details</div></div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={profile.name || ''} onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={profile.email || ''} disabled style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone || ''} onChange={e => setProfile((p: any) => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">NIC</label><input className="form-input" value={profile.nic || ''} onChange={e => setProfile((p: any) => ({ ...p, nic: e.target.value }))} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" value={profile.dob || ''} onChange={e => setProfile((p: any) => ({ ...p, dob: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Gender</label>
                    <select className="form-input form-select" value={profile.gender || 'male'} onChange={e => setProfile((p: any) => ({ ...p, gender: e.target.value }))}>
                      <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={profile.location || ''} onChange={e => setProfile((p: any) => ({ ...p, location: e.target.value }))} placeholder="City, Area" /></div>
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

