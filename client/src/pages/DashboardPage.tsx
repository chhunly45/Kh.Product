import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/auth.api';
import { getProducts, updateProduct, deleteProduct } from '../services/product.api';
import { Edit3, Trash2, CheckCircle, PlusCircle, Eye, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    setMessage('');
    try {
      const profile = await getProfile();
      setUser(profile);

      if (profile?.id) {
        const response = await getProducts({ seller: profile.id, page: '1', perPage: '50', sort: 'newest' });
        setProducts(response.items || []);
      }
    } catch (error) {
      setMessage('Unable to load your dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkSold = async (productId: string) => {
    try {
      await updateProduct(productId, { status: 'sold' });
      setMessage('Product marked as sold.');
      loadDashboard();
    } catch (error) {
      setMessage('Could not update product status.');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      setMessage('Product deleted successfully.');
      setProducts((current) => current.filter((item) => item._id !== productId));
    } catch (error) {
      setMessage('Unable to delete product.');
    }
  };

  const activeCount = products.filter((product) => product.status === 'published').length;
  const soldCount = products.filter((product) => product.status === 'sold').length;
  const draftCount = products.filter((product) => product.status === 'draft').length;
  const totalViews = products.reduce((sum, product) => sum + (product.viewsCount || 0), 0);
  const mostViewedProducts = [...products]
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Seller dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your active listings, update status, and keep track of your products.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/post-product')}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition"
          >
            <PlusCircle className="w-4 h-4" /> Post new listing
          </button>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-5">
        {[
          { label: 'Total listings', value: products.length, icon: PlusCircle },
          { label: 'Active listings', value: activeCount, icon: TrendingUp },
          { label: 'Sold items', value: soldCount, icon: CheckCircle },
          { label: 'Total views', value: totalViews, icon: Eye },
          { label: 'Drafts', value: draftCount, icon: PlusCircle }
        ].map((stat) => (
          <article key={stat.label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3">
                <stat.icon className="w-6 h-6 text-sky-600" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Most viewed products</h2>
          <p className="mt-2 text-sm text-slate-500">Your top performing listings based on view count.</p>
        </div>

        {mostViewedProducts.length ? (
          <div className="mt-6 space-y-3">
            {mostViewedProducts.map((product, idx) => (
              <div key={product._id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-600">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-slate-900">{product.title}</p>
                  <p className="text-xs text-slate-500">{product.category?.labelKh || product.category?.name || 'General'}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1">
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-semibold text-sky-700">{product.viewsCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
            <p>No products with views yet. Create and share your listings to get views.</p>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Manage your ads</h2>
            <p className="mt-2 text-sm text-slate-500">Edit, delete, or mark your products as sold from one place.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/post-product')}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Create listing
          </button>
        </div>

        {message && <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-600">Loading your listings…</div>
        ) : products.length ? (
          <div className="mt-6 grid gap-4">
            {products.map((product) => (
              <article key={product._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-slate-900">{product.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>{product.category?.labelKh || product.category?.name || 'General'}</span>
                      <span>{product.location || 'Unknown location'}</span>
                      <span>{formatPrice(product.price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {product.status === 'sold' ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Sold</span>
                    ) : (
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">{product.status || 'Published'}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/post-product?id=${product._id}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 transition"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    {product.status !== 'sold' && (
                      <button
                        type="button"
                        onClick={() => handleMarkSold(product._id)}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark sold
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
            <p className="text-lg font-semibold">No active ads yet</p>
            <p className="mt-2 text-sm">Create your first listing to start selling.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const formatPrice = (price: number | string) => {
  if (typeof price === 'number') {
    return `KHR ${price.toLocaleString()}`;
  }
  return typeof price === 'string' ? `KHR ${Number(price).toLocaleString()}` : 'KHR 0';
};

export default DashboardPage;
