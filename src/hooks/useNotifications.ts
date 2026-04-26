/**
 * src/hooks/useNotifications.ts
 * Subscribes to Supabase Realtime for live notification updates.
 * Returns notification list and unread count.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const data: Notification[] = res.data.data;
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch {
      // Silently fail — don't block the UI
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to Supabase Realtime changes on notifications table
  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${user.user_id}:${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.user_id}`,
        },
        (payload) => {
          // Prepend new notification to the list
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
