import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import TopAdBanner from '../components/marketplace/TopAdBanner';
import CategoriesGrid from '../components/marketplace/CategoriesGrid';
import FeaturedSection from '../components/marketplace/FeaturedSection';
import SEO from '../components/SEO';
import { Star, TrendingUp, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { getProducts, getFeaturedProducts } from '../services/product.api';

const HomePage = () => {
  const [topAds, setTopAds] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loadingTopAds, setLoadingTopAds] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    const loadTopAds = async () => {
      setLoadingTopAds(true);
      try {
        const { items } = await getFeaturedProducts({ page: '1', perPage: '8' });
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
        const { items } = await getProducts({ page: '1', perPage: '8' });
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
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="Cambodia's local marketplace"
        description="Find and sell local products across Cambodia with Konpuk. Secure messaging, easy listings, and a trusted community."
        url="https://konpuk.com/"
        image="https://via.placeholder.com/1200x630.png?text=Konpuk"
      />

      {/* Hero Banner Section - Modern Konpuk */}
      <section className="relative overflow-hidden bg-background">
        {/* Angkor-inspired line art */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#0F766E" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#g1)" strokeWidth="1.5">
            <path d="M0,200 C150,100 350,300 600,200 C850,100 1050,300 1200,200" />
            <path d="M0,260 C200,160 400,360 600,260 C800,160 1000,360 1200,260" />
            <path d="M0,320 C180,220 420,420 600,320 C780,220 1020,420 1200,320" />
          </g>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-semibold uppercase tracking-widest text-text-secondary">
                  🇰🇭 Welcome to Konpuk
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-text-primary">
                  Buy, Sell & Discover Premium Local Finds
                </h1>
              </div>

              <p className="text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed">
                A refined marketplace experience for Cambodian buyers and sellers. Trusted listings, beautiful design, and effortless search.
              </p>

              <div className="mt-6">
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <SearchBar />
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-muted">
                <h3 className="text-xl font-bold text-text-primary mb-4">Featured benefits</h3>
                <ul className="space-y-3 text-text-secondary">
                  <li>Premium curated listings</li>
                  <li>Verified sellers and secure messaging</li>
                  <li>Fast posting and smart recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section - Sticky */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-6 relative z-10">
        <SearchBar />
      </section>

      {/* Top Advertising Banner */}
      <TopAdBanner />

      {/* Browse By Category */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-sky-600 font-bold">Find Anything</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">Browse by Category</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold text-white hover:bg-sky-600 transition group"
            >
              Explore All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
        <CategoriesGrid />
      </section>

      {/* Top Ads Section */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">Top ads</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">Featured products in your area</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              View all listings
            </Link>
          </div>

          <div className="mt-8">
            {loadingTopAds ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600">Loading featured products…</div>
            ) : (
              <FeaturedSection title="" products={topAds} viewAllLink="/products" />
            )}
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">Latest additions</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">Newest products</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Browse latest
            </Link>
          </div>

          <div className="mt-8">
            {loadingLatest ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-600">Loading latest products…</div>
            ) : (
              <FeaturedSection title="" products={latestProducts} viewAllLink="/products" />
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">Why Choose Konpuk?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-sky-200 transition">
              <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Fast & Easy</h3>
              <p className="text-slate-600">Post your products in minutes. Browse thousands of listings instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-green-200 transition">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Safe & Secure</h3>
              <p className="text-slate-600">Verified sellers and secure messaging to keep you protected.</p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-purple-200 transition">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Real Results</h3>
              <p className="text-slate-600">Connect directly with buyers and sellers in your area.</p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-amber-200 transition">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Free to Use</h3>
              <p className="text-slate-600">No hidden fees. Post, browse, and message completely free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-sky-500 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Join Konpuk?</h2>
          <p className="text-lg text-sky-100 max-w-2xl mx-auto">Start buying and selling with Cambodia's most trusted community today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-sky-600 font-bold hover:bg-sky-50 transition"
            >
              Sign Up for Free
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
