
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  timestamp: Date;
  read: boolean;
}

export interface Toast extends Notification {
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'init-1',
      title: 'System Online',
      message: 'AgriVision platform loaded successfully.',
      type: 'INFO',
      timestamp: new Date(),
      read: false
    }
  ]);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = Date.now().toString() + Math.random().toString().slice(2);
    const newNotif: Notification = {
      ...n,
      id,
      timestamp: new Date(),
      read: false
    };
    
    // Add to history
    setNotifications(prev => [newNotif, ...prev]);

    // Add to toast queue
    setToasts(prev => [...prev, newNotif]);

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
        removeToast(id);
    }, 5000);

  }, [removeToast]);

  const value = useMemo(() => ({
    notifications,
    toasts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeToast
  }), [notifications, toasts, unreadCount, markAsRead, markAllAsRead, addNotification, removeToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
