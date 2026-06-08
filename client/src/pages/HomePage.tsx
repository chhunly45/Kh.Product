import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import TopAdBanner from '../components/marketplace/TopAdBanner';
import CategoriesGrid from '../components/marketplace/CategoriesGrid';
import FeaturedSection from '../components/marketplace/FeaturedSection';
import SEO from '../components/SEO';
import { Star, TrendingUp, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { getProducts } from '../services/product.api';

const HomePage = () => {
  const [topAds, setTopAds] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loadingTopAds, setLoadingTopAds] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    const loadTopAds = async () => {
      setLoadingTopAds(true);
      try {
        const { items } = await getProducts({ page: '1', perPage: '8' });
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

      {/* Hero Banner Section - Large & Impressive */}
      <section className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-10 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        {/* Background Image Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=2000&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-semibold uppercase tracking-widest text-sky-200">
                  🇰🇭 Welcome to Cambodia's #1 Marketplace
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Buy, Sell & Discover Amazing Deals
                </h1>
              </div>
              
              <p className="text-lg sm:text-xl text-sky-100 max-w-xl leading-relaxed">
                Join millions of Cambodians buying and selling everything from electronics to real estate. Fast, safe, and 100% free.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-sky-400/30">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">10K+</div>
                  <p className="text-xs sm:text-sm text-sky-200">Products</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">50K+</div>
                  <p className="text-xs sm:text-sm text-sky-200">Trusted Users</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">24/7</div>
                  <p className="text-xs sm:text-sm text-sky-200">Support</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-white text-sky-600 font-bold hover:shadow-2xl hover:shadow-white/50 transition transform hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  to="/post-product"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Post Now
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature Card 1 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition">
                <Zap className="w-8 h-8 mb-3 text-yellow-300" />
                <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                <p className="text-sm text-sky-100">Post in seconds</p>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition">
                <ShieldCheck className="w-8 h-8 mb-3 text-green-300" />
                <h3 className="font-bold text-lg mb-2">100% Safe</h3>
                <p className="text-sm text-sky-100">Secure transactions</p>
              </div>
              {/* Feature Card 3 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition">
                <TrendingUp className="w-8 h-8 mb-3 text-blue-300" />
                <h3 className="font-bold text-lg mb-2">Real Results</h3>
                <p className="text-sm text-sky-100">Connect instantly</p>
              </div>
              {/* Feature Card 4 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition">
                <Star className="w-8 h-8 mb-3 text-amber-300" />
                <h3 className="font-bold text-lg mb-2">Always Free</h3>
                <p className="text-sm text-sky-100">No hidden charges</p>
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
