import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminBannersPage from '../pages/AdminBannersPage';

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', displayName: 'Admin', role: 'admin' }, authToken: 't', isAuthenticated: true, isHydrated: true, register: jest.fn(), login: jest.fn(), verifyLoginOtp: jest.fn(), logout: jest.fn(), setUser: jest.fn() })
}));

jest.mock('../services/banner.api', () => ({
  listBanners: jest.fn().mockResolvedValue({ data: [] }),
  createBanner: jest.fn(),
  updateBanner: jest.fn(),
  deleteBanner: jest.fn()
}));

jest.mock('../services/upload.api', () => ({
  uploadBannerImage: jest.fn().mockResolvedValue({ secureUrl: 'uploaded.png', url: 'uploaded.png', publicId: 'p1' })
}));

describe('AdminBannersPage upload guidance', () => {
  it('shows recommended upload guidance in Khmer then English', async () => {
    render(
      <MemoryRouter>
        <AdminBannersPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Recommended image size: 1600 × 400 px/i)).toBeInTheDocument());
    expect(screen.getByText(/ទំហំរូបភាពដែលណែនាំ/i)).toBeInTheDocument();
    expect(screen.getByText(/Use WebP or JPG for better performance/i)).toBeInTheDocument();
  });
});
