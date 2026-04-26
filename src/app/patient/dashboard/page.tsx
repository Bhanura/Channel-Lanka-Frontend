'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function PatientDashboard() {
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });

  useEffect(() => {
    api.get('/patients/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <DashboardShell title="My Dashboard" subtitle="Welcome back! Here's your health summary.">
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}><Calendar size={22} /></div>
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Upcoming Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}><CheckCircle size={22} /></div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed Visits</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5', color: '#6a1b9a' }}><TrendingUp size={22} /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
      </div>

      {/* Info panel */}
      <div className="card mt-6">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--primary-600)' }}>
            <Clock size={20} />
            <div>
              <div style={{ fontWeight: 600 }}>Quick Actions</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Use the sidebar to navigate to your appointments, profile settings, and notifications.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
