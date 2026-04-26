'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Menu, X, Heart, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/search?q=${encodeURIComponent(searchQ)}`);
  };

  const dashboardRoutes: Record<string, string> = {
    patient: '/patient/dashboard',
    doctor: '/doctor/dashboard',
    center_admin: '/center/dashboard',
    platform_admin: '/admin/dashboard',
  };

  return (
    <nav style={{ background: 'var(--primary-800)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 800, fontSize: 20, whiteSpace: 'nowrap' }}>
          <Heart size={22} fill="#00b4d8" color="#00b4d8" />
          Channel Lanka
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 440, display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search doctors, specializations, centers…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 16px', color: '#fff', fontSize: 14 }} />
          <button type="submit" style={{ background: 'var(--accent)', border: 'none', padding: '0 16px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </button>
        </form>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/search?type=doctors" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>Doctors</Link>
          <Link href="/search?type=centers" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>Centers</Link>
          
          {user ? (
            <>
              <Link href={dashboardRoutes[user.role] || '/'} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm" style={{ background: 'transparent', color: '#ffcdd2', border: '1px solid rgba(255,100,100,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>Login</Link>
              <Link href="/auth/register/patient" className="btn btn-primary btn-sm" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>Book Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
