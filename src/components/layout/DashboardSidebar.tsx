'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  LayoutDashboard, Calendar, User, Building2, MessageSquare,
  Users, Settings, LogOut, Heart, ShieldCheck, CreditCard,
  Stethoscope, FileText, Activity, Home, ClipboardList, DoorOpen
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ReactNode; section?: string; }

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Dashboard', href: '/patient/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Appointments', href: '/patient/appointments', icon: <Calendar size={18} /> },
    { label: 'My Profile', href: '/patient/profile', icon: <User size={18} /> },
    { label: 'Notifications', href: '/patient/notifications', icon: <Activity size={18} /> },
  ],
  doctor: [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Sessions', href: '/doctor/sessions', icon: <Calendar size={18} /> },
    { label: 'My Centers', href: '/doctor/centers', icon: <Building2 size={18} /> },
    { label: 'Center Requests', href: '/doctor/requests', icon: <ClipboardList size={18} /> },
    { label: 'Messages', href: '/doctor/messages', icon: <MessageSquare size={18} /> },
    { label: 'My Profile', href: '/doctor/profile', icon: <User size={18} /> },
    { label: 'Notifications', href: '/doctor/notifications', icon: <Activity size={18} /> },
  ],
  center_admin: [
    { label: 'Dashboard', href: '/center/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Sessions', href: '/center/sessions', icon: <Calendar size={18} /> },
    { label: 'Appointments', href: '/center/appointments', icon: <ClipboardList size={18} /> },
    { label: 'Doctors', href: '/center/doctors', icon: <Stethoscope size={18} /> },
    { label: 'Doctor Requests', href: '/center/doctors/requests', icon: <Users size={18} /> },
    { label: 'Payments', href: '/center/payments', icon: <CreditCard size={18} /> },
    { label: 'Messages', href: '/center/messages', icon: <MessageSquare size={18} /> },
    { label: 'Rooms', href: '/center/rooms', icon: <DoorOpen size={18} /> },
    { label: 'Staff', href: '/center/staff', icon: <Users size={18} /> },
    { label: 'Center Profile', href: '/center/profile', icon: <Building2 size={18} /> },
    { label: 'Notifications', href: '/center/notifications', icon: <Activity size={18} /> },
  ],
  platform_admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Patients', href: '/admin/patients', icon: <Users size={18} /> },
    { label: 'Doctors', href: '/admin/doctors', icon: <Stethoscope size={18} /> },
    { label: 'Centers', href: '/admin/centers', icon: <Building2 size={18} /> },
    { label: 'All Appointments', href: '/admin/appointments', icon: <Calendar size={18} /> },
    { label: 'Payments', href: '/admin/payments', icon: <CreditCard size={18} /> },
    { label: 'Payment Config', href: '/admin/payment-config', icon: <Settings size={18} /> },
    { label: 'Admins', href: '/admin/admins', icon: <ShieldCheck size={18} /> },
    { label: 'System Logs', href: '/admin/system-logs', icon: <FileText size={18} /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <Activity size={18} /> },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  center_admin: 'Center Admin',
  platform_admin: 'Platform Admin',
};

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role] || [];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 800, fontSize: 18 }}>
          <Heart size={20} fill="#00b4d8" color="#00b4d8" />
          Channel Lanka
        </Link>
        <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          {ROLE_LABELS[user.role]} Portal
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </div>
        <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,100,100,0.9)', cursor: 'pointer', padding: '8px 0', marginTop: 4 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
