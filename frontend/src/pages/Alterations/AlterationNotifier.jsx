import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAlterationNotifications } from '../../hooks/useAlterationNotification';

const TOASTER_ID = 'alteration-deadline-alert';

const AlterationNotifier = () => {
    const { notifications, isLoading } = useAlterationNotifications();
    const countRef = useRef(0);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        
        if (notifications.length === countRef.current && !isLoading) {
            return;
        }

        const count = notifications.length;
        countRef.current = count;

        if (count > 0) {
            const itemSummary = notifications
                .slice(0, 3)
                .map(a => a.customer_name || a.slip_no)
                .join(', ');
            
            const moreText = count > 3 ? ` and ${count - 3} more` : '';
            
            const NotificationContent = () => (
                <div style={{ padding: '5px 0' }}>
                    <strong>🚨 {count} Alteration{count > 1 ? 's' : ''} Due TOMORROW!</strong>
                    <p style={{ marginTop: '5px', marginBottom: '5px' }}>
                        Pending: {itemSummary}{moreText}
                    </p>
                    <p style={{ fontSize: '0.8em', color: '#856404' }}>
                        Please review their status immediately.
                    </p>
                </div>
            );

            toast.custom((t) => (
                <div
                    style={{
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffeeba',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxWidth: '450px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transform: t.visible ? 'translateY(0)' : 'translateY(-100%)',
                        transition: 'transform 0.4s ease-out',
                    }}
                >
                    <NotificationContent />
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            marginLeft: '15px',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5em',
                            cursor: 'pointer',
                            color: '#856404',
                            padding: '0 5px'
                        }}
                    >
                        &times;
                    </button>
                </div>
            ), {
                id: TOASTER_ID,
                duration: Infinity,
                position: 'top-center',
            });

        } else {
            toast.dismiss(TOASTER_ID);
        }

    }, [notifications, isLoading]);

    return null;
};

export default AlterationNotifier;