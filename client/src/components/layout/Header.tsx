import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, UploadCloud, LogIn, User, Globe, Search, ChevronDown, MapPin, Menu, X, Heart, Bell, MessageSquare, LogOut } from 'lucide-react';
import api from '../../services/api';
import { getFavoritesCount } from '../../services/favorites.api';
import { getNotificationsCount } from '../../services/notification.api';
import { useAuth } from '../../hooks/useAuth';

interface CategoryItem {
  _id: string;
  name: string;
  labelKh?: string;
}

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [category, setCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        setCategories([]);
      }
    };

    const fetchFavoriteCount = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const count = await getFavoritesCount();
        setFavoriteCount(count);
      } catch (error) {
        setFavoriteCount(0);
      }
    };

    const fetchNotificationsCount = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const count = await getNotificationsCount();
        setNotificationCount(count);
      } catch (error) {
        setNotificationCount(0);
      }
    };

    const handleNotificationsUpdated = () => {
      fetchNotificationsCount();
    };

    fetchCategories();
    if (user) {
      fetchFavoriteCount();
      fetchNotificationsCount();
    } else {
      setFavoriteCount(0);
      setNotificationCount(0);
    }

    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
    };
  }, [user]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    navigate(`/products?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-muted bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-muted bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-text-secondary">Welcome to Konpuk - Cambodia's Trusted Marketplace</div>
            <div className="hidden sm:flex items-center gap-4">
              <button className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition">
                <Globe className="w-3 h-3" />
                EN
              </button>
              <span className="text-muted">|</span>
              <Link to="/help" className="text-text-secondary hover:text-text-primary transition">Help</Link>
              <Link to="/about" className="text-text-secondary hover:text-text-primary transition">About</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 lg:gap-0">
          {/* Logo & Menu Toggle */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.35em] text-text-secondary font-semibold">Cambodia's</p>
                <span className="text-xl font-bold text-text-primary">Konpuk</span>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-text-secondary">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar - Prominent on Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex gap-3 items-center">
            <div className="flex-1 flex items-center gap-3 rounded-lg border-2 border-muted bg-white px-4 py-3 shadow-sm hover:border-primary transition focus-within:border-primary focus-within:shadow-md">
              <Search className="w-5 h-5 text-muted" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products, categories, locations..."
                className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
              />
            </div>
            <div className="relative flex items-center gap-3 rounded-lg border-2 border-muted bg-white px-4 py-3 shadow-sm hover:border-primary transition">
              <MapPin className="w-5 h-5 text-muted" />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="bg-transparent text-sm text-text-secondary outline-none font-medium"
              >
                <option value="">All Categories</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.labelKh || item.name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="rounded-lg bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-primary/50 transition"
            >
              Search
            </button>
          </form>

          {/* Action Buttons */}
          <div className="hidden lg:flex flex-wrap items-center gap-3 justify-end">
            <Link
              to="/post-product"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-accent/30 transition"
            >
              <UploadCloud className="w-4 h-4" />
              Sell
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
            <Link
              to="/notifications"
              className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition"
            >
              <Bell className="w-4 h-4" />
              Notifications
              {notificationCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-2 text-[0.65rem] font-semibold text-white">
                  {notificationCount}
                </span>
              )}
            </Link>
            <Link
              to="/favorites"
              className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition"
            >
              <Heart className="w-4 h-4" />
              Favorites ({favoriteCount})
            </Link>
            {user ? (
              <>
                <button
                  onClick={() => {
                    console.log('Profile button clicked!');
                    console.log('Current user:', user);
                    navigate('/profile');
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition cursor-pointer"
                  title="View your profile"
                  aria-label="Open profile"
                  type="button"
                >
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span>{user?.displayName?.split(' ')[0] || user?.phoneNumber || 'Account'}</span>
                </button>
                {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition"
                    >
                    Admin Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('user');
                    }
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-muted bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition"
                >
                  <User className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="lg:hidden flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-lg border-2 border-muted bg-white px-3 py-2 shadow-sm">
            <Search className="w-4 h-4 text-muted" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="flex-1 rounded-lg border border-muted bg-white px-3 py-2 text-sm text-text-secondary outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.labelKh || item.name}
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-muted space-y-3">
            <Link
              to="/post-product"
              className="block rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-white hover:bg-accent/90 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UploadCloud className="w-4 h-4 inline mr-2" />
              Sell
            </Link>
            {user ? (
              <>
                <button
                  onClick={() => {
                    console.log('Mobile Profile button clicked!');
                    console.log('Current user:', user);
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="block rounded-lg border border-muted bg-white px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:bg-background transition cursor-pointer"
                  title="View your profile"
                  aria-label="Open profile"
                  type="button"
                >
                  {user?.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : user?.phoneNumber ? `Hi, ${user.phoneNumber}` : 'Profile'}
                </button>
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/admin');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full rounded-lg border border-muted bg-white px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('user');
                    }
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="block w-full rounded-lg border border-muted bg-white px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-lg border border-muted bg-white px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-primary-hover transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            <Link
              to="/notifications"
              className="block rounded-lg border border-muted bg-white px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notifications{notificationCount > 0 ? ` (${notificationCount})` : ''}
            </Link>
            <Link
              to="/favorites"
              className="block rounded-lg border border-muted bg-white px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Favorites ({favoriteCount})
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

