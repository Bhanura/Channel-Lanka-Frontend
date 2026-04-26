'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Heart, Plus, Trash2 } from 'lucide-react';

export default function RegisterDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specialization: '', licenseNumber: '', nic: '', bio: '' });
  const [qualifications, setQualifications] = useState([{ qualification: '', institute: '', year: '' }]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const addQual = () => setQualifications(q => [...q, { qualification: '', institute: '', year: '' }]);
  const removeQual = (i: number) => setQualifications(q => q.filter((_, idx) => idx !== i));
  const setQual = (i: number, k: string, v: string) => setQualifications(q => q.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await api.post('/auth/register/doctor', { ...form, qualifications });
      router.push('/auth/login?registered=doctor');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 60%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 600, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Heart size={24} fill="#00b4d8" color="#00b4d8" style={{ marginBottom: 8 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Register as Doctor</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Your account will need admin verification before activation</p>
        </div>
        {error && <div style={{ background: '#ffebee', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Specialization *</label><input className="form-input" value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="Cardiologist" required /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e => set('password', e.target.value)} minLength={6} required /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">License Number *</label><input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">NIC</label><input className="form-input" value={form.nic} onChange={e => set('nic', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Bio / Professional Summary</label><textarea className="form-input" value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Brief professional description…" /></div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Qualifications</label>
              <button type="button" onClick={addQual} className="btn btn-secondary btn-sm"><Plus size={14} /> Add</button>
            </div>
            {qualifications.map((q, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input className="form-input" value={q.qualification} onChange={e => setQual(i, 'qualification', e.target.value)} placeholder="MBBS, MD…" />
                <input className="form-input" value={q.institute} onChange={e => setQual(i, 'institute', e.target.value)} placeholder="University" />
                <input type="number" className="form-input" value={q.year} onChange={e => setQual(i, 'year', e.target.value)} placeholder="Year" />
                {i > 0 && <button type="button" onClick={() => removeQual(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit for Verification'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          <Link href="/auth/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Already registered? Sign In</Link>
        </div>
      </div>
    </div>
  );
}
