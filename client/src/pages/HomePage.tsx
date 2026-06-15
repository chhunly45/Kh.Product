import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import TopAdBanner from '../components/marketplace/TopAdBanner';
import FeaturedSection from '../components/marketplace/FeaturedSection';
import SEO from '../components/SEO';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { getProducts, getFeaturedProducts } from '../services/product.api';
import ProductCard from '../components/marketplace/ProductCard';

const categories = [
  { name: 'ម្ហូប / Food', icon: '🍜', slug: 'food' },
  { name: 'ឈានឈប់ / Clothing', icon: '👕', slug: 'clothing' },
  { name: 'ឯកសារ / Electronics', icon: '📱', slug: 'electronics' },
  { name: 'វាង / Home', icon: '🏠', slug: 'home' },
  { name: 'ពលុង / Sports', icon: '⚽', slug: 'sports' },
  { name: 'សៃលក្ខ័ / Beauty', icon: '💄', slug: 'beauty' },
  { name: 'សៃលក្ខ័ / Books', icon: '📚', slug: 'books' },
  { name: 'ឥលាស / Auto', icon: '🚗', slug: 'auto' },
];

const verifiedSellers = [
  { name: 'Phnom Penh Electronics', rating: 4.8, sales: '2.4K' },
  { name: 'Siem Reap Fashion Hub', rating: 4.9, sales: '1.8K' },
  { name: 'Kampong Cham Goods', rating: 4.7, sales: '1.2K' },
  { name: 'Battambang Premium', rating: 4.9, sales: '980' },
];

const HomePage = () => {
  const [topAds, setTopAds] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loadingTopAds, setLoadingTopAds] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    const loadTopAds = async () => {
      setLoadingTopAds(true);
      try {
        const { items } = await getFeaturedProducts({ page: '1', perPage: '12' });
        setTopAds(items || []);
      } catch (error) {
        setTopAds([]);
      } finally {
        setLoadingTopAds(false);
      }
    };

    const loadLatest = async () => {
      setLoadingLatest(true);
      try {
        const { items } = await getProducts({ page: '1', perPage: '12' });
        setLatestProducts(items || []);
      } catch (error) {
        setLatestProducts([]);
      } finally {
        setLoadingLatest(false);
      }
    };

    loadTopAds();
    loadLatest();
  }, []);

  return (
    <div className="bg-gradient-to-b from-background to-surface">
      <SEO
        title="Konpuk - ផ្សារលើអ៊ីនធឺណេតកម្ពុជា | Cambodia Marketplace"
        description="ស្វាគមន៍ទៅក្នុង Konpuk - ផ្សារលក់ឡើងវិញលើអ៊ីនធឺណេតសម្រាប់ម៉ាន់ចនិក្សកម្ពុជា។ ស្វាគមន៍ផលិតផល ផ្សារលក់ដាច់ស្បើយ ដើម្បីឱ្យងាយស្រួល | Find and sell local products across Cambodia with trusted sellers."
        url="https://konpuk.com/"
        image="https://via.placeholder.com/1200x630.png?text=Konpuk+Cambodia"
      />

      {/* Compact Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0F766E] to-teal-800 text-white">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.2) 35px, rgba(255,255,255,.2) 70px)'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.02em]">
              ស្វាគមន៍ការទិញ និងលក់នៅ
              <br />
              <span className="text-[#F59E0B]">កម្ពុជា</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/90">
              ផ្សារលេលិក ដែលរលាក់ដោយផ្ទាល់ - អ្នកលក់ផ្ទៀងផ្ទាត់ ឥតគិតថ្លៃ និងលឿន
              <br className="hidden sm:block" />
              <span className="text-xs text-white/70">Cambodia's trusted marketplace - Find & sell locally</span>
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mt-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs sm:text-sm font-bold text-[#0F766E] shadow-lg hover:bg-white/95 transition"
              >
                🔍 Browse
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
              >
                📝 Sell
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative -mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="rounded-2xl bg-white p-4 shadow-xl border border-muted">
          <SearchBar />
        </div>
      </section>

      <TopAdBanner />

      {/* Main Content - Featured Products with Categories Sidebar */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Desktop Categories Sidebar */}
            <div className="hidden lg:block">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F766E] mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products?category=${cat.slug}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-primary hover:bg-background transition group"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="flex-1">{cat.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-wider text-[#F59E0B] font-bold">⭐ Featured</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Featured Products</h2>
                </div>
                <Link
                  to="/products"
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:text-[#0F766E]/80 transition"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loadingTopAds ? (
                <div className="rounded-2xl border border-muted bg-background p-12 text-center text-text-secondary">
                  Loading featured products…
                </div>
              ) : topAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topAds.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-muted bg-background p-12 text-center text-text-secondary">
                  No featured products yet
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Categories - Horizontally Scrollable */}
      <section className="lg:hidden py-6 sm:py-8 bg-background border-b border-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F766E] mb-4">Browse Categories</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white border border-muted hover:bg-[#0F766E]/5 transition flex-shrink-0"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-text-primary text-center whitespace-nowrap">{cat.name.split(' /')[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-[#F59E0B] font-bold">🆕 Latest</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Latest Additions</h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:text-[#0F766E]/80 transition"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingLatest ? (
            <div className="rounded-2xl border border-muted bg-background p-12 text-center text-text-secondary">
              Loading latest products…
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestProducts.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-muted bg-background p-12 text-center text-text-secondary">
              No products yet
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-[#F59E0B] font-bold">🏷️ Browse</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Popular Categories</h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:text-[#0F766E]/80 transition"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl border border-muted bg-white p-6 hover:shadow-lg transition overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E]/5 to-[#F59E0B]/5 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative text-center">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold text-text-primary text-sm">{cat.name.split(' /')[0]}</h3>
                  <p className="text-xs text-muted mt-1">{cat.name.split(' / ')[1]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Sellers */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-[#F59E0B] font-bold">✅ Verified</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Verified Sellers</h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:text-[#0F766E]/80 transition"
            >
              Browse all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {verifiedSellers.map((seller, idx) => (
              <div key={idx} className="rounded-2xl border border-muted bg-gradient-to-br from-white to-background p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0F766E] to-[#F59E0B] flex items-center justify-center text-white font-bold">
                    {seller.name.charAt(0)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F59E0B]">
                    ⭐ {seller.rating}
                  </span>
                </div>
                <h3 className="font-semibold text-text-primary text-sm mb-2 line-clamp-2">{seller.name}</h3>
                <p className="text-xs text-muted">{seller.sales} sales</p>
                <button className="w-full mt-4 rounded-lg bg-[#0F766E]/10 px-3 py-2 text-xs font-semibold text-[#0F766E] hover:bg-[#0F766E]/20 transition">
                  View Store
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-[#0F766E] to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to join Konpuk?</h2>
          <p className="text-lg max-w-2xl mx-auto text-white/90">Start buying and selling with Cambodia's most trusted community today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-[#0F766E] hover:bg-white/90 transition"
            >
              Sign up for free
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full border border-white px-8 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


