import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../services/auth.api';
import { getUserProfile, updateUserProfile } from '../services/user.api';
import { getProducts } from '../services/product.api';
import ProductCard from '../components/marketplace/ProductCard';
import {
  MapPin,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  Star,
  CalendarDays,
  Link2,
  Globe,
  Edit3,
  Camera,
  Image
} from 'lucide-react';
import { formatPriceKHR, formatPriceUSD } from '../utils/price';

const defaultCover = 'https://images.unsplash.com/photo-1528222354215-6da0c9bd62f9?auto=format&fit=crop&w=1600&q=80';
const defaultAvatar = 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&q=80';

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    phoneNumber: '',
    telegram: '',
    facebook: '',
    avatar: '',
    coverImage: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const isOwner = useMemo(() => {
    if (!profile) return false;
    if (profileId) {
      return currentUser?.id === profileId || currentUser?._id === profileId;
    }
    return Boolean(currentUser);
  }, [currentUser, profileId, profile]);

  const username = useMemo(() => {
    if (!profile?.displayName) return '@seller';
    return `@${profile.displayName.toLowerCase().replace(/\s+/g, '')}`;
  }, [profile]);

  const coverImage = coverPreview || profile?.coverImage || defaultCover;
  const avatarImage = avatarPreview || profile?.avatar || profile?.profileImageUrl || defaultAvatar;
  const stats = profile?.stats || {
    totalProducts: products.length,
    totalViews: products.reduce((sum, product) => sum + (product.viewsCount || 0), 0),
    favoritesCount: 0
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setStatusMessage('');
      try {
        let storedUser = null;
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          storedUser = JSON.parse(savedUser);
          setCurrentUser(storedUser);
        }

        if (!storedUser) {
          try {
            const me = await getProfile();
            storedUser = me;
            setCurrentUser(me);
            localStorage.setItem('user', JSON.stringify(me));
          } catch (err) {
            // ignore if the user is viewing a public profile without authentication
          }
        }

        const profileData = profileId ? await getUserProfile(profileId) : await getProfile();
        let finalProfile = profileData;

        if (!profileId) {
          const profileWithStats = await getUserProfile(profileData.id || profileData._id);
          finalProfile = profileWithStats;
        }

        setProfile(finalProfile);
        setAvatarPreview(finalProfile.avatar || finalProfile.profileImageUrl || '');
        setCoverPreview(finalProfile.coverImage || '');
        setProfileForm({
          displayName: finalProfile.displayName || '',
          bio: finalProfile.bio || '',
          location: finalProfile.location || '',
          phoneNumber: finalProfile.phoneNumber || '',
          telegram: finalProfile.telegram || '',
          facebook: finalProfile.facebook || '',
          avatar: '',
          coverImage: ''
        });

        if (finalProfile?.id || finalProfile?._id) {
          const response = await getProducts({ seller: finalProfile.id || finalProfile._id, page: '1', perPage: '12' });
          setProducts(response.items || []);
        }
      } catch (error) {
        console.error(error);
        setStatusMessage('Unable to load profile.');
        setProfile(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (field === 'avatar') {
        setAvatarPreview(dataUrl);
      } else {
        setCoverPreview(dataUrl);
      }
      setProfileForm((current) => ({ ...current, [field]: dataUrl }));
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = () => {
    if (!profile) return;
    setIsEditing(true);
    setSuccessMessage('');
    setStatusMessage('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setStatusMessage('');
    setSuccessMessage('');
    setAvatarPreview(profile?.avatar || profile?.profileImageUrl || '');
    setCoverPreview(profile?.coverImage || '');
  };

  const saveProfile = async () => {
    setLoading(true);
    setStatusMessage('Saving profile...');
    setSuccessMessage('');

    try {
      const payload: Record<string, any> = {
        displayName: profileForm.displayName,
        bio: profileForm.bio,
        location: profileForm.location,
        phoneNumber: profileForm.phoneNumber,
        telegram: profileForm.telegram,
        facebook: profileForm.facebook
      };

      if (profileForm.avatar) payload.avatar = profileForm.avatar;
      if (profileForm.coverImage) payload.coverImage = profileForm.coverImage;

      const updatedProfile = await updateUserProfile(payload);
      setProfile((current: any) => ({ ...current, ...updatedProfile, stats: current?.stats }));
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully.');
      setStatusMessage('');

      if (isOwner) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedProfile }));
        setCurrentUser((current: any) => ({ ...current, ...updatedProfile }));
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-900">
        <img src={coverImage} alt="Seller cover" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <div className="relative -mt-12 h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-2xl">
                  <img src={avatarImage} alt="Seller avatar" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{profile?.displayName || 'Seller Name'}</h1>
                    {profile?.verified && <Shield className="h-6 w-6 text-emerald-300" />}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span>{username}</span>
                    {profile?.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {profile.location}
                      </span>
                    )}
                    {profile?.createdAt && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isOwner && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
                  >
                    <Edit3 className="h-4 w-4" /> Edit profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeTab === 'products' ? 'bg-sky-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeTab === 'about' ? 'bg-sky-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeTab === 'reviews' ? 'bg-sky-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] -mt-10">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">Seller profile</p>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{profile?.displayName || 'Seller'}</h2>
                </div>
                <div className="rounded-3xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                  {profile?.role === 'seller' ? 'Seller' : 'User'}
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-slate-600">
                {profile?.bio && <p>{profile.bio}</p>}
                {profile?.telegram && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-slate-400" />
                    <span>{profile.telegram}</span>
                  </div>
                )}
                {profile?.facebook && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span>{profile.facebook}</span>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Seller stats</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total listings</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.totalProducts}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total views</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.totalViews}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Saved favorites</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{stats.favoritesCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Verification</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Status</p>
                  <p className="mt-2">
                    {profile?.verified
                      ? 'Verified seller'
                      : profile?.verificationStatus === 'pending'
                      ? 'Verification pending'
                      : profile?.verificationStatus === 'rejected'
                      ? 'Verification rejected'
                      : 'Not verified'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Secure transactions</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Fast response</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {successMessage && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{successMessage}</div>
            )}
            {statusMessage && !successMessage && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{statusMessage}</div>
            )}

            {isEditing ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">Display name</label>
                    <input
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      value={profileForm.displayName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, displayName: event.target.value }))}
                      placeholder="Display name"
                    />
                    <label className="block text-sm font-semibold text-slate-700">About</label>
                    <textarea
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      rows={5}
                      value={profileForm.bio}
                      onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                      placeholder="Tell buyers about your store"
                    />
                    <label className="block text-sm font-semibold text-slate-700">Location</label>
                    <input
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      value={profileForm.location}
                      onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                      placeholder="City, Province"
                    />
                    <label className="block text-sm font-semibold text-slate-700">Phone number</label>
                    <input
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      value={profileForm.phoneNumber}
                      onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                      placeholder="+855 12 345 678"
                    />
                    <label className="block text-sm font-semibold text-slate-700">Telegram</label>
                    <input
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      value={profileForm.telegram}
                      onChange={(event) => setProfileForm((current) => ({ ...current, telegram: event.target.value }))}
                      placeholder="@yourusername"
                    />
                    <label className="block text-sm font-semibold text-slate-700">Facebook</label>
                    <input
                      className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      value={profileForm.facebook}
                      onChange={(event) => setProfileForm((current) => ({ ...current, facebook: event.target.value }))}
                      placeholder="facebook.com/yourpage"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <Camera className="h-5 w-5 text-slate-500" />
                        <span className="font-semibold text-slate-700">Avatar</span>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-3xl bg-white">
                          <img src={avatarPreview || defaultAvatar} alt="Avatar preview" className="h-full w-full object-cover" />
                        </div>
                        <label className="cursor-pointer rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 transition">
                          Choose avatar
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, 'avatar')} />
                        </label>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <Image className="h-5 w-5 text-slate-500" />
                        <span className="font-semibold text-slate-700">Cover image</span>
                      </div>
                      <div className="mt-4">
                        <div className="h-32 overflow-hidden rounded-3xl bg-white">
                          <img src={coverPreview || defaultCover} alt="Cover preview" className="h-full w-full object-cover" />
                        </div>
                        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 transition">
                          Choose cover
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, 'coverImage')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={loading}
                    className="rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Save profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">About seller</p>
                      <h2 className="mt-3 text-2xl font-bold text-slate-900">{profile?.displayName || 'Seller profile'}</h2>
                    </div>
                    {profile?.verified && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                        <Shield className="h-4 w-4" /> Verified
                      </div>
                    )}
                  </div>
                  <p className="mt-6 text-slate-600">{profile?.bio || 'This seller has not added a profile description yet.'}</p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Location</p>
                      <p className="mt-3 text-sm text-slate-700">{profile?.location || 'Not provided'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contact</p>
                      <p className="mt-3 text-sm text-slate-700">{profile?.phoneNumber || 'Phone not provided'}</p>
                      <p className="text-sm text-slate-700">{profile?.telegram || 'Telegram not provided'}</p>
                      <p className="text-sm text-slate-700">{profile?.facebook || 'Facebook not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Top listings</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">Featured products</h3>
                      </div>
                      <div className="rounded-3xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">{products.length} items</div>
                    </div>
                    <div className="mt-6 grid gap-4">
                      {products.slice(0, 3).map((product) => (
                        <div key={product._id || product.id} className="rounded-3xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900 truncate">{product.title}</p>
                          <p className="mt-2 text-sm text-slate-600">{formatPriceUSD(product.price)} {formatPriceKHR(product.price)}</p>
                        </div>
                      ))}
                      {!products.length && <p className="text-sm text-slate-500">No listings available yet.</p>}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Seller reputation</p>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Positive feedback</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">98%</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Response speed</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">24h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && !isEditing && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-900">Products by {profile?.displayName || 'this seller'}</h2>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => window.location.assign('/post-product')}
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition"
                    >
                      Post new product
                    </button>
                  )}
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {loading ? (
                    <div className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading products…</div>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        id={product._id || product.id}
                        title={product.title}
                        price={product.price}
                        location={product.location}
                        category={product.category?.labelKh || product.category?.name}
                        imageUrl={product.images?.[0]?.secureUrl || product.images?.[0]?.url}
                      />
                    ))
                  ) : (
                    <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                      {profileId ? 'This seller has no active listings yet.' : 'You have no active listings yet.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'about' && !isEditing && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">About this Seller</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Biography</p>
                      <p className="mt-3 text-slate-700">{profile?.bio || 'No biography has been added yet.'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Contact</p>
                      <div className="mt-3 space-y-2 text-slate-700">
                        <p>Email: {profile?.email || 'Not available'}</p>
                        <p>Phone: {profile?.phoneNumber || 'Not available'}</p>
                        <p>Telegram: {profile?.telegram || 'Not available'}</p>
                        <p>Facebook: {profile?.facebook || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Customer support</p>
                    <p className="mt-4 text-slate-600">For faster support, contact this seller through Telegram or Facebook and reference your product inquiry.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && !isEditing && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Reviews</h2>
                <p className="mt-4 text-slate-600">Reviews have not been enabled for this seller yet. Check back later as customer feedback grows.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
