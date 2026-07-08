import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import { MemoryRouter } from 'react-router-dom';
import * as adminApi from '../services/admin.api';

jest.mock('../services/admin.api', () => ({
  getAdminOverview: jest.fn(),
  getAdminUsers: jest.fn(),
  updateAdminUserStatus: jest.fn(),
  getAdminProducts: jest.fn(),
  updateAdminProductStatus: jest.fn(),
  updateAdminProductFeatured: jest.fn(),
  getAdminReports: jest.fn(),
  updateAdminReportStatus: jest.fn(),
  getAdminAuditLogs: jest.fn(),
  getProductsByProvince: jest.fn(),
  previewSellerDeletion: jest.fn(),
  deleteSellerByAdmin: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatch: jest.fn(() => null),
  useNavigate: () => jest.fn()
}));

describe('AdminDashboard delete seller flow', () => {
  beforeEach(() => {
    (adminApi.getAdminOverview as jest.Mock).mockResolvedValue({ totalUsers: 1, totalProducts: 0, totalChats: 0, pendingReports: 0 });
    (adminApi.getAdminUsers as jest.Mock).mockResolvedValue({ items: [
      { _id: 'seller-1', displayName: 'Seller One', email: 'seller@example.com', role: 'seller', sellerVerificationStatus: 'unverified', verified: false, isActive: true, verificationStatus: 'pending' },
      { _id: 'seller-2', displayName: 'Verified Seller', email: 'verified@example.com', role: 'seller', sellerVerificationStatus: 'verified', verified: true, isActive: true, verificationStatus: 'verified' },
      { _id: 'seller-3', displayName: 'Banned Seller', email: 'banned@example.com', role: 'seller', sellerVerificationStatus: 'verified', verified: true, isActive: false, verificationStatus: 'verified' },
      { _id: 'admin-1', displayName: 'Admin User', email: 'admin@example.com', role: 'admin', sellerVerificationStatus: 'unverified', verified: false, isActive: true, verificationStatus: 'pending' },
      { _id: 'user-1', displayName: 'Normal User', email: 'user@example.com', role: 'user', sellerVerificationStatus: 'unverified', verified: false, isActive: true, verificationStatus: 'pending' }
    ] });
    (adminApi.getAdminProducts as jest.Mock).mockResolvedValue({ items: [] });
    (adminApi.getAdminReports as jest.Mock).mockResolvedValue({ items: [] });
    (adminApi.getAdminAuditLogs as jest.Mock).mockResolvedValue({ items: [] });
    (adminApi.getProductsByProvince as jest.Mock).mockResolvedValue([]);
    (adminApi.previewSellerDeletion as jest.Mock).mockResolvedValue({ data: { userId: 'seller-1', displayName: 'Seller One', email: 'seller@example.com', products: 1, chats: 0, messages: 0, favorites: 0, promotions: 0, sellerVerifications: 0, reviews: 0, reports: 0, pageViews: 0, searches: 0, visitors: 0, transactions: 0, images: 0, auditLogs: 0, admins: 0 } });
    (adminApi.deleteSellerByAdmin as jest.Mock).mockResolvedValue({ success: true });
  });

  it('shows the delete action and opens the confirmation modal for the users-tab seller row', async () => {
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /users/i }));
    await screen.findByText('Seller One');
    const deleteButtons = screen.getAllByRole('button', { name: /Delete \/ លុប/i });
    expect(deleteButtons).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(/Permanent deletion cannot be undone/i)).toBeInTheDocument();
  });

  it('shows dependency preview and requires exact DELETE before enabling delete', async () => {
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /users/i }));
    await screen.findByText('Seller One');
    fireEvent.click(screen.getAllByRole('button', { name: /Delete \/ លុប/i })[0]);
    await screen.findByText(/Dependency preview/i);
    expect(screen.getByText(/products: 1/i)).toBeInTheDocument();
    const confirmInput = screen.getByLabelText(/Type DELETE to confirm/i);
    const deleteButton = screen.getByRole('button', { name: /Delete Seller/i });
    expect(deleteButton).toBeDisabled();
    fireEvent.change(confirmInput, { target: { value: 'DELETE' } });
    expect(deleteButton).toBeEnabled();
  });

  it('shows API errors safely and removes the seller on success', async () => {
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /users/i }));
    await screen.findByText('Seller One');

    (adminApi.deleteSellerByAdmin as jest.Mock).mockResolvedValueOnce({ success: true });
    (adminApi.getAdminUsers as jest.Mock).mockResolvedValueOnce({ items: [] });

    fireEvent.click(screen.getAllByRole('button', { name: /Delete \/ លុប/i })[0]);
    await screen.findByText(/Dependency preview/i);
    fireEvent.change(screen.getByLabelText(/Type DELETE to confirm/i), { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByRole('button', { name: /Delete Seller/i }));

    await screen.findByText(/Seller deleted successfully/i);
    await waitFor(() => expect(screen.queryByText('Delete seller')).not.toBeInTheDocument());
  });
});
