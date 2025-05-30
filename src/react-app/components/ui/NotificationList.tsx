import { useNotifications } from '~/contexts/NotificationContext';

export function NotificationList() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            padding: '12px 20px',
            borderRadius: '4px',
            backgroundColor:
              notification.type === 'success'
                ? '#4caf50'
                : notification.type === 'error'
                  ? '#f44336'
                  : '#2196f3',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '300px',
          }}
        >
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            type="button"
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
