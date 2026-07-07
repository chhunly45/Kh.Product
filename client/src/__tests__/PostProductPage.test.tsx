import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostProductPage from '../pages/PostProductPage';
import api from '../services/api';
import { getProvinces, getDistricts } from '../services/location.api';

jest.mock('../services/api', () => ({
  get: jest.fn()
}));

jest.mock('../services/location.api', () => ({
  getProvinces: jest.fn(),
  getDistricts: jest.fn()
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetProvinces = getProvinces as jest.MockedFunction<typeof getProvinces>;
const mockedGetDistricts = getDistricts as jest.MockedFunction<typeof getDistricts>;

describe('PostProductPage bilingual copy', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: { data: [{ _id: 'cat1', name: 'Phones', labelKh: 'ទូរស័ព្ទ' }] } } as any);
    mockedGetProvinces.mockResolvedValue([{ id: 1, name: 'Phnom Penh', nameKh: 'ភ្នំពេញ' }] as any);
    mockedGetDistricts.mockResolvedValue([{ id: 10, name: 'Chamkar Mon' }] as any);
  });

  it('renders bilingual page copy with Khmer first and English second', async () => {
    render(
      <MemoryRouter>
        <PostProductPage />
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', {
      level: 1,
      name: /បង្ហោះផលិតផលរបស់អ្នក \/ Post your product/i
    });
    expect(heading).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    expect(screen.getByLabelText(/ចំណងជើងផលិតផល \(ខ្មែរ\) \/ Product title \(Khmer\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ចំណងជើងផលិតផល \(អង់គ្លេស\) \/ Product title \(English\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ប្រភេទផលិតផល \/ Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ការពិពណ៌នា \/ Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/តម្លៃ \(ដុល្លារ USD\) \/ Price \(USD\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ទីតាំង \/ Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ស្ថានភាពផលិតផល \/ Condition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/រាជធានី ឬ ខេត្ត \/ Province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/រូបភាពផលិតផល \/ Product images/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/ស្រុក ឬ ខណ្ឌ \/ District/i)).not.toBeInTheDocument();

    expect(screen.getByRole('option', { name: /ថ្មី \/ New/i })).toHaveValue('new');
    expect(screen.getByRole('option', { name: /ប្រើរួច \/ Used/i })).toHaveValue('used');
    expect(screen.getByRole('option', { name: /ធ្វើឡើងវិញ \/ Refurbished/i })).toHaveValue('refurbished');

    const provinceSelect = await screen.findByLabelText(/រាជធានី ឬ ខេត្ត \/ Province/i) as HTMLSelectElement;
    await waitFor(() => expect(provinceSelect.options.length).toBeGreaterThan(1));
    expect(provinceSelect.options[0].textContent).toBe('ជ្រើសរើសរាជធានី ឬ ខេត្ត / Select province');
    const phnomPenhOption = await screen.findByRole('option', { name: /ភ្នំពេញ/i });
    expect(phnomPenhOption).toHaveValue('1');
    expect(provinceSelect).toContainElement(phnomPenhOption);

    expect(screen.getByText(/Upload up to 6 new images/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/categories');
      expect(mockedGetProvinces).toHaveBeenCalled();
    });
  });
});
