'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Users, Stethoscope, Building2, Calendar, AlertCircle, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, centers: 0, bookings: 0, pendingDoctors: 0, pendingCenters: 0 });

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <DashboardShell title="Platform Dashboard" subtitle="Channel Lanka — System Overview">
      {/* Pending Alerts */}
      {(stats.pendingDoctors > 0 || stats.pendingCenters > 0) && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <AlertCircle size={18} color="#f57f17" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#e65100' }}>Pending Verifications</div>
            <div style={{ fontSize: 13, color: '#795548', marginTop: 2 }}>
              {stats.pendingDoctors > 0 && <span>{stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? 's' : ''} awaiting approval. </span>}
              {stats.pendingCenters > 0 && <span>{stats.pendingCenters} center{stats.pendingCenters > 1 ? 's' : ''} awaiting approval.</span>}
            </div>
          </div>
        </div>
      )}

      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}><Users size={22} /></div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}><Stethoscope size={22} /></div>
          <div className="stat-value">{stats.doctors}</div>
          <div className="stat-label">Registered Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}><Building2 size={22} /></div>
          <div className="stat-value">{stats.centers}</div>
          <div className="stat-label">Channeling Centers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5', color: '#6a1b9a' }}><Calendar size={22} /></div>
          <div className="stat-value">{stats.bookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
      </div>
      <div className="card mt-6">
        <div className="card-body">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Use the sidebar to manage patients, doctors, centers, appointments, payments, system logs, and platform admins.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
