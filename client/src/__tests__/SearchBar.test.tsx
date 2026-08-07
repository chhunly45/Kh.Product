import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import api from '../services/api';
import { getProvinces, getDistricts } from '../services/location.api';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

jest.mock('../services/api');
jest.mock('../services/location.api', () => ({
  getProvinces: jest.fn(),
  getDistricts: jest.fn()
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetProvinces = getProvinces as jest.MockedFunction<typeof getProvinces>;
const mockedGetDistricts = getDistricts as jest.MockedFunction<typeof getDistricts>;

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderSearchBar = async (initialFilters?: any) => {
  await act(async () => {
    render(
      <MemoryRouter>
        <SearchBar initialFilters={initialFilters} />
      </MemoryRouter>
    );
    await flushAsync();
    await flushAsync();
  });
};

describe('SearchBar', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message?: any, ...optionalParams: any[]) => {
      if (typeof message === 'string' && message.includes('not wrapped in act')) {
        return;
      }
      console.warn(message, ...optionalParams);
    });
    mockedNavigate.mockClear();
    mockedApi.get.mockResolvedValue({ data: { data: [{ _id: '1', name: 'Electronics' }] } });
    mockedGetProvinces.mockResolvedValue([{ id: 1, name: 'Phnom Penh' } as any]);
    mockedGetDistricts.mockResolvedValue([] as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders search inputs and toggles advanced filters', async () => {
    await renderSearchBar();

    await waitFor(() => expect(mockedGetProvinces).toHaveBeenCalled());
    expect(screen.getByPlaceholderText(/ស្វែងរកផលិតផល/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ទីតាំង/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /បង្ហាញតម្រងជម្រៅ/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/ប្រភេទ/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ខេត្ត/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/លក្ខខណ្ឌ/i)).toBeInTheDocument();
    });
  });

  it('allows advanced filter selection and input values', async () => {
    await renderSearchBar();

    const toggleButton = screen.getByRole('button', { name: /បង្ហាញតម្រងជម្រៅ/i });
    fireEvent.click(toggleButton);

    await waitFor(() => expect(screen.getByLabelText(/ប្រភេទ/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/ប្រភេទ/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/ខេត្ត/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/លក្ខខណ្ឌ/i), { target: { value: 'used' } });
    fireEvent.change(screen.getByLabelText(/ពេលដែលបានផុស/i), { target: { value: '7d' } });
    fireEvent.change(screen.getByPlaceholderText(/min/i), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/max/i), { target: { value: '500' } });

    expect((screen.getByLabelText(/ប្រភេទ/i) as HTMLSelectElement).value).toBe('1');
    expect((screen.getByLabelText(/ខេត្ត/i) as HTMLSelectElement).value).toBe('1');
    expect((screen.getByLabelText(/លក្ខខណ្ឌ/i) as HTMLSelectElement).value).toBe('used');
    expect((screen.getByLabelText(/ពេលដែលបានផុស/i) as HTMLSelectElement).value).toBe('7d');
    expect((screen.getByPlaceholderText(/min/i) as HTMLInputElement).value).toBe('100');
    expect((screen.getByPlaceholderText(/max/i) as HTMLInputElement).value).toBe('500');
  });

  it('opens advanced filters when initial filters are provided', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <SearchBar
            initialFilters={{
              search: 'bike',
              location: 'Phnom Penh',
              category: '1',
              province: '1',
              condition: 'used',
              minPrice: '100',
              maxPrice: '500',
              datePosted: '7d'
            }}
          />
        </MemoryRouter>
      );
      await Promise.resolve();
    });

    await waitFor(() => expect(mockedGetProvinces).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: /លាក់តម្រងជម្រៅ/i })).toBeInTheDocument());
    expect(screen.getByLabelText(/ប្រភេទ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ខេត្ត/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/លក្ខខណ្ឌ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ពេលដែលបានផុស/i)).toBeInTheDocument();
  });

  it('handles category fetch failures gracefully', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Network fail'));

    await renderSearchBar();

    const toggleButton = screen.getByRole('button', { name: /បង្ហាញតម្រងជម្រៅ/i });
    fireEvent.click(toggleButton);

    await waitFor(() => expect(screen.getByLabelText(/ប្រភេទ/i)).toBeInTheDocument());
    expect((screen.getByLabelText(/ប្រភេទ/i) as HTMLSelectElement).children.length).toBeGreaterThanOrEqual(1);
  });

  it('submits advanced search filters and navigates with query params', async () => {
    await renderSearchBar();

    await waitFor(() => expect(mockedGetProvinces).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText(/ស្វែងរកផលិតផល/i), { target: { value: 'phone' } });
    fireEvent.change(screen.getByPlaceholderText(/ទីតាំង/i), { target: { value: 'Kampot' } });

    fireEvent.click(screen.getByRole('button', { name: /បង្ហាញតម្រងជម្រៅ/i }));
    await waitFor(() => expect(screen.getByLabelText(/ប្រភេទ/i)).toBeInTheDocument());

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/ប្រភេទ/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/ខេត្ត/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/លក្ខខណ្ឌ/i), { target: { value: 'used' } });
      fireEvent.change(screen.getByLabelText(/ពេលដែលបានផុស/i), { target: { value: '30d' } });
      await flushAsync();
      await flushAsync();
    });
    fireEvent.change(screen.getByPlaceholderText(/min/i), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/max/i), { target: { value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: /ស្វែងរក/i }));

    expect(mockedNavigate).toHaveBeenCalledWith(
      '/products?search=phone&location=Kampot&category=1&province=1&condition=used&minPrice=100&maxPrice=500&datePosted=30d'
    );
  });
});
