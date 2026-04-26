'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Calendar, Building2, Users, Clock } from 'lucide-react';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ todaySessions: 0, totalSessions: 0, registeredCenters: 0 });

  useEffect(() => {
    api.get('/doctors/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <DashboardShell title="Doctor Dashboard" subtitle="Your practice overview">
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}><Calendar size={22} /></div>
          <div className="stat-value">{stats.todaySessions}</div>
          <div className="stat-label">Sessions Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}><Clock size={22} /></div>
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}><Building2 size={22} /></div>
          <div className="stat-value">{stats.registeredCenters}</div>
          <div className="stat-label">Registered Centers</div>
        </div>
      </div>
      <div className="card mt-6">
        <div className="card-body">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Use the sidebar to manage your sessions, view registered centers, handle requests, and communicate with centers.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
