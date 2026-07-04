import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { getProvinces, getDistricts } from '../services/location.api';
import * as productApi from '../services/product.api';
import HomePage from '../pages/HomePage';

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
});
