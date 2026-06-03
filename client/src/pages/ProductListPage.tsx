import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import ProductCard from '../components/marketplace/ProductCard';
import { getProducts } from '../services/product.api';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const currentFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    province: searchParams.get('province') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    datePosted: searchParams.get('datePosted') || ''
  }), [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const { items, meta } = await getProducts(Object.fromEntries(searchParams.entries()));
        setProducts(items || []);
        setTotal(meta?.total || 0);
      } catch (err) {
        setError('Unable to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Search products</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use filters to narrow down results by category, province, condition, price and post date.
          </p>
          <div className="mt-6">
            <SearchBar initialFilters={currentFilters} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
              <p className="text-sm text-slate-600">Showing {products.length} of {total} matching listings.</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700">Loading products…</div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700">No products found. Try adjusting your filters.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  title={product.title}
                  price={product.price.toLocaleString ? `KHR ${product.price.toLocaleString()}` : product.price}
                  location={product.location || 'Unknown'}
                  category={product.category?.labelKh || product.category?.name || 'General'}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductListPage;
