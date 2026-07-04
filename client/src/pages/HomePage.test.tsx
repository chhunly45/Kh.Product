import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import * as productApi from '../services/product.api';

jest.mock('../components/marketplace/ProductCard', () => ({ __esModule: true, default: ({ title, titleKh, titleEn }: any) => <div data-testid="product-card">{String(title ?? titleKh ?? titleEn ?? '')}</div> }));
jest.mock('../services/product.api');

const mockedProductApi = productApi as jest.Mocked<typeof productApi>;

describe('HomePage normalization and rendering', () => {
  beforeEach(() => {
    mockedProductApi.getFeaturedProducts.mockResolvedValue({ items: [] } as any);
    mockedProductApi.getProducts.mockResolvedValue({ items: [{ _id: '1', title: 'Phone', price: 100, category: { name: 'Electronics' } }] } as any);
  });

  it('renders hero and triggers product load', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText(/ទិញ និង លក់/i)).toBeInTheDocument();
    await waitFor(() => expect(mockedProductApi.getProducts).toHaveBeenCalledWith({ page: '1', perPage: '12' }));
  });

  it('normalizes diverse product shapes and displays featured/latest', async () => {
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
});
