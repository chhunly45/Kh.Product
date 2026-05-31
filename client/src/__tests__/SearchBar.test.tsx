import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import api from '../services/api';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

jest.mock('../services/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('SearchBar', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    mockedApi.get.mockResolvedValue({ data: { data: [{ _id: '1', name: 'Electronics' }] } });
  });

  it('renders search inputs and toggles advanced filters', async () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/what are you looking for/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /show advanced filters/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/province/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
    });
  });

  it('allows advanced filter selection and input values', async () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /show advanced filters/i });
    fireEvent.click(toggleButton);

    await waitFor(() => expect(screen.getByLabelText(/category/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/province/i), { target: { value: 'Phnom Penh' } });
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'used' } });
    fireEvent.change(screen.getByLabelText(/posted/i), { target: { value: '7d' } });
    fireEvent.change(screen.getByPlaceholderText(/min/i), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/max/i), { target: { value: '500' } });

    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('1');
    expect((screen.getByLabelText(/province/i) as HTMLSelectElement).value).toBe('Phnom Penh');
    expect((screen.getByLabelText(/condition/i) as HTMLSelectElement).value).toBe('used');
    expect((screen.getByLabelText(/posted/i) as HTMLSelectElement).value).toBe('7d');
    expect((screen.getByPlaceholderText(/min/i) as HTMLInputElement).value).toBe('100');
    expect((screen.getByPlaceholderText(/max/i) as HTMLInputElement).value).toBe('500');
  });

  it('opens advanced filters when initial filters are provided', async () => {
    render(
      <MemoryRouter>
        <SearchBar
          initialFilters={{
            search: 'bike',
            location: 'Phnom Penh',
            category: '1',
            province: 'Phnom Penh',
            condition: 'used',
            minPrice: '100',
            maxPrice: '500',
            datePosted: '7d'
          }}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /hide advanced filters/i })).toBeInTheDocument());
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('1');
    expect((screen.getByLabelText(/province/i) as HTMLSelectElement).value).toBe('Phnom Penh');
    expect((screen.getByLabelText(/condition/i) as HTMLSelectElement).value).toBe('used');
    expect((screen.getByLabelText(/posted/i) as HTMLSelectElement).value).toBe('7d');
  });

  it('handles category fetch failures gracefully', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Network fail'));

    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /show advanced filters/i });
    fireEvent.click(toggleButton);

    await waitFor(() => expect(screen.getByLabelText(/category/i)).toBeInTheDocument());
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).children.length).toBeGreaterThanOrEqual(1);
  });

  it('submits advanced search filters and navigates with query params', async () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/what are you looking for/i), { target: { value: 'phone' } });
    fireEvent.change(screen.getByPlaceholderText(/location/i), { target: { value: 'Kampot' } });

    fireEvent.click(screen.getByRole('button', { name: /show advanced filters/i }));
    await waitFor(() => expect(screen.getByLabelText(/category/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/province/i), { target: { value: 'Kampot' } });
    fireEvent.change(screen.getByLabelText(/condition/i), { target: { value: 'used' } });
    fireEvent.change(screen.getByLabelText(/posted/i), { target: { value: '30d' } });
    fireEvent.change(screen.getByPlaceholderText(/min/i), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/max/i), { target: { value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(mockedNavigate).toHaveBeenCalledWith(
      '/products?search=phone&location=Kampot&category=1&province=Kampot&condition=used&minPrice=100&maxPrice=500&datePosted=30d'
    );
  });
});
