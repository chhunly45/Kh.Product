import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, UploadCloud, LogIn, User, Globe, Search, MapPin, Menu, X, Heart, Bell, MessageSquare, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-surface-muted bg-white/95 backdrop-blur shadow-sm">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
          <p className="font-medium">Fast, trusted local shopping across Cambodia.</p>
          <div className="flex flex-wrap items-center gap-3 text-white/90">
            <Link to="/help" className="hover:text-white">Help</Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/about" className="hover:text-white">About</Link>
            <span className="hidden sm:inline">·</span>
            <button className="inline-flex items-center gap-1 hover:text-white" type="button">
              <Globe className="w-4 h-4" />
              EN
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-hover shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-text-secondary font-semibold">Cambodia's marketplace</p>
              <p className="text-2xl font-bold text-text-primary">Konpuk</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/post-product"
              className="inline-flex items-center gap-2 rounded-3xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition"
            >
              <UploadCloud className="w-4 h-4" />
              Sell
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
            <Link
              to="/notifications"
              className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
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
              className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
            >
              <Heart className="w-4 h-4" />
              Favorites ({favoriteCount})
            </Link>
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
                  title="View your profile"
                  aria-label="Open profile"
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
                    className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
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
                  className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
                >
                  <User className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-muted bg-white text-text-primary shadow-sm"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-3 rounded-3xl border border-surface-muted bg-surface p-3 shadow-sm mt-4">
          <div className="flex-1 flex items-center gap-3 rounded-3xl bg-white px-4 py-3 border border-muted shadow-sm">
            <Search className="w-5 h-5 text-muted" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, categories, locations..."
              className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
            />
          </div>
          <div className="relative min-w-[220px]">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-3xl border border-muted bg-white px-12 py-3 text-sm text-text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
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
            className="rounded-3xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-primary/30 transition"
          >
            Search
          </button>
        </form>

        <div className="lg:hidden mt-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center gap-2 rounded-3xl border border-muted bg-white px-3 py-3 shadow-sm">
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
                className="flex-1 rounded-3xl border border-muted bg-white px-4 py-3 text-sm text-text-secondary outline-none"
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
                className="rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
              >
                Search
              </button>
            </div>
          </form>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 rounded-3xl border border-surface-muted bg-white p-4 shadow-lg">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to="/post-product"
                  className="inline-flex items-center justify-center rounded-3xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sell
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Discover
                </Link>
              </div>
              {user ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background transition"
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
                      className="w-full rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background transition"
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
                    className="w-full rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-3xl border border-muted bg-white px-4 py-3 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-3xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white hover:bg-primary-hover transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              <Link
                to="/notifications"
                className="block rounded-3xl border border-muted bg-white px-4 py-3 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Notifications{notificationCount > 0 ? ` (${notificationCount})` : ''}
              </Link>
              <Link
                to="/favorites"
                className="block rounded-3xl border border-muted bg-white px-4 py-3 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites ({favoriteCount})
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

