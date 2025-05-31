import { type ReactNode, createContext, useContext, useState } from 'react';
import { APP_CONFIG } from '../../shared/config';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: { type: NotificationType; message: string }) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = ({ type, message }: { type: NotificationType; message: string }) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after configured delay
    setTimeout(() => {
      removeNotification(id);
    }, APP_CONFIG.ui.notifications.autoHideDelay);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, showNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
}
