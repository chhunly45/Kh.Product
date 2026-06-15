import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadCloud, LogIn, User, Globe, Search, MapPin, Menu, X, Heart, Bell, MessageSquare, LogOut } from 'lucide-react';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Konpuk" className="h-20 w-auto" />
          </Link>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 items-center gap-3 mx-8">
            <div className="flex-1 flex items-center gap-3 rounded-3xl bg-white border border-muted px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-muted flex-shrink-0" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
                className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              className="rounded-3xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-primary/30 transition flex-shrink-0"
            >
              Search
            </button>
          </form>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/post-product"
              className="inline-flex items-center gap-2 rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition"
            >
              <UploadCloud className="w-4 h-4" />
              Sell
            </Link>

            {user ? (
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
                  title="User menu"
                >
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span>{user?.displayName?.split(' ')[0] || 'Account'}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-3xl shadow-xl border border-muted opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background rounded-t-3xl"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background border-t border-muted"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/notifications"
                    className="block px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background border-t border-muted"
                  >
                    Notifications {notificationCount > 0 && `(${notificationCount})`}
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background border-t border-muted"
                  >
                    Favorites ({favoriteCount})
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background border-t border-muted"
                    >
                      Admin Dashboard
                    </Link>
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
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-background border-t border-muted rounded-b-3xl"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-white/90 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition"
                >
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

        <form onSubmit={handleSearch} className="lg:hidden mt-4">
          <div className="flex items-center gap-2 rounded-3xl border border-muted bg-white px-3 py-3 shadow-sm">
            <Search className="w-4 h-4 text-muted" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition"
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
                  My Profile
                </button>
                <Link
                  to="/messages"
                  className="block rounded-3xl border border-muted bg-white px-4 py-3 text-center text-sm font-semibold text-text-secondary hover:bg-background transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
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
                  className="w-full rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-background transition"
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

