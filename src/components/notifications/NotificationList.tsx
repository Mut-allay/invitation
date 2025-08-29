// src/components/notifications/NotificationList.tsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Assuming you have a firebase config file
import { useAuth } from '../../contexts/auth-hooks'; // Assuming you have an AuthContext

interface Notification {
  id: string;
  message: string;
  type: 'order_update' | 'settlement_ready' | 'low_stock';
  isRead: boolean;
  linkTo: string;
  createdAt: Timestamp;
}

const NotificationList: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newNotifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="absolute right-0 w-80 mt-2 py-2 bg-white border rounded shadow-xl">
      <div className="px-4 py-2 text-gray-800 font-bold">Notifications</div>
      <div className="divide-y divide-gray-200">
        {notifications.map(notification => (
          <a
            href={notification.linkTo}
            key={notification.id}
            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${!notification.isRead ? 'font-bold' : ''}`}
          >
            {notification.message}
            <div className="text-xs text-gray-500">
                              {notification.createdAt?.toDate()?.toLocaleString() || 'N/A'}
            </div>
          </a>
        ))}
        {notifications.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-700">No new notifications</div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
