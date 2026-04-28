'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { Search, Star, Shield, Clock, ChevronRight, Heart, Stethoscope, Building2, Calendar } from 'lucide-react';

export default function LandingPage() {
  const [searchQ, setSearchQ] = useState('');
  const [searchType, setSearchType] = useState<'doctors' | 'centers'>('doctors');
  const router = useRouter();

  useEffect(() => {
    // Load Nexora Widget
    const script = document.createElement('script');
    script.src = 'https://elanka.ai/widget.iife.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).NexoraWidget) {
        (window as any).NexoraWidget.init('nx_Q8Yd7i-LgCbh8boF-1qvZbRGgBCGDUOp', {
          apiUrl: 'https://elanka.ai/api'
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQ)}&type=${searchType}`);
  };

  const specializations = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'Ophthalmologist'];

  return (
    <div>
      <PublicNavbar />

      {/* Hero */}
      <section className="hero-gradient" style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,180,216,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,180,216,0.2)', color: '#00b4d8', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <Heart size={14} fill="#00b4d8" /> Sri Lanka's Trusted Channeling Platform
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Book Your Doctor<br />
            <span style={{ color: '#00b4d8' }}>Appointment Today</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Find the right doctor, choose a convenient time, and book instantly — at channeling centers near you.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 16, padding: 8, display: 'flex', gap: 8, maxWidth: 680, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <select value={searchType} onChange={e => setSearchType(e.target.value as any)}
              className="form-input form-select" style={{ width: 140, flexShrink: 0, border: 'none', background: 'var(--primary-50)', fontWeight: 600 }}>
              <option value="doctors">Doctors</option>
              <option value="centers">Centers</option>
            </select>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder={searchType === 'doctors' ? 'Search by name or specialization…' : 'Search by center name or location…'}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit', padding: '0 8px' }} />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, gap: 6 }}>
              <Search size={16} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Quick Specializations */}
      <section style={{ background: 'var(--surface)', padding: '32px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {specializations.map(spec => (
              <Link key={spec} href={`/search?type=doctors&specialization=${encodeURIComponent(spec)}`}
                style={{ padding: '8px 20px', background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid var(--primary-100)', transition: 'all 0.2s' }}
                onMouseOver={e => { (e.target as HTMLElement).style.background = 'var(--primary-600)'; (e.target as HTMLElement).style.color = '#fff'; }}
                onMouseOut={e => { (e.target as HTMLElement).style.background = 'var(--primary-50)'; (e.target as HTMLElement).style.color = 'var(--primary-700)'; }}>
                {spec}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 24px', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)' }}>Why Choose Channel Lanka?</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 16 }}>The easiest way to connect with healthcare professionals in Sri Lanka</p>
          </div>
          <div className="grid-3">
            {[
              { icon: <Search size={28} />, color: '#1565c0', bg: '#e3f2fd', title: 'Find Doctors Easily', desc: 'Search by name, specialization, or location. Filter by availability and ratings.' },
              { icon: <Calendar size={28} />, color: '#00897b', bg: '#e0f2f1', title: 'Instant Booking', desc: 'Book appointments in seconds — even without registering. Guest booking available.' },
              { icon: <Shield size={28} />, color: '#6a1b9a', bg: '#f3e5f5', title: 'Verified Doctors', desc: 'All doctors are verified by our admin team. View qualifications and ratings.' },
              { icon: <Clock size={28} />, color: '#e65100', bg: '#fff3e0', title: 'Real-time Slots', desc: 'See live slot availability. Full sessions are clearly marked.' },
              { icon: <Star size={28} />, color: '#f57f17', bg: '#fffde7', title: 'Patient Reviews', desc: 'Read genuine ratings from other patients to make informed decisions.' },
              { icon: <Heart size={28} />, color: '#c62828', bg: '#ffebee', title: 'Your Health, Our Priority', desc: 'Transparent fee breakdowns and secure payment processing.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Ready to get started?</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 32, fontSize: 16 }}>Join thousands of patients who trust Channel Lanka for their healthcare needs.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register/patient" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary-700)', fontWeight: 700 }}>
            Register as Patient
          </Link>
          <Link href="/search" className="btn btn-lg btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
            Browse Doctors <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--primary-900)', color: 'rgba(255,255,255,0.5)', padding: '32px 24px', textAlign: 'center', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, color: '#fff', fontWeight: 700, fontSize: 16 }}>
          <Heart size={16} fill="#00b4d8" color="#00b4d8" /> Channel Lanka
        </div>
        <p>© {new Date().getFullYear()} Channel Lanka. All rights reserved. </p>
      </footer>
    </div>
  );
}
