// src/components/notifications/__tests__/NotificationList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationList from '../NotificationList';
import { useAuth } from '../../../contexts/auth-hooks';
import { onSnapshot, Timestamp } from 'firebase/firestore';

jest.mock('../../../contexts/auth-hooks');
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  onSnapshot: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({
      toDate: () => new Date(),
    })),
  },
}));

describe('NotificationList', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockOnSnapshot = onSnapshot as jest.Mock;

  it('should show "No new notifications" when there are none', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '123' } });
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ docs: [] });
      return () => {};
    });

    render(<NotificationList />);
    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('should display a list of notifications', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '123' } });
    const mockNotifications = [
      { id: '1', message: 'Notification 1', isRead: false, linkTo: '/1', createdAt: Timestamp.now() },
      { id: '2', message: 'Notification 2', isRead: true, linkTo: '/2', createdAt: Timestamp.now() },
    ];
    mockOnSnapshot.mockImplementation((query, callback) => {
      const snapshot = {
        docs: mockNotifications.map(n => ({ id: n.id, data: () => n }))
      };
      callback(snapshot);
      return () => {};
    });

    render(<NotificationList />);
    expect(screen.getByText('Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Notification 2')).toBeInTheDocument();
  });
});
