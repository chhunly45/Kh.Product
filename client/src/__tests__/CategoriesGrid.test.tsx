import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CategoriesGrid from '../components/marketplace/CategoriesGrid';
import { MemoryRouter } from 'react-router-dom';
import api from '../services/api';

jest.mock('../services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('CategoriesGrid', () => {
  afterEach(() => {
    mockedApi.get.mockReset();
  });

  test('shows loading state initially', () => {
    mockedApi.get.mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <CategoriesGrid />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading categories/i)).toBeInTheDocument();
  });

  test('renders categories when API returns data', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [{ _id: '1', name: 'Electronics' }, { _id: '2', name: 'Books' }] } } as any);
    render(
      <MemoryRouter>
        <CategoriesGrid />
      </MemoryRouter>
    );
    expect(await screen.findByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  test('handles API error and shows empty/loading block', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network'));
    render(
      <MemoryRouter>
        <CategoriesGrid />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Loading categories/i)).toBeInTheDocument());
  });

  test('renders all category icon branches for different category names', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [
      { _id: '1', name: 'Smartphones' },
      { _id: '2', name: 'Electronics' },
      { _id: '3', name: 'Motorcycle' },
      { _id: '4', name: 'Home Goods' },
      { _id: '5', name: 'Photography' },
      { _id: '6', name: 'Fashion Boutique' },
      { _id: '7', name: 'Books and Learning' },
      { _id: '8', name: 'Art and Design' },
      { _id: '9', name: 'Food Services' },
      { _id: '10', name: 'Unknown Category' },
      { _id: '11', labelKh: 'ផ្ទះ' }
    ] } } as any);

    render(
      <MemoryRouter>
        <CategoriesGrid />
      </MemoryRouter>
    );

    expect(await screen.findByText('Smartphones')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Motorcycle')).toBeInTheDocument();
    expect(screen.getByText('Home Goods')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
    expect(screen.getByText('Fashion Boutique')).toBeInTheDocument();
    expect(screen.getByText('Books and Learning')).toBeInTheDocument();
    expect(screen.getByText('Art and Design')).toBeInTheDocument();
    expect(screen.getByText('Food Services')).toBeInTheDocument();
    expect(screen.getByText('Unknown Category')).toBeInTheDocument();
    expect(screen.getByText('ផ្ទះ')).toBeInTheDocument();
  });
});
