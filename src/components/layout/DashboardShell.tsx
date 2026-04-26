'use client';
import DashboardSidebar from './DashboardSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardShell({ children, title, subtitle }: DashboardShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <NotificationBell />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20, borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-600)', fontSize: 14 }}>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ fontSize: 13, marginRight: 8 }}>
                <div style={{ fontWeight: 600 }}>{user?.email?.split('@')[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
              </div>
              <button 
                onClick={logout} 
                title="Sign Out"
                style={{ background: 'var(--danger-50, #ffebee)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger, #ef5350)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffcdd2'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffebee'}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="page-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
