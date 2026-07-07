import { useEffect, useState, FormEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadCloud, User, Globe, Menu, X, Bell } from 'lucide-react';
import api from '../../services/api';
import { getFavoritesCount } from '../../services/favorites.api';
import { getNotifications, getNotificationsCount } from '../../services/notification.api';
import { useAuth } from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';

interface CategoryItem {
  _id: string;
  name: string;
  labelKh?: string;
}

let categoriesLoadPromise: Promise<CategoryItem[]> | null = null;

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [category, setCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoriesMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const { user, logout, isHydrated = true } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const lastCountLoadUserRef = useRef<string | null>(null);

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

  const fetchRecentNotifications = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const data = await getNotifications();
      // Ensure recentNotifications is always an array
      const notificationItems = Array.isArray(data)
        ? data
        : data?.items || [];
      setRecentNotifications(notificationItems);
    } catch (error) {
      setRecentNotifications([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoriesMenuRef.current &&
        !categoriesMenuRef.current.contains(e.target as Node) &&
        !categoriesButtonRef.current?.contains(e.target as Node)
      ) {
        setCategoriesOpen(false);
      }
      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(e.target as Node) &&
        !notificationsButtonRef.current?.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest('[role="button"]')?.contains(e.target as Node)
      ) {
        // Allow mobile menu to close via mobile menu button
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCategoryClick = () => {
    setCategoriesOpen(false);
    categoriesButtonRef.current?.focus();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!categoriesLoadPromise) {
          categoriesLoadPromise = api.get('/categories').then((response) => response.data.data || []);
        }
        const loadedCategories = await categoriesLoadPromise;
        setCategories(loadedCategories);
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
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

    const userKey = user?._id || user?.id || user?.email || null;
    if (userKey && lastCountLoadUserRef.current !== userKey) {
      lastCountLoadUserRef.current = userKey;
      fetchFavoriteCount();
      fetchNotificationsCount();
    } else {
      setFavoriteCount(0);
      setNotificationCount(0);
    }

    return undefined;
  }, [user]);

  useEffect(() => {
    if (!user) {
      lastCountLoadUserRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      fetchNotificationsCount();
      if (notificationsOpen) {
        fetchRecentNotifications();
      }
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!user || !socket) return;

    const handleNewNotification = async (notification: any) => {
      if (typeof notification?.unreadCount === 'number') {
        setNotificationCount(notification.unreadCount);
      } else {
        setNotificationCount((current) => current + 1);
      }
      if (notificationsOpen) {
        await fetchRecentNotifications();
      }
    };

    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, user, notificationsOpen]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    navigate(`/products?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-surface-muted bg-white/95 backdrop-blur shadow-sm">
        <div className="bg-primary text-white hidden sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1 text-xs sm:px-6 sm:text-sm lg:px-8">
            <p className="font-medium">Fast, trusted local shopping across Cambodia.</p>
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <Link to="/help" className="hover:text-white">Help</Link>
              <span className="hidden sm:inline">·</span>
              <Link to="/about" className="hover:text-white">About</Link>
              <span className="hidden sm:inline">·</span>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.8rem] text-white">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Globe className="h-4 w-4" />
                  English
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold">Current</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/80">Khmer Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex flex-shrink-0 items-center gap-2">
                <img src="/logo.png" alt="Konpuk" className="h-10 w-auto md:h-12" />
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <div className="relative">
                <button
                  ref={categoriesButtonRef}
                  type="button"
                  onClick={() => setCategoriesOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-haspopup="menu"
                  aria-expanded={categoriesOpen}
                  aria-controls="categories-menu"
                >
                  ក្រុមផលិតផល
                </button>
                {categoriesOpen && (
                  <div
                    id="categories-menu"
                    ref={categoriesMenuRef}
                    className="absolute left-1/2 z-50 mt-2 w-60 -translate-x-1/2 rounded-2xl border border-muted bg-white p-3 shadow-lg"
                    role="menu"
                    aria-label="Categories"
                    onKeyDown={(e) => {
                      const links = categoriesMenuRef.current?.querySelectorAll('a');
                      if (!links || links.length === 0) return;
                      const focusable = Array.from(links) as HTMLElement[];
                      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = focusable[(currentIndex + 1) % focusable.length];
                        next.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = focusable[(currentIndex - 1 + focusable.length) % focusable.length];
                        prev.focus();
                      } else if (e.key === 'Home') {
                        e.preventDefault();
                        (focusable[0] as HTMLElement).focus();
                      } else if (e.key === 'End') {
                        e.preventDefault();
                        (focusable[focusable.length - 1] as HTMLElement).focus();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setCategoriesOpen(false);
                        categoriesButtonRef.current?.focus();
                      }
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Link onClick={handleCategoryClick} to="/products?category=food" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">🍜</span>
                        <span>ម្ហូប</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=phones" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">📱</span>
                        <span>ទូរស័ព្ទ</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=electronics" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">🔌</span>
                        <span>អេឡិចត្រូនិក</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=auto" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">🚗</span>
                        <span>យានយន្ត</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=real-estate" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">🏠</span>
                        <span>អចលនទ្រព្យ</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=clothing" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">👕</span>
                        <span>សម្លៀកបំពាក់</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=furniture" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">🛋️</span>
                        <span>គ្រឿងសង្ហារឹម</span>
                      </Link>
                      <Link onClick={handleCategoryClick} to="/products?category=services" role="menuitem" tabIndex={0} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="text-lg">🛠️</span>
                        <span>សេវាកម្ម</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/post-product"
                className="inline-flex items-center gap-2 rounded-3xl bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0f6f63]"
              >
                <UploadCloud className="h-4 w-4" />
                លក់ទំនិញ
              </Link>

              {!isHydrated ? (
                <div data-testid="header-auth-placeholder" className="hidden h-10 w-32 items-center justify-center lg:flex" aria-hidden="true" />
              ) : user ? (
                <div className="hidden group lg:relative lg:inline-flex">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-white/90"
                    title={user.displayName ? `User menu (${user.displayName})` : 'User menu'}
                  >
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    {user.displayName && (
                      <>
                        <span className="hidden max-w-[10rem] truncate md:inline">{user.displayName}</span>
                        <span className="inline font-medium md:hidden">
                          {(() => {
                            const parts = user.displayName.trim().split(/\s+/);
                            if (parts.length === 1) return parts[0].slice(0, 10);
                            const last = parts[parts.length - 1];
                            const initials = (parts[0][0] || '') + (parts.length > 1 ? (parts[parts.length - 1][0] || '') : '');
                            return last.length <= 8 ? last : initials.toUpperCase();
                          })()}
                        </span>
                      </>
                    )}
                  </button>
                  <div className="invisible absolute right-0 mt-2 w-48 rounded-3xl border border-muted bg-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 z-50">
                    <Link to="/profile" className="block rounded-t-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">ពត៌មានគណនី</Link>
                    <button type="button" onClick={async () => { try { await logout(); } catch { localStorage.removeItem('authToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user'); } navigate('/'); }} className="w-full rounded-b-3xl border-t border-muted px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-background">ចេញពីប្រព័ន្ធ</button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="hidden items-center gap-2 rounded-3xl border border-muted bg-white px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-white/90 lg:inline-flex">ចូលគណនី</Link>
                  <Link to="/register" className="hidden items-center gap-2 rounded-3xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover lg:inline-flex">បង្កើតគណនី</Link>
                </>
              )}

              {user && (
                <div className="relative">
                  <button
                    ref={notificationsButtonRef}
                    type="button"
                    onClick={async () => {
                      setNotificationsOpen((current) => {
                        const nextOpen = !current;
                        if (nextOpen) {
                          fetchRecentNotifications();
                        }
                        return nextOpen;
                      });
                    }}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-muted bg-white text-text-secondary transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-haspopup="menu"
                    aria-expanded={notificationsOpen}
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[0.625rem] font-semibold text-white">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div
                      ref={notificationsMenuRef}
                      className="absolute right-0 z-50 mt-2 min-w-[22.5rem] max-w-[24rem] w-[24rem] rounded-[1.75rem] border border-muted bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
                      role="menu"
                      aria-label="Notifications"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4 border-b border-muted/40 pb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary">Notifications</p>
                          <p className="mt-1 text-xs text-text-secondary">Recent updates for your account</p>
                        </div>
                        <Link to="/notifications" onClick={() => setNotificationsOpen(false)} className="text-sm font-semibold text-primary hover:text-primary-hover">View all</Link>
                      </div>
                      <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                        {recentNotifications.length ? (
                          recentNotifications.slice(0, 5).map((notification) => (
                            <Link
                              key={notification._id}
                              to={notification.link || '/notifications'}
                              onClick={() => setNotificationsOpen(false)}
                              className={`group block rounded-3xl border p-4 text-sm transition ${notification.read ? 'border-muted bg-white hover:bg-background' : 'border-primary/20 bg-primary/5 hover:border-primary/30 hover:bg-primary/10'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-sm font-semibold text-text-primary">{notification.title || 'Notification'}</p>
                                  {notification.message && (
                                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">{notification.message}</p>
                                  )}
                                </div>
                                {!notification.read && (
                                  <span className="inline-flex h-6 items-center justify-center rounded-full bg-primary px-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white">
                                    New
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="rounded-3xl border border-muted bg-background p-5 text-sm text-text-secondary">
                            No new notifications yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!mobileMenuOpen && (
                <button type="button" onClick={() => setMobileMenuOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-muted bg-white text-text-primary shadow-sm lg:hidden" aria-label="Toggle mobile menu">
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bottom-0 left-0 right-0 top-0 z-[80] lg:hidden">
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/40" aria-label="Close mobile menu" />
          <div ref={mobileMenuRef} className="relative z-[90] h-full w-4/5 max-w-xs overflow-y-auto rounded-tr-3xl rounded-br-3xl border-r border-surface-muted bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-text-primary">Navigation</p>
                <p className="text-sm text-muted">Mobile menu</p>
              </div>
            </div>

            <nav className="space-y-2">
              {!isHydrated ? (
                <div className="h-2" aria-hidden="true" />
              ) : user ? (
                <div className="rounded-3xl border border-muted bg-background p-3">
                  <div className="flex items-center gap-3 rounded-3xl border border-muted bg-white px-3 py-3">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{user.displayName || 'Account'}</p>
                      <p className="text-xs text-muted">Signed in</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Dashboard</Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Profile</Link>
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
                      className="w-full rounded-3xl border border-muted px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-background"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 rounded-3xl border border-muted bg-background p-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl border border-muted bg-white px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Login</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">Register</Link>
                </div>
              )}
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Browse Products</Link>
              <Link to="/post-product" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0e6e60]">Post Product</Link>
              <hr className="border-surface-muted" />
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">About</Link>
              <Link to="/guide" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Guide</Link>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="block rounded-3xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-background">Help</Link>
              <details className="mt-4 rounded-3xl border border-muted bg-white p-2">
                <summary className="px-3 py-2 text-sm font-semibold">Product categories</summary>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=food" className="px-3 py-2 text-sm rounded hover:bg-background">ម្ហូប</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=phones" className="px-3 py-2 text-sm rounded hover:bg-background">ទូរស័ព្ទ</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=electronics" className="px-3 py-2 text-sm rounded hover:bg-background">អេឡិចត្រូនិក</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=auto" className="px-3 py-2 text-sm rounded hover:bg-background">យានយន្ត</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=real-estate" className="px-3 py-2 text-sm rounded hover:bg-background">អចលនទ្រព្យ</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=clothing" className="px-3 py-2 text-sm rounded hover:bg-background">សម្លៀកបំពាក់</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=furniture" className="px-3 py-2 text-sm rounded hover:bg-background">គ្រឿងសង្ហារឹម</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=services" className="px-3 py-2 text-sm rounded hover:bg-background">សេវាកម្ម</Link>
                </div>
              </details>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

