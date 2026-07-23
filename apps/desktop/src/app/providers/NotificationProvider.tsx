import { createContext, useContext, useState, FC, ReactNode } from 'react';

export interface ToastItem {
  id: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  isCenterOpen: boolean;
  setCenterOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  isCenterOpen: false,
  setCenterOpen: () => {},
});

export const useNotifications = (): NotificationContextType => useContext(NotificationContext);

interface Props {
  children: ReactNode;
}

export const NotificationProvider: FC<Props> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isCenterOpen, setCenterOpen] = useState<boolean>(false);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        isCenterOpen,
        setCenterOpen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
