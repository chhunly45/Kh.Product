import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('../services/user.api', () => ({
  getUserProfile: jest.fn()
}));
jest.mock('../services/auth.api', () => ({
  getProfile: jest.fn()
}));
jest.mock('../services/product.api', () => ({
  getProducts: jest.fn()
}));
jest.mock('../services/review.api', () => ({
  getSellerReviews: jest.fn(),
  createReview: jest.fn()
}));
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null })
}));

// mock useParams from react-router-dom to return a seller id
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'seller1' })
}));

import ProfilePage from '../pages/ProfilePage';
import * as userApi from '../services/user.api';
import * as productApi from '../services/product.api';
import * as reviewApi from '../services/review.api';

describe('ProfilePage heading interpolation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const getUserProfileMock = userApi.getUserProfile;
    const getProductsMock = productApi.getProducts;
    const getSellerReviewsMock = reviewApi.getSellerReviews;

    getUserProfileMock.mockResolvedValue({ id: 'seller1', displayName: 'Chhay Chhunly' });
    getProductsMock.mockResolvedValue({ items: [] });
    getSellerReviewsMock.mockResolvedValue({ items: [], summary: { avgRating: 0, totalReviews: 0 } });
  });

  it('renders seller display name in English heading and does not render {name} placeholder', async () => {
    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText(/Products by/i)).toBeInTheDocument());

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Products by Chhay Chhunly');
    expect(document.body.textContent).not.toContain('{name}');
  });

  it('keeps the primary profile tabs and products action available', async () => {
    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText(/Products by/i)).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /about/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /products/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /reviews/i })).toBeInTheDocument();
  });

  it('uses the fallback products heading when the seller display name is unavailable', async () => {
    const getUserProfileMock = userApi.getUserProfile;
    getUserProfileMock.mockResolvedValueOnce({ id: 'seller2' });

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText(/Products by this seller/i)).toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('ផលិតផលរបស់អ្នកលក់នេះ / Products by this seller');
    expect(document.body.textContent).not.toContain('{name}');
  });

  it('renders readable social labels for supported and unsupported links', async () => {
    const getUserProfileMock = userApi.getUserProfile;
    getUserProfileMock.mockResolvedValueOnce({
      id: 'seller3',
      displayName: 'Sokna',
      telegram: 'https://example.com/channel',
      facebook: 'https://www.facebook.com/sokna'
    });

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText('Facebook')).toBeInTheDocument());
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.queryByText('https://example.com/channel')).not.toBeInTheDocument();
    expect(screen.queryByText('https://www.facebook.com/sokna')).not.toBeInTheDocument();
  });

  it('renders the seller identity group and hero stats in the profile hero', async () => {
    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: /Chhay Chhunly/i })).toBeInTheDocument());

    expect(screen.getByRole('group', { name: /seller identity/i })).toBeInTheDocument();
    expect(screen.getByText(/Verified Seller/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile Views/i)).toBeInTheDocument();
  });

  it('renders API-backed seller stats in the hero', async () => {
    const getUserProfileMock = userApi.getUserProfile;
    const getProductsMock = productApi.getProducts;

    getUserProfileMock.mockResolvedValueOnce({ id: 'sellerStats', displayName: 'StatSeller', stats: { totalProducts: 5, totalViews: 17 } });
    getProductsMock.mockResolvedValueOnce({ items: [] });

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: /StatSeller/i })).toBeInTheDocument());

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });
});
