import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetailPage from '../pages/ProductDetailPage';
import * as productApi from '../services/product.api';

jest.mock('../services/product.api');
const mockedProductApi = productApi as jest.Mocked<typeof productApi>;

describe('ProductDetailPage', () => {
  it('loads and renders product details', async () => {
    mockedProductApi.getProductById.mockResolvedValue({
      _id: '123',
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
      <MemoryRouter initialEntries={['/products/123']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(mockedProductApi.getProductById).toHaveBeenCalledWith('123'));
    expect(screen.getByRole('heading', { name: /Detailed Product/i })).toBeInTheDocument();
    expect(screen.getByText(/A detailed product description/i)).toBeInTheDocument();
    expect(screen.getByText(/Seller One/i)).toBeInTheDocument();
  });

  it('renders fallback content when no product images are available', async () => {
    mockedProductApi.getProductById.mockResolvedValue({
      _id: '456',
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
      <MemoryRouter initialEntries={['/products/456']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(mockedProductApi.getProductById).toHaveBeenCalledWith('456'));
    expect(screen.queryByRole('img', { name: /Product image/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Gallery/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No Image Product/i)).toBeInTheDocument();
  });

  it('shows an error message when product load fails', async () => {
    mockedProductApi.getProductById.mockRejectedValue(new Error('Network failure'));

    render(
      <MemoryRouter initialEntries={['/products/999']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Unable to load product/i)).toBeInTheDocument());
  });

  it('handles deleting an image and refreshes the gallery', async () => {
    mockedProductApi.getProductById.mockResolvedValue({
      _id: '789',
      title: 'Removable Image Product',
      description: 'A product with deletable images',
      price: 3000,
      location: 'Phnom Penh',
      condition: 'new',
      category: { name: 'Electronics' },
      images: [
        { _id: 'img1', secureUrl: 'https://example.com/image1.png', altText: 'Product image 1' },
        { _id: 'img2', secureUrl: 'https://example.com/image2.png', altText: 'Product image 2' }
      ],
      seller: { displayName: 'Seller One', profileImageUrl: '', location: 'Phnom Penh' },
      status: 'published'
    });
    mockedProductApi.deleteProductImage.mockResolvedValue({ success: true } as any);

    render(
      <MemoryRouter initialEntries={['/products/789']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(mockedProductApi.getProductById).toHaveBeenCalledWith('789'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => expect(mockedProductApi.deleteProductImage).toHaveBeenCalledWith('img1'));
    expect(screen.getByText(/Product overview/i)).toBeInTheDocument();
  });

  it('shows a profile image and failure message when deleting an image fails', async () => {
    mockedProductApi.getProductById.mockResolvedValue({
      _id: '901',
      title: 'Error Image Product',
      description: 'A product with a seller image and failed delete',
      price: 4500,
      location: 'Siem Reap',
      condition: 'new',
      category: { name: 'Vehicles' },
      images: [
        { _id: 'img1', secureUrl: 'https://example.com/image1.png', altText: 'Product image 1' }
      ],
      seller: { displayName: 'Seller One', profileImageUrl: 'https://example.com/profile.png', location: 'Siem Reap' },
      status: 'published'
    });
    mockedProductApi.deleteProductImage.mockRejectedValueOnce(new Error('Delete failed'));

    render(
      <MemoryRouter initialEntries={['/products/901']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(mockedProductApi.getProductById).toHaveBeenCalledWith('901'));
    expect(screen.getByAltText('Seller One')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(mockedProductApi.deleteProductImage).toHaveBeenCalledWith('img1'));
    expect(await screen.findByText(/Failed to delete image/i)).toBeInTheDocument();
  });
});
