'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      const routes: Record<string, string> = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        center_admin: '/center/dashboard',
        platform_admin: '/admin/dashboard',
      };
      router.push(routes[user.role] || '/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 60%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Heart size={28} fill="#00b4d8" color="#00b4d8" />
            <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary-800)' }}>Channel Lanka</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background: '#ffebee', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20, border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" style={{ paddingLeft: 38 }} placeholder="your@email.com" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="form-input" style={{ paddingLeft: 38, paddingRight: 40 }} placeholder="Your password" required />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 8, justifyContent: 'center', gap: 8 }} disabled={loading}>
            {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={16} /></>)}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/auth/register/patient" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Register</Link>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/auth/register/doctor" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Register as Doctor</Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <Link href="/auth/register/center" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Register Center</Link>
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 12, color: 'var(--text-muted)' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
