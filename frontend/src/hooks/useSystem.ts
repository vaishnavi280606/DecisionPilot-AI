import { useState, useEffect, useCallback } from 'react';
import { getSettings, getAnalytics, getNotifications, markNotificationsRead } from '../lib/api';
import { UserSettings, DashboardAnalytics, Notification } from '../lib/types';

export function useSystem() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSystem = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, n] = await Promise.all([
        getSettings(),
        getAnalytics(),
        getNotifications()
      ]);
      setSettings(s);
      setAnalytics(a);
      setNotifications(n);
    } catch (err) {
      console.error('System data sync failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSystem();
  }, [refreshSystem]);

  const clearNotifications = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to clear notifications');
    }
  };

  return { settings, analytics, notifications, loading, refreshSystem, clearNotifications };
}
