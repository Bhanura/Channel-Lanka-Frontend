'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Calendar, Users, Building2, CreditCard, AlertCircle } from 'lucide-react';

export default function CenterDashboard() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<any[]>([]);
  const [stats, setStats] = useState({ sessions: 0, bookings: 0, registeredDoctors: 0 });
  const [selectedCenter, setSelectedCenter] = useState<any>(null);

  useEffect(() => {
    api.get('/centers/my').then(r => {
      const data = r.data.data;
      setCenters(data);
      if (data?.[0]) setSelectedCenter(data[0].channeling_centers);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCenter) return;
    api.get(`/centers/${selectedCenter.center_id}/stats`).then(r => setStats(r.data.data)).catch(() => {});
  }, [selectedCenter]);

  return (
    <DashboardShell title="Center Dashboard" subtitle={selectedCenter?.name || 'Channeling Center Portal'}>
      {selectedCenter?.verification_status !== 'approved' && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertCircle size={18} color="#f57f17" />
          <div>
            <div style={{ fontWeight: 600, color: '#e65100', fontSize: 14 }}>Center Pending Approval</div>
            <div style={{ fontSize: 13, color: '#795548', marginTop: 2 }}>Your center is awaiting verification by the platform admin. You can explore the dashboard in the meantime.</div>
          </div>
        </div>
      )}

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}><Calendar size={22} /></div>
          <div className="stat-value">{stats.sessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}><CreditCard size={22} /></div>
          <div className="stat-value">{stats.bookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}><Users size={22} /></div>
          <div className="stat-value">{stats.registeredDoctors}</div>
          <div className="stat-label">Registered Doctors</div>
        </div>
      </div>
      <div className="card mt-6">
        <div className="card-body">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Use the sidebar to manage sessions, appointments, doctors, payments, rooms, and staff for your center.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
