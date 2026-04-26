'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Heart, User, Mail, Lock, Phone, MapPin, Calendar } from 'lucide-react';

export default function RegisterPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', dob: '', gender: 'male', nic: '', location: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/register/patient', form);
      router.push('/auth/login?registered=1');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 60%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 520, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Heart size={24} fill="#00b4d8" color="#00b4d8" />
            <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary-800)' }}>Channel Lanka</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Create Patient Account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Fill in your details to get started</p>
        </div>

        {error && <div style={{ background: '#ffebee', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #ffcdd2' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">NIC Number</label>
              <input className="form-input" value={form.nic} onChange={e => set('nic', e.target.value)} placeholder="123456789V" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 6 characters" minLength={6} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 77 123 4567" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Colombo" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign In</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <Link href="/auth/register/doctor">Register as Doctor</Link> · <Link href="/auth/register/center">Register Center</Link>
        </div>
      </div>
    </div>
  );
}
