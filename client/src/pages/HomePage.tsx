import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import TopAdBanner from '../components/marketplace/TopAdBanner';
import CategoriesGrid from '../components/marketplace/CategoriesGrid';
import FeaturedSection from '../components/marketplace/FeaturedSection';
import SEO from '../components/SEO';
import { ArrowRight } from 'lucide-react';
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
        title="Konpuk - ផ្សារលើអ៊ីនធឺណេតកម្ពុជា | Cambodia Marketplace"
        description="ស្វាគមន៍ទៅក្នុង Konpuk - ផ្សារលក់ឡើងវិញលើអ៊ីនធឺណេតសម្រាប់ម៉ាន់ចនិក្សកម្ពុជា។ ស្វាគមន៍ផលិតផល ផ្សារលក់ដាច់ស្បើយ ដើម្បីឱ្យងាយស្រួល | Find and sell local products across Cambodia with trusted sellers."
        url="https://konpuk.com/"
        image="https://via.placeholder.com/1200x630.png?text=Konpuk+Cambodia"
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover text-white">
        {/* Angkor-inspired decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.2) 35px, rgba(255,255,255,.2) 70px)'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-200">វេលាដែលបានរង់ចាំរបស់អ្នក</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.02em]">
                  ស្វាគមន៍ការទិញ និងលក់នៅ
                  <br />
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">កម្ពុជា</span>
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                ស្វាគមន៍ទៅក្នុង Konpuk - ផ្សារលក់ឡើងវិញលើអ៊ីនធឺណេតស្វាគមន៍របស់កម្ពុជា។ ស្វាគមន៍ផ្សារលើអ៊ីនធឺណេតដែលសម្រាប់មនុស្សកម្ពុជា។
                <br />
                <span className="text-sm text-white/80 mt-2 block">
                  Welcome to Cambodia's leading online marketplace with trusted sellers and easy buying.
                </span>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-3xl bg-white px-8 py-4 text-sm font-bold text-primary shadow-xl shadow-primary/30 hover:bg-white/95 transition"
                >
                  <span className="mr-2">🔍</span>
                  ស្វាគមន៍ផលិតផល / Browse Products
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-3xl border-2 border-white/50 bg-white/10 px-8 py-4 text-sm font-bold text-white hover:bg-white/20 transition backdrop-blur-sm"
                >
                  <span className="mr-2">📝</span>
                  ចាប់ផ្តើមលក់ / Start Selling
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/20">
                  <p className="text-2xl font-bold">1.2K+</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/70 mt-1">ម្ហូប / Listings</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/20">
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/70 mt-1">ផ្ទៀង / Verified</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/20">
                  <p className="text-2xl font-bold">24h</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/70 mt-1">ឆ្លើយតប / Response</p>
                </div>
              </div>
            </div>

            {/* Hero visual - Cambodia/Angkor inspired */}
            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300/30 via-yellow-200/20 to-orange-300/30 rounded-[3rem] backdrop-blur-sm border border-white/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏛️</div>
                    <p className="text-white font-semibold text-lg">កម្ពុជា</p>
                    <p className="text-white/80 text-sm">Cambodia Marketplace</p>
                    <div className="mt-6 text-3xl">💼 🏘️ 🚗 📱 👕</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-2xl border border-surface-muted">
          <SearchBar />
        </div>
      </section>

      <TopAdBanner />

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-bold">🏷️ ស្វាគមន៍ក្រុម</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">ស្វាគមន៍តាមក្រុម / Browse by Category</h2>
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
              <p className="text-sm uppercase tracking-widest text-muted font-bold">⭐ ផលិតផលលក់ដាច់ស្បើយ</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">Featured in Your Area / ផលិតផលលក់ដាច់ស្បើយនៅតំបន់របស់អ្នក</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover transition group"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
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
              <p className="text-sm uppercase tracking-widest text-muted font-bold">🆕 ឯកសារថ្មីៗ</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-text-primary">Latest Additions / ផលិតផលថ្មីៗបំផុត</h2>
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
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 text-center">
            ហេតុអ្វីជ្រើសរើស Konpuk? / Why Choose Konpuk?
          </h2>
          <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
            ផ្សារលើអ៊ីនធឺណេតដែលសម្រាប់មនុស្សកម្ពុជា - ទាក់ទងដោយផ្ទាល់ ធានា និងលឿន។
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">លឿន និងងាយ</h3>
              <p className="text-text-secondary text-sm">ដាក់ម្ហូបរបស់អ្នកក្នុងរយៈពេលប្រាំនាទី។ ស្វាគមន៍ម្ហូបរាប់ពាន់ភ្លាមៗ។</p>
              <p className="text-text-secondary text-xs mt-2">Fast & easy - Post in minutes, browse instantly.</p>
            </div>

            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4 text-2xl">
                🛡️
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">안전និងបង្ហាញគ្រឹម្ភន្ធ</h3>
              <p className="text-text-secondary text-sm">អ្នកលក់ផ្ទៀងផ្ទាត់ និងសារលាក់កម្រិត ដើម្បីរក្សាលោកអ្នក។</p>
              <p className="text-text-secondary text-xs mt-2">Safe & secure - Verified sellers, protected messaging.</p>
            </div>

            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4 text-2xl">
                📈
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">លទ្ធផលពិតប្រាកដ</h3>
              <p className="text-text-secondary text-sm">ត្រាប់ដងយ៉ាងដោះស្រាយលក្ខ័ណ្ឌ និងអ្នកលក់នៅតំបន់របស់អ្នក។</p>
              <p className="text-text-secondary text-xs mt-2">Real results - Connect with local buyers & sellers.</p>
            </div>

            <div className="rounded-3xl border border-muted p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4 text-2xl">
                💰
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">ឥតគិតថ្លៃរំដោះ</h3>
              <p className="text-text-secondary text-sm">គ្មានថ្លៃលាក់កម្រិត។ ដាក់ ស្វាគមន៍ និងសារទាំងងាយដោយឥតគិតថ្លៃ។</p>
              <p className="text-text-secondary text-xs mt-2">Free to use - No hidden fees, completely free.</p>
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


