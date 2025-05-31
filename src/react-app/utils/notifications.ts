import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../shared';

export const notify = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (error: unknown) => {
    toast.error(extractErrorMessage(error));
  },
  
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};