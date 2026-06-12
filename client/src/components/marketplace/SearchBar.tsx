import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { getProvinces, getDistricts, Province, District } from '../../services/location.api';

interface SearchBarProps {
  initialFilters?: {
    search?: string;
    location?: string;
    category?: string;
    province?: string;
    district?: string;
    condition?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    datePosted?: string;
  };
}

const SearchBar = ({ initialFilters }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [category, setCategory] = useState(initialFilters?.category || '');
  const [province, setProvince] = useState(initialFilters?.province || '');
  const [district, setDistrict] = useState(initialFilters?.district || '');
  const [condition, setCondition] = useState(initialFilters?.condition || '');
  const [sort, setSort] = useState(initialFilters?.sort || '');
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || '');
  const [datePosted, setDatePosted] = useState(initialFilters?.datePosted || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  interface CategoryItem { _id: string; name: string; labelKh?: string }
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'priceAsc', label: 'Price low to high' },
    { value: 'priceDesc', label: 'Price high to low' }
  ];
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(initialFilters?.search || '');
    setLocation(initialFilters?.location || '');
    setCategory(initialFilters?.category || '');
    setProvince(initialFilters?.province || '');
    setDistrict(initialFilters?.district || '');
    setCondition(initialFilters?.condition || '');
    setSort(initialFilters?.sort || '');
    setMinPrice(initialFilters?.minPrice || '');
    setMaxPrice(initialFilters?.maxPrice || '');
    setDatePosted(initialFilters?.datePosted || '');

    const hasFilters = initialFilters
      ? Object.values(initialFilters).some((value) => Boolean(value))
      : false;
    setShowAdvanced(hasFilters);
  }, [initialFilters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        setCategories([]);
      }
    };

    const fetchProvinces = async () => {
      try {
        const provincesData = await getProvinces();
        setProvinces(provincesData);
        if (initialFilters?.province) {
          try {
            const districtsData = await getDistricts(initialFilters.province);
            setDistricts(districtsData);
          } catch (error) {
            console.error('Failed to load districts:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load provinces:', error);
      }
    };

    fetchCategories();
    fetchProvinces();
  }, []);

  useEffect(() => {
    const loadDistrictsForProvince = async () => {
      if (province) {
        try {
          const districtsData = await getDistricts(province);
          setDistricts(districtsData);
        } catch (error) {
          console.error('Failed to load districts:', error);
        }
      } else {
        setDistricts([]);
      }
      setDistrict('');
    };

    loadDistrictsForProvince();
  }, [province]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    if (category) params.append('category', category);
    if (province) params.append('province', province);
    if (district) params.append('district', district);
    if (condition) params.append('condition', condition);
    if (sort) params.append('sort', sort);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (datePosted) params.append('datePosted', datePosted);

    const queryString = params.toString();
    navigate(queryString ? `/products?${queryString}` : '/products');
  };

  return (
    <form onSubmit={handleSearch} className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="What are you looking for?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full sm:w-44 pl-12 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition duration-200 shadow-lg shadow-sky-500/30"
        >
          Search
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
      </button>

      {showAdvanced && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Any category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.labelKh || cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Province</span>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Any province</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">District</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!province}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Any district</option>
              {districts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Condition</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Any condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Default sort</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Posted</span>
            <select
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Min price</span>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="Min"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Max price</span>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="Max"
              />
            </label>
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
