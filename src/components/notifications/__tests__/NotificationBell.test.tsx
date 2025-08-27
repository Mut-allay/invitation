// src/components/notifications/__tests__/NotificationBell.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationBell from '../NotificationBell';
import { useAuth } from '../../../contexts/auth-hooks';
import { onSnapshot } from 'firebase/firestore';

jest.mock('../../../contexts/auth-hooks');
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  onSnapshot: jest.fn(),
}));

describe('NotificationBell', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockOnSnapshot = onSnapshot as jest.Mock;

  it('should not show a notification dot when there are no new notifications', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '123' } });
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ empty: true });
      return () => {};
    });

    render(<NotificationBell />);
    expect(screen.queryByTestId('notification-dot')).not.toBeInTheDocument();
  });

  it('should show a notification dot when there are new notifications', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '123' } });
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ empty: false });
      return () => {};
    });

    render(<NotificationBell />);
    expect(screen.getByTestId('notification-dot')).toBeInTheDocument();
  });
});
