import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { extractErrorMessage } from '../../shared/errors';

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  const { showNotification } = context;

  return {
    showNotification,
    showSuccess: (message: string) => 
      showNotification({ type: 'success', message }),
    showError: (error: unknown) => 
      showNotification({ type: 'error', message: extractErrorMessage(error) }),
    showInfo: (message: string) => 
      showNotification({ type: 'info', message }),
  };
}