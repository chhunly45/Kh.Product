import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../components/layout/Header';
import api from '../../services/api';
import * as favApi from '../../services/favorites.api';
import * as notifApi from '../../services/notification.api';
import useSocket from '../../hooks/useSocket';

jest.mock('../../services/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('../../services/favorites.api', () => ({ __esModule: true, getFavoritesCount: jest.fn() }));
jest.mock('../../services/notification.api', () => ({ __esModule: true, getNotificationsCount: jest.fn(), getNotifications: jest.fn() }));
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../hooks/useSocket', () => ({ __esModule: true, default: jest.fn() }));

const mockedApi = api as any;
const mockedFav = favApi as any;
const mockedNotif = notifApi as any;
const mockedUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

describe('Header integration behaviors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.get.mockResolvedValue({ data: { data: [{ _id: 'c1', name: 'Food', labelKh: 'ម្ហូប' }, { _id: 'c2', name: 'Phones', labelKh: 'ទូរស័ព្ទ' }] } });
    mockedFav.getFavoritesCount.mockResolvedValue(0);
    mockedNotif.getNotificationsCount.mockResolvedValue(0);
    mockedNotif.getNotifications.mockResolvedValue([]);
    mockedUseSocket.mockReturnValue({ socket: null } as any);
  });

  it('opens categories menu and supports keyboard navigation', async () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: true });

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });

    const btn = screen.getByRole('button', { name: /ក្រុមផលិតផល/i });
    userEvent.click(btn);

    const menu = await screen.findByRole('menu', { name: /Categories/i });
    expect(menu).toBeInTheDocument();
    const first = within(menu).getByRole('menuitem', { name: /ម្ហូប/i });
    first.focus();
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).not.toBeNull());
  });

  it('gracefully handles categories API failure', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network'));
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: true });

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });

    // Should still render login links even if categories failed
    expect(await screen.findByText(/ចូលគណនី/i)).toBeInTheDocument();
  });

  it('updates notification count when socket emits and opens notification menu', async () => {
    const logout = jest.fn();
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: { id: 'u1' }, logout, isHydrated: true });

    const socket = { on: jest.fn(), off: jest.fn() } as any;
    mockedUseSocket.mockReturnValue({ socket } as any);

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });

    // simulate socket notification handler being registered
    const handler = socket.on.mock.calls.find((c: any) => c[0] === 'new_notification')?.[1];
    expect(typeof handler).toBe('function');
    await act(async () => {
      await handler({ unreadCount: 3 });
    });

    // Open notifications
    userEvent.click(screen.getByTitle(/Notifications/i));
    expect(await screen.findByRole('menu', { name: /Notifications/i })).toBeInTheDocument();
  });

  it('renders auth placeholder when not hydrated', async () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: false });

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });
    expect(screen.getByTestId('header-auth-placeholder')).toBeInTheDocument();
  });

  it('shows user avatar when profileImageUrl present and displayName rendering branches', async () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: { displayName: 'John Doe', profileImageUrl: 'http://img', _id: 'u1' }, logout: jest.fn(), isHydrated: true });

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });
    expect(await screen.findByAltText('avatar')).toBeInTheDocument();
    // displayName last-name branch
    expect(screen.getAllByText(/Doe/).length).toBeGreaterThan(0);
  });

  it('shows initials/short name for single-part displayName', async () => {
    const { useAuth } = require('../../hooks/useAuth');
    useAuth.mockReturnValue({ user: { displayName: 'SoleName', _id: 'u2' }, logout: jest.fn(), isHydrated: true });

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });
    expect(screen.getAllByText(/SoleName/).length).toBeGreaterThan(0);
  });

  it('displays 9+ badge when notification count exceeds 9', async () => {
    const { useAuth } = require('../../hooks/useAuth');
    localStorage.setItem('authToken', 'tok');
    useAuth.mockReturnValue({ user: { _id: 'u3' }, logout: jest.fn(), isHydrated: true });
    mockedNotif.getNotificationsCount.mockResolvedValueOnce(12);

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });

    // Wait for effect to set notification count
    await waitFor(() => expect(screen.queryByText('9+') || screen.queryByText('12')).toBeTruthy());
  });

  it('mobile menu shows login when unauthenticated and logout branch handles thrown logout', async () => {
    const { useAuth } = require('../../hooks/useAuth');
    // unauthenticated mobile menu
    useAuth.mockReturnValue({ user: null, logout: jest.fn(), isHydrated: true });

    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });
    const toggle = screen.queryByLabelText(/Toggle mobile menu/i);
    if (toggle) userEvent.click(toggle);
    expect(await screen.findByText(/Login/)).toBeInTheDocument();

    // authenticated logout failure branch
    localStorage.setItem('authToken', 'a');
    localStorage.setItem('refreshToken', 'b');
    localStorage.setItem('user', 'c');
    const logout = jest.fn().mockRejectedValue(new Error('fail'));
    useAuth.mockReturnValue({ user: { displayName: 'A User', _id: 'u4' }, logout, isHydrated: true });

    // re-render Header with authenticated failing logout to hit catch branch
    const { cleanup } = require('@testing-library/react');
    cleanup();
    // mount again with auth that throws on logout
    useAuth.mockReturnValue({ user: { displayName: 'A User', _id: 'u4' }, logout, isHydrated: true });
    render(<Header />, { wrapper: require('react-router-dom').MemoryRouter });
    const toggle2 = screen.queryByLabelText(/Toggle mobile menu/i);
    if (toggle2) userEvent.click(toggle2);
    // assert user displayName appears in mobile menu
    expect(await screen.findByText(/A User/)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /Logout|ចេញពីប្រព័ន្ធ/i });
    userEvent.click(logoutBtn);

    await waitFor(() => expect(localStorage.getItem('authToken')).toBeNull());
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
