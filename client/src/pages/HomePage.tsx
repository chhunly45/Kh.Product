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
    <div className="bg-gradient-to-b from-background to-surface">
      <SEO
        title="Cambodia's local marketplace"
        description="Find and sell local products across Cambodia with Konpuk. Secure messaging, easy listings, and a trusted community."
        url="https://konpuk.com/"
        image="https://via.placeholder.com/1200x630.png?text=Konpuk"
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                New Konpuk layout v3
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.03em]">
                Buy, sell, and discover Cambodia's finest local products.
              </h1>
              <p className="max-w-2xl text-lg sm:text-xl text-white/80 leading-relaxed">
                Konpuk brings a fresh marketplace journey with trusted listings, easy posting, and smarter search designed for Cambodian buyers and sellers.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg shadow-primary/20 hover:bg-white/90 transition"
                >
                  Browse products
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  Start selling
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-3xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-bold">1.2K+</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Active listings</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Verified sellers</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-bold">24h</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Response time</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-bold">Free</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">No hidden fees</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-8 shadow-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Fast local discovery</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Find top products from trusted sellers across Phnom Penh, Siem Reap, and beyond.
                </p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-8 shadow-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Trusted community</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Verified profiles, secure messaging, and a marketplace built for Cambodian users.
                </p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-8 shadow-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Clear category access</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Browse by category and find the exact product type you need in seconds.
                </p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-8 shadow-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Smart posting</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Create listings quickly with rich details and beautiful previews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-2xl border border-surface-muted">
          <SearchBar />
        </div>
      </section>

      <TopAdBanner />

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-bold">Find anything</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">Browse by category</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover transition group"
            >
              Explore all
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
        <CategoriesGrid />
      </section>

      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted font-bold">Top ads</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">Featured products in your area</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
            >
              View all listings
            </Link>
          </div>

          <div className="mt-8">
            {loadingTopAds ? (
              <div className="rounded-3xl border border-muted bg-white p-12 text-center text-text-secondary">Loading featured products…</div>
            ) : (
              <FeaturedSection title="" products={topAds} viewAllLink="/products" />
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted font-bold">Latest additions</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">Newest products</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
            >
              Browse latest
            </Link>
          </div>

          <div className="mt-8">
            {loadingLatest ? (
              <div className="rounded-3xl border border-muted bg-background p-12 text-center text-text-secondary">Loading latest products…</div>
            ) : (
              <FeaturedSection title="" products={latestProducts} viewAllLink="/products" />
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-12 text-center">Why choose Konpuk?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Fast & easy</h3>
              <p className="text-text-secondary">Post your products in minutes. Browse thousands of listings instantly.</p>
            </div>

            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Safe & secure</h3>
              <p className="text-text-secondary">Verified sellers and secure messaging to keep you protected.</p>
            </div>

            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Real results</h3>
              <p className="text-text-secondary">Connect directly with buyers and sellers in your area.</p>
            </div>

            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Free to use</h3>
              <p className="text-text-secondary">No hidden fees. Post, browse, and message completely free.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gradient-to-r from-primary to-primary-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to join Konpuk?</h2>
          <p className="text-lg max-w-2xl mx-auto text-white/90">Start buying and selling with Cambodia's most trusted community today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-3xl bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-white/90 transition"
            >
              Sign up for free
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-3xl border border-white px-8 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
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


