'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useNotifications } from '@/hooks/useNotifications';
import { CheckCheck, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const typeIcon: Record<string, string> = { appointment: '📅', payment: '💳', verification: '✅', message: '💬', general: '🔔' };

  return (
    <DashboardShell title="Notifications" subtitle="All your platform notifications">
      <div style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}><CheckCheck size={14} /> Mark all read</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Bell size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ color: 'var(--text-muted)' }}>No notifications yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markAsRead(n.id)}
                style={{ background: n.is_read ? 'var(--surface)' : '#f0f7ff', border: `1px solid ${n.is_read ? 'var(--border)' : 'var(--primary-300)'}`, borderRadius: 12, padding: '16px 20px', cursor: n.is_read ? 'default' : 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{n.body}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    {!n.is_read && <span style={{ marginLeft: 8, color: 'var(--primary-500)', fontWeight: 600 }}>● NEW</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
