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
});
