import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProductDetailPage from '../pages/ProductDetailPage';
import * as productApi from '../services/product.api';
import * as favoritesApi from '../services/favorites.api';
import * as authApi from '../services/auth.api';
import * as reportApi from '../services/report.api';
import * as chatApi from '../services/chat.api';
import { useAuth } from '../hooks/useAuth';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../services/product.api');
jest.mock('../services/favorites.api');
jest.mock('../services/auth.api');
jest.mock('../services/report.api');
jest.mock('../services/chat.api');
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

const mockedProductApi = productApi as jest.Mocked<typeof productApi>;
const mockedFavoritesApi = favoritesApi as jest.Mocked<typeof favoritesApi>;
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedReportApi = reportApi as jest.Mocked<typeof reportApi>;
const mockedChatApi = chatApi as jest.Mocked<typeof chatApi>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProductDetailPage', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: null,
      authToken: null,
      isAuthenticated: false,
      register: jest.fn() as any,
      login: jest.fn() as any,
      verifyLoginOtp: jest.fn() as any,
      logout: jest.fn() as any,
      setUser: jest.fn() as any
    });

    mockedFavoritesApi.checkFavorite.mockResolvedValue(false);
    mockedAuthApi.getProfile.mockResolvedValue(null);
    mockedReportApi.createReport.mockResolvedValue({} as any);
    mockedChatApi.createChat.mockResolvedValue({ chat: { _id: 'chat-1' } } as any);
    mockedProductApi.getProductBySlug.mockReset();
    mockedProductApi.getProducts.mockResolvedValue({ items: [], meta: { total: 0 } } as any);
    mockedProductApi.trackProductView.mockResolvedValue({ viewsCount: 3 } as any);
    mockedProductApi.updateProduct.mockResolvedValue({} as any);
    mockedProductApi.deleteProduct.mockResolvedValue({} as any);
  });

  it('loads and renders product details', async () => {
    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '123',
      slug: 'detailed-product',
      title: 'Detailed Product',
      description: 'A detailed product description',
      price: 2500,
      location: 'Phnom Penh',
      condition: 'new',
      category: { name: 'Electronics' },
      images: [{ _id: 'img1', secureUrl: 'https://example.com/image.png', altText: 'Product image' }],
      seller: { displayName: 'Seller One', profileImageUrl: '', location: 'Phnom Penh' },
      status: 'published'
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/detailed-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(mockedProductApi.getProductBySlug).toHaveBeenCalledWith('detailed-product'));
    expect(mockedFavoritesApi.checkFavorite).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: /Detailed Product/i })).toBeInTheDocument();
    expect(screen.getByText(/A detailed product description/i)).toBeInTheDocument();
    expect(screen.getByText(/Seller One/i)).toBeInTheDocument();
  });

  it('renders fallback content when no product images are available', async () => {
    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '456',
      slug: 'no-image-product',
      title: 'No Image Product',
      description: 'Product without images',
      price: 1500,
      location: 'Battambang',
      condition: 'used',
      category: { name: 'Electronics' },
      images: [],
      seller: { displayName: 'NoPic Seller', profileImageUrl: '', location: 'Battambang' },
      status: 'draft'
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/no-image-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(mockedProductApi.getProductBySlug).toHaveBeenCalledWith('no-image-product'));
    expect(screen.queryByRole('img', { name: /Product image/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Gallery/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No Image Product/i)).toBeInTheDocument();
  });

  it('shows an error message when product load fails', async () => {
    mockedProductApi.getProductBySlug.mockRejectedValue(new Error('Network failure'));

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/missing-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getByText('Unable to load product.')).toBeInTheDocument());
  });

  it('calls checkFavorite when authenticated and skips it for guests', async () => {
    mockedUseAuth.mockReturnValueOnce({
      user: { id: 'user-1', email: 'user@example.com', displayName: 'Test User' },
      authToken: 'token-123',
      isAuthenticated: true,
      register: jest.fn() as any,
      login: jest.fn() as any,
      verifyLoginOtp: jest.fn() as any,
      logout: jest.fn() as any,
      setUser: jest.fn() as any
    });

    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '321',
      slug: 'authenticated-product',
      title: 'Authenticated Product',
      description: 'Product visible to authenticated users',
      price: 2000,
      location: 'Siem Reap',
      condition: 'new',
      category: { name: 'Electronics' },
      images: [{ _id: 'img1', secureUrl: 'https://example.com/auth-image.png', altText: 'Auth product image' }],
      seller: { displayName: 'Seller Auth', profileImageUrl: '', location: 'Siem Reap' },
      status: 'published'
    });
    mockedFavoritesApi.checkFavorite.mockResolvedValueOnce(true);

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/authenticated-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(mockedFavoritesApi.checkFavorite).toHaveBeenCalledWith('321'));
    expect(screen.getByText(/Saved/i)).toBeInTheDocument();
  });

  it('handles chat, report submission, and owner actions', async () => {
    mockedUseAuth.mockReturnValueOnce({
      user: { id: 'seller-1', email: 'seller@example.com', displayName: 'Seller One' },
      authToken: 'token-123',
      isAuthenticated: true,
      register: jest.fn() as any,
      login: jest.fn() as any,
      verifyLoginOtp: jest.fn() as any,
      logout: jest.fn() as any,
      setUser: jest.fn() as any
    });

    mockedAuthApi.getProfile.mockResolvedValue({
      _id: 'seller-1',
      email: 'seller@example.com',
      displayName: 'Seller One',
      role: 'seller'
    } as any);

    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '777',
      slug: 'owner-product',
      title: 'Owner Product',
      description: 'Owner description',
      price: 3000,
      location: 'Kampot',
      condition: 'new',
      category: { _id: 'cat-1', name: 'Electronics' },
      images: [{ _id: 'img1', secureUrl: 'https://example.com/owner.png', altText: 'Owner image' }],
      seller: { _id: 'seller-1', displayName: 'Seller One', email: 'seller@example.com', phoneNumber: '+855123456', createdAt: '2024-01-01' },
      status: 'published'
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/owner-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getByText(/Owner Product/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /mark as sold/i }));
    await waitFor(() => expect(mockedProductApi.updateProduct).toHaveBeenCalledWith('777', { status: 'sold' }));
    expect(screen.getByText(/Product marked as sold/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /report seller/i }));
    fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'scam' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Suspicious seller' } });
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => expect(mockedReportApi.createReport).toHaveBeenCalled());
    expect(screen.getByText(/Your report has been submitted/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login when starting a chat', async () => {
    mockedUseAuth.mockReturnValueOnce({
      user: null,
      authToken: null,
      isAuthenticated: false,
      register: jest.fn() as any,
      login: jest.fn() as any,
      verifyLoginOtp: jest.fn() as any,
      logout: jest.fn() as any,
      setUser: jest.fn() as any
    });

    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '999',
      slug: 'chat-product',
      title: 'Chat Product',
      description: 'A chat product',
      price: 500,
      location: 'Siem Reap',
      condition: 'new',
      category: { name: 'Electronics' },
      images: [{ _id: 'img1', secureUrl: 'https://example.com/chat.png', altText: 'Chat image' }],
      seller: { _id: 'seller-2', displayName: 'Seller Two', email: 'seller2@example.com', phoneNumber: '+855112233', createdAt: '2024-01-01' },
      status: 'published'
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/chat-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: /Chat Product/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Message seller/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login?redirectTo=/products/chat-product');
  });

  it('shows an error when report submission fails', async () => {
    mockedReportApi.createReport.mockRejectedValueOnce(new Error('Report failed'));
    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '888',
      slug: 'report-fail',
      title: 'Report Fail Product',
      description: 'Product for report failure',
      price: 550,
      location: 'Battambang',
      condition: 'new',
      category: { name: 'Electronics' },
      images: [{ _id: 'img1', secureUrl: 'https://example.com/fail.png', altText: 'Fail image' }],
      seller: { _id: 'seller-3', displayName: 'Seller Three', email: 'seller3@example.com', phoneNumber: '+855998877', createdAt: '2024-01-01' },
      status: 'published'
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/report-fail']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getByText(/Report Fail Product/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /report seller/i }));
    fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'fake_product' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Invalid listing' } });
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => expect(mockedReportApi.createReport).toHaveBeenCalled());
    expect(screen.getByText(/Unable to submit the report/i)).toBeInTheDocument();
  });

  it('switches selected image when multiple product images are available', async () => {
    mockedProductApi.getProductBySlug.mockResolvedValue({
      _id: '7777',
      slug: 'gallery-product',
      title: 'Gallery Product',
      description: 'Product with gallery',
      price: 650,
      location: 'Kampong Cham',
      condition: 'new',
      category: { name: 'Electronics' },
      images: [
        { _id: 'img1', secureUrl: 'https://example.com/gallery1.png', altText: 'Gallery image 1' },
        { _id: 'img2', secureUrl: 'https://example.com/gallery2.png', altText: 'Gallery image 2' }
      ],
      seller: { _id: 'seller-4', displayName: 'Gallery Seller', email: 'seller4@example.com', phoneNumber: '+855223344', createdAt: '2024-01-01' },
      status: 'published'
    });

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/products/gallery-product']}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getByText(/Gallery Product/i)).toBeInTheDocument());

    const imageElements = screen.getAllByAltText('Gallery Product');
    expect(imageElements.length).toBeGreaterThanOrEqual(3);

    const thumbnailForGallery2 = imageElements.find((img, index) => index > 0 && img.getAttribute('src') === 'https://example.com/gallery2.png');
    expect(thumbnailForGallery2).toBeDefined();

    fireEvent.click(thumbnailForGallery2 as Element);
    expect(imageElements[0]).toHaveAttribute('src', 'https://example.com/gallery2.png');
  });
});
