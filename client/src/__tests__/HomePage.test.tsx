import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../services/api';
import HomePage from '../pages/HomePage';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('HomePage', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: { data: [{ _id: '1', name: 'Electronics' }] } });
  });

  it('renders the homepage hero and search bar', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Buy, Sell & Discover Local Products/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/categories');
    });
  });
});
