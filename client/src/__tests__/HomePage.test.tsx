import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { getProvinces, getDistricts } from '../services/location.api';
import * as productApi from '../services/product.api';
import HomePage from '../pages/HomePage';

jest.mock('../components/marketplace/ProductCard', () => ({
  __esModule: true,
  default: ({ title, titleKh, titleEn }: any) => <div data-testid="product-card">{String(title ?? titleKh ?? titleEn ?? '')}</div>
}));

jest.mock('../services/product.api');
jest.mock('../services/location.api', () => ({
  getProvinces: jest.fn(),
  getDistricts: jest.fn()
}));
const mockedProductApi = productApi as jest.Mocked<typeof productApi>;
const mockedGetProvinces = getProvinces as jest.MockedFunction<typeof getProvinces>;
const mockedGetDistricts = getDistricts as jest.MockedFunction<typeof getDistricts>;

describe('HomePage', () => {
  beforeEach(() => {
    mockedProductApi.getFeaturedProducts.mockResolvedValue({ items: [] } as any);
    mockedProductApi.getProducts.mockResolvedValue({ items: [{ _id: '1', title: 'Phone', price: 100, category: { name: 'Electronics' } }] } as any);
    mockedGetProvinces.mockResolvedValue([{ id: 1, name: 'Phnom Penh' }] as any);
    mockedGetDistricts.mockResolvedValue([] as any);
  });

  it('renders the homepage hero and search bar', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText(/ទិញ និង លក់/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ស្វែងរក/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedProductApi.getProducts).toHaveBeenCalledWith({ page: '1', perPage: '12' });
    });
  });

  it('normalizes product card props for featured and latest products', async () => {
    mockedProductApi.getFeaturedProducts.mockResolvedValue({ items: [{ _id: 'f1', title: 'Featured', titleKh: 123, titleEn: 'English', price: 999, seller: { displayName: 'Seller A', sellerVerificationStatus: 'verified' } }] } as any);
    mockedProductApi.getProducts.mockResolvedValue({ items: [{ _id: 'p1', title: 456, titleKh: 'ក', titleEn: 'Title', price: '1200', location: 'Phnom Penh', category: { name: 'Electronics' }, seller: { name: 'Seller B' }, featured: true }] } as any);

    render(
      <HelmetProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getAllByTestId('product-card').length).toBeGreaterThan(0));
    expect(screen.getByText(/Featured/i)).toBeInTheDocument();
    expect(screen.getByText(/456/i)).toBeInTheDocument();
  });

  it('renders the top ads section when featured products are available', async () => {
    mockedProductApi.getFeaturedProducts.mockResolvedValue({ items: [{ _id: 'f2', title: 'Top Ad Product', price: 120, category: { name: 'Electronics' } }] } as any);
    mockedProductApi.getProducts.mockResolvedValue({ items: [] } as any);

    render(
      <HelmetProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(screen.getByText('ផលិតផលដែលផ្តើមលក់')).toBeInTheDocument());
    expect(screen.getByText('Top Ad Product')).toBeInTheDocument();
  });
});
