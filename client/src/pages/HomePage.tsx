import { Link } from 'react-router-dom';
import SearchBar from '../components/marketplace/SearchBar';
import CategoriesGrid from '../components/marketplace/CategoriesGrid';
import FeaturedSection from '../components/marketplace/FeaturedSection';
import SEO from '../components/SEO';
import { Star, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

// Sample product data
const featuredProducts = [
  { id: '1', title: 'Mountain Bike for Sale', price: 'KHR 1,200,000', location: 'Phnom Penh', category: 'Sports' },
  { id: '2', title: 'Second-hand Motorcycle', price: 'KHR 3,500,000', location: 'Siem Reap', category: 'Vehicles' },
  { id: '3', title: 'Office Desk and Chair Set', price: 'KHR 800,000', location: 'Kampot', category: 'Furniture' },
  { id: '4', title: 'iPhone 13 Pro Max', price: 'KHR 5,200,000', location: 'Phnom Penh', category: 'Electronics' },
];

const latestProducts = [
  { id: '5', title: 'Gaming Laptop (RTX 3060)', price: 'KHR 2,800,000', location: 'Phnom Penh', category: 'Electronics' },
  { id: '6', title: 'Vintage Coffee Table', price: 'KHR 450,000', location: 'Siem Reap', category: 'Furniture' },
  { id: '7', title: 'Professional Camera Equipment', price: 'KHR 6,500,000', location: 'Battambang', category: 'Electronics' },
  { id: '8', title: 'Toyota Camry 2015', price: 'KHR 12,000,000', location: 'Phnom Penh', category: 'Vehicles' },
];

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="Cambodia's local marketplace"
        description="Find and sell local products across Cambodia with Marketplace Kh. Secure messaging, easy listings, and a trusted community."
        url="https://marketplace-kh.com/"
        image="https://via.placeholder.com/1200x630.png?text=Marketplace+Kh"
      />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Hero Content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-semibold text-sky-600 uppercase tracking-wider">Welcome to Khmer24</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Buy, Sell & Discover Local Products
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl">
              Cambodia's trusted marketplace for local products. Fast search, secure messaging, and easy listings for everyone.
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
            <Link
              to="/post-product"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-lg shadow-sky-500/30 text-center"
            >
              Post a Product
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-sky-500 text-sky-600 font-semibold hover:bg-sky-50 transition text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SearchBar />
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">10K+</div>
              <p className="text-sm sm:text-base text-sky-100">Active Listings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
              <p className="text-sm sm:text-base text-sky-100">Happy Users</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">100K+</div>
              <p className="text-sm sm:text-base text-sky-100">Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
              <p className="text-sm sm:text-base text-sky-100">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesGrid />

      {/* Featured Products Section */}
      <FeaturedSection
        title="Featured Listings"
        description="Hot picks from our sellers this week"
        products={featuredProducts}
        viewAllLink="/products?featured=true"
      />

      {/* Latest Products Section */}
      <FeaturedSection
        title="Latest Products"
        description="Recently added by our community"
        products={latestProducts}
        viewAllLink="/products?sort=latest"
      />

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">Why Choose Khmer24?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Fast & Easy</h3>
              <p className="text-slate-600">Post your products in minutes. Browse thousands of listings instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Safe & Secure</h3>
              <p className="text-slate-600">Verified sellers and secure messaging to keep you protected.</p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Real Results</h3>
              <p className="text-slate-600">Connect directly with buyers and sellers in your area.</p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition">
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
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-sky-100 max-w-2xl mx-auto">Join thousands of buyers and sellers on Cambodia's most trusted marketplace.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-sky-600 font-semibold hover:bg-sky-50 transition"
            >
              Sign Up Now
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition"
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
