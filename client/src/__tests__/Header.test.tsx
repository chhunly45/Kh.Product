import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/layout/Header';
import api from '../services/api';
import * as favApi from '../services/favorites.api';
import * as notifApi from '../services/notification.api';
import useSocket from '../hooks/useSocket';

const mockNavigate = jest.fn();

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() }
}));

jest.mock('../services/favorites.api', () => ({
  __esModule: true,
  getFavoritesCount: jest.fn()
}));

jest.mock('../services/notification.api', () => ({
  __esModule: true,
  getNotificationsCount: jest.fn(),
  getNotifications: jest.fn()
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('../hooks/useSocket', () => ({
  __esModule: true,
  default: jest.fn()
}));

// react-router's useNavigate is used in Header; mock it to observe navigation
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate
  };
});

const mockedUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderHeader = async () => {
  await act(async () => {
    render(<Header />, { wrapper: MemoryRouter });
    await flushAsync();
    await flushAsync();
  });
};

describe('Header component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
    (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
    (favApi.getFavoritesCount as jest.Mock).mockResolvedValue(0);
    (notifApi.getNotificationsCount as jest.Mock).mockResolvedValue(0);
    (notifApi.getNotifications as jest.Mock).mockResolvedValue([]);
    mockedUseSocket.mockReturnValue({ socket: null } as any);
  });

  it('renders unauthenticated links after hydration', async () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: true });

    await renderHeader();

    expect((await screen.findAllByText(/ចូលគណនី/i)).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText(/បង្កើតគណនី/i)).length).toBeGreaterThanOrEqual(1);

    const toggle = screen.getByLabelText(/Toggle mobile menu/i);
    expect(toggle).toBeInTheDocument();
    fireEvent.click(toggle);

    const drawerNav = screen.getByRole('navigation');
    expect(within(drawerNav).getByRole('link', { name: /About/i })).toBeInTheDocument();
    expect(within(drawerNav).getByRole('link', { name: /Guide/i })).toBeInTheDocument();
    expect(within(drawerNav).getByRole('link', { name: /Help/i })).toBeInTheDocument();
    expect(within(drawerNav).getByRole('link', { name: /Post Product/i })).toBeInTheDocument();
    expect(within(drawerNav).getByRole('link', { name: /Login/i })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Close mobile menu/i));
    await waitFor(() => expect(screen.queryByRole('navigation')).not.toBeInTheDocument());
  });

  it('renders desktop header with logo, help, and language switcher after hydration', async () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: true });

    await renderHeader();

    expect(screen.getByAltText('Konpuk')).toBeInTheDocument();
    expect(screen.getAllByText(/Help/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/English/i)).toBeInTheDocument();
    expect(screen.getByText(/Current/i)).toBeInTheDocument();
  });

  it('renders authenticated state with favorite/notification counts after hydration', async () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        displayName: 'Test User',
        profileImageUrl: '',
        role: 'user'
      },
      logout: jest.fn(),
      isHydrated: true
    });
    localStorage.setItem('authToken', 'tok');
    (favApi.getFavoritesCount as jest.Mock).mockResolvedValue(5);
    (notifApi.getNotificationsCount as jest.Mock).mockResolvedValue(2);

    await renderHeader();

    // open mobile menu to reveal account links
    const toggle = screen.getByLabelText(/Toggle mobile menu/i);
    fireEvent.click(toggle);

    await waitFor(() => expect(favApi.getFavoritesCount).toHaveBeenCalled());
    await waitFor(() => expect(notifApi.getNotificationsCount).toHaveBeenCalled());

    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('shows profile image in mobile menu and clears storage on logout error', async () => {
    const logout = jest.fn().mockRejectedValue(new Error('logout failed'));
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        displayName: 'Test User',
        profileImageUrl: 'https://example.com/avatar.png',
        role: 'user'
      },
      logout,
      isHydrated: true
    });
    localStorage.setItem('authToken', 'tok');
    (favApi.getFavoritesCount as jest.Mock).mockResolvedValue(0);
    (notifApi.getNotificationsCount as jest.Mock).mockResolvedValue(0);

    await renderHeader();

    const toggle = screen.getByLabelText(/Toggle mobile menu/i);
    fireEvent.click(toggle);

    const avatarImages = await screen.findAllByAltText('avatar');
    expect(avatarImages.length).toBeGreaterThanOrEqual(2);
    const mobileAvatar = avatarImages.find((img) => img.closest('div')?.textContent?.includes('Signed in'));
    expect(mobileAvatar).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('hides auth actions until hydration completes', async () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: false });

    await renderHeader();

    expect(screen.getByTestId('header-auth-placeholder')).toBeInTheDocument();
    expect(screen.queryByText(/ចូលគណនី/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/បង្កើតគណនី/i)).not.toBeInTheDocument();
  });

  it('handles categories fetch error gracefully', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('network'));
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: true });

    await renderHeader();

    // should not throw and login remains
    expect(await screen.findByText(/ចូលគណនី/i)).toBeInTheDocument();
  });

  it('opens category and notification menus and closes them via keyboard and outside clicks', async () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com', displayName: 'Test User', profileImageUrl: '', role: 'user' },
      logout: jest.fn(),
      isHydrated: true
    });
    localStorage.setItem('authToken', 'tok');
    (favApi.getFavoritesCount as jest.Mock).mockResolvedValue(4);
    (notifApi.getNotificationsCount as jest.Mock).mockResolvedValue(2);
    (notifApi.getNotifications as jest.Mock).mockResolvedValue([{ _id: 'n1', title: 'New offer', message: 'Check it out', read: false, link: '/products' }]);

    await renderHeader();

    fireEvent.click(screen.getByRole('button', { name: /ក្រុមផលិតផល/i }));
    const categoryMenu = await screen.findByRole('menu', { name: /Categories/i });
    const firstCategory = within(categoryMenu).getByRole('menuitem', { name: /ម្ហូប/i });
    firstCategory.focus();
    fireEvent.keyDown(categoryMenu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(within(categoryMenu).getByRole('menuitem', { name: /ទូរស័ព្ទ/i }));
    fireEvent.keyDown(categoryMenu, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu', { name: /Categories/i })).not.toBeInTheDocument());

    fireEvent.click(screen.getByTitle(/Notifications/i));
    expect(await screen.findByText(/New offer/i)).toBeInTheDocument();
    fireEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole('menu', { name: /Notifications/i })).not.toBeInTheDocument());
  });

  it('handles socket notifications and logout flows', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com', displayName: 'Test User', profileImageUrl: '', role: 'user' },
      logout,
      isHydrated: true
    });

    const socket = {
      on: jest.fn(),
      off: jest.fn()
    };
    mockedUseSocket.mockReturnValue({ socket } as any);

    render(<Header /> , { wrapper: require('react-router-dom').MemoryRouter });

    const handler = socket.on.mock.calls.find(([eventName]) => eventName === 'new_notification')?.[1];
    expect(handler).toBeInstanceOf(Function);
    await act(async () => {
      await handler({ unreadCount: 3 });
    });
    expect(socket.on).toHaveBeenCalledWith('new_notification', expect.any(Function));

    fireEvent.click(screen.getByTitle(/Notifications/i));
    fireEvent.click(screen.getByRole('button', { name: /ចេញពីប្រព័ន្ធ/i }));
    await waitFor(() => expect(logout).toHaveBeenCalled());
  });
});
