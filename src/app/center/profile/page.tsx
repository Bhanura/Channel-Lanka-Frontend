'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Building2, Save, AlertCircle } from 'lucide-react';

export default function CenterProfilePage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [profile, setProfile] = useState<any>({ name: '', email: '', phone: '', location: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const center = centers.find(c => c.channeling_centers.center_id === selectedCenter)?.channeling_centers;
    if (center) {
      setProfile(center);
      setLoading(false);
    }
  }, [selectedCenter, centers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      await api.put(`/centers/${selectedCenter}`, profile);
      setMsg({ type: 'success', text: 'Center profile updated successfully!' });
      
      // Update local state
      setCenters(prev => prev.map(c => 
        c.channeling_centers.center_id === selectedCenter 
          ? { ...c, channeling_centers: { ...c.channeling_centers, ...profile } } 
          : c
      ));
      
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to update profile' });
    } finally { setSaving(false); }
  };

  return (
    <DashboardShell title="Center Profile" subtitle="Manage public information for your channeling center">
      {centers.length > 1 && (
        <select className="form-input form-select" style={{ width: 280, marginBottom: 20 }} value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
          {centers.map(c => <option key={c.channeling_centers.center_id} value={c.channeling_centers.center_id}>{c.channeling_centers.name}</option>)}
        </select>
      )}

      <div style={{ maxWidth: 640 }}>
        {msg.text && (
          <div style={{ background: msg.type === 'success' ? '#e8f5e9' : '#ffebee', color: msg.type === 'success' ? '#2e7d32' : '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {msg.text}
          </div>
        )}

        {loading && selectedCenter ? <div style={{ color: 'var(--text-muted)' }}>Loading profile…</div> : (
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={18} /> Center Details</div></div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Center Name *</label>
                  <input className="form-input" value={profile.name || ''} onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Contact Email *</label><input type="email" className="form-input" value={profile.email || ''} onChange={e => setProfile((p: any) => ({ ...p, email: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Contact Phone</label><input className="form-input" value={profile.phone || ''} onChange={e => setProfile((p: any) => ({ ...p, phone: e.target.value }))} /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Address</label>
                  <input className="form-input" value={profile.location || ''} onChange={e => setProfile((p: any) => ({ ...p, location: e.target.value }))} placeholder="123 Hospital Road, City" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Facilities</label>
                  <textarea className="form-input" rows={4} value={profile.description || ''} onChange={e => setProfile((p: any) => ({ ...p, description: e.target.value }))} placeholder="Describe the center, available parking, pharmacy facilities, etc." />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving…' : 'Save Center Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

