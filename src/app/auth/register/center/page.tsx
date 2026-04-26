'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Heart } from 'lucide-react';

export default function RegisterCenterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', adminPhone: '', centerName: '', location: '', phone: '', description: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await api.post('/auth/register/center', form);
      router.push('/auth/login?registered=center');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 60%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 540, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Heart size={24} fill="#00b4d8" color="#00b4d8" style={{ marginBottom: 8 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Register Channeling Center</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>You will be the owner admin of this center</p>
        </div>
        {error && <div style={{ background: '#ffebee', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Admin Account</p>
          <div className="form-group"><label className="form-label">Your Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" value={form.password} onChange={e => set('password', e.target.value)} minLength={6} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Your Phone</label><input className="form-input" value={form.adminPhone} onChange={e => set('adminPhone', e.target.value)} /></div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0 16px' }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Center Information</p>
          <div className="form-group"><label className="form-label">Center Name *</label><input className="form-input" value={form.centerName} onChange={e => set('centerName', e.target.value)} required /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Location *</label><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Colombo 03" required /></div>
            <div className="form-group"><label className="form-label">Center Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} rows={3} /></div>

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Submitting…' : 'Register Center'}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          <Link href="/auth/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Already registered? Sign In</Link>
        </div>
      </div>
    </div>
  );
}
