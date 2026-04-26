'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="notif-bell" style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', position: 'relative' }}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel animate-fade-in">
          <div className="notif-panel-header">
            <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <Bell size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <div>No notifications yet</div>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => !n.is_read && markAsRead(n.id)}>
                <div className="notif-title">{n.title}</div>
                {n.body && <div className="notif-body">{n.body}</div>}
                <div className="notif-time">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  {!n.is_read && <span style={{ marginLeft: 8, color: 'var(--primary-600)' }}>● unread</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
