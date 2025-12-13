import { useState, useEffect } from 'react';
import { fetchAlterationNotifications } from '../contexts/api/alterations';

export const useAlterationNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const data = await fetchAlterationNotifications();
                setNotifications(data.data.due_tomorrow || []);
            } catch (error) {
                setNotifications([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    return { notifications, isLoading };
};