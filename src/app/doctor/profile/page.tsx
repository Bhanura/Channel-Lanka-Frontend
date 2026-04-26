'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { User, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<any>({ name: '', email: '', phone: '', specialization: '', license_number: '', nic: '', bio: '' });
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/doctors/profile')
      .then(r => {
        const data = r.data.data;
        setProfile({ ...data, email: data.users?.email || '' });
        setQualifications(data.doctor_qualifications || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const addQual = () => setQualifications(q => [...q, { qualification: '', institute: '', year: '' }]);
  const removeQual = (i: number) => setQualifications(q => q.filter((_, idx) => idx !== i));
  const setQual = (i: number, k: string, v: string) => setQualifications(q => q.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      await api.put('/doctors/profile', { ...profile, licenseNumber: profile.license_number, qualifications });
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to update profile' });
    } finally { setSaving(false); }
  };

  const statusColors: Record<string, string> = { 
    approved: 'badge-success', 
    pending: 'badge-warning', 
    rejected: 'badge-danger' 
  };

  return (
    <DashboardShell title="My Profile" subtitle="Manage your professional information and qualifications">
      <div style={{ maxWidth: 720 }}>
        {msg.text && (
          <div style={{ background: msg.type === 'success' ? '#e8f5e9' : '#ffebee', color: msg.type === 'success' ? '#2e7d32' : '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {msg.text}
          </div>
        )}

        {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading profile…</div> : (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Professional Details</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status:</span>
                <span className={`badge ${statusColors[profile.verification_status] || 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>
                  {profile.verification_status || 'Pending'}
                </span>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={profile.name || ''} onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={profile.email || ''} disabled style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Specialization *</label><input className="form-input" value={profile.specialization || ''} onChange={e => setProfile((p: any) => ({ ...p, specialization: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">License Number</label><input className="form-input" value={profile.license_number || ''} onChange={e => setProfile((p: any) => ({ ...p, license_number: e.target.value }))} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone || ''} onChange={e => setProfile((p: any) => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">NIC</label><input className="form-input" value={profile.nic || ''} onChange={e => setProfile((p: any) => ({ ...p, nic: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Bio / Professional Summary</label><textarea className="form-input" rows={4} value={profile.bio || ''} onChange={e => setProfile((p: any) => ({ ...p, bio: e.target.value }))} /></div>
                
                <div style={{ marginTop: 24, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Qualifications</div>
                    <button type="button" onClick={addQual} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Qualification</button>
                  </div>
                  {qualifications.map((q, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 12, marginBottom: 12, alignItems: 'center', background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
                      <div><label className="form-label">Degree/Title</label><input className="form-input" value={q.qualification || ''} onChange={e => setQual(i, 'qualification', e.target.value)} placeholder="MBBS" required /></div>
                      <div><label className="form-label">Institute</label><input className="form-input" value={q.institute || ''} onChange={e => setQual(i, 'institute', e.target.value)} placeholder="University" /></div>
                      <div><label className="form-label">Year</label><input type="number" className="form-input" value={q.year || ''} onChange={e => setQual(i, 'year', e.target.value)} placeholder="2010" /></div>
                      <div style={{ paddingTop: 22 }}><button type="button" onClick={() => removeQual(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button></div>
                    </div>
                  ))}
                  {qualifications.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No qualifications added.</div>}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 10 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving…' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ChangePasswordForm />
      </div>
    </DashboardShell>
  );
}

