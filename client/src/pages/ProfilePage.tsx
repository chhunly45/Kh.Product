import { useEffect, useState } from 'react';
import { getProfile, requestVerification } from '../services/auth.api';
import { getProducts } from '../services/product.api';
import ProductCard from '../components/marketplace/ProductCard';
import { MapPin, Mail, Phone, Shield, TrendingUp, Star, MessageSquare, CalendarDays } from 'lucide-react';

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'overview'>('manage');
  const [loading, setLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setProfile(JSON.parse(storedUser));
        }

        const data = await getProfile();
        setProfile(data);

        if (data?.id) {
          const response = await getProducts({ seller: data.id, page: '1', perPage: '8' });
          setProducts(response.items || []);
        }
      } catch (error) {
        setProfile(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const requestVerificationHandler = async () => {
    if (!profile?.id) return;
    setIsRequestingVerification(true);
    setStatusMessage('Submitting verification request...');
    try {
      const user = await requestVerification(verificationMessage.trim());
      setProfile(user);
      localStorage.setItem('user', JSON.stringify(user));
      setStatusMessage('Your verification request is now pending review.');
      setVerificationMessage('');
    } catch (error) {
      setStatusMessage('Unable to submit verification request. Please try again later.');
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const username = profile?.displayName ? `@${profile.displayName.toLowerCase().replace(/\s+/g, '')}` : '@seller';
  const coverImage = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1650&q=80';
  const avatarImage = profile?.profileImageUrl || 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&q=80';

  return (
    <div className="space-y-8 pb-12 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Cover Section */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-900">
        <img 
          src={coverImage} 
          alt="Seller cover" 
          className="h-full w-full object-cover opacity-70" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        {/* Seller Info - Overlaid on Cover */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              {/* Avatar */}
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-2xl">
                  <img 
                    src={avatarImage} 
                    alt="Seller avatar" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Seller Details */}
              <div className="text-white flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-bold">{profile?.displayName || 'Seller Name'}</h1>
                  {profile?.verified && <Shield className="w-6 h-6 text-green-400" />}
                </div>
                <p className="text-sky-200 mt-1">{username}</p>
                {profile?.location && (
                  <div className="flex items-center gap-1 mt-2 text-sky-100">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.createdAt && (
                  <div className="flex items-center gap-1 mt-2 text-sky-100">
                    <CalendarDays className="w-4 h-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setActiveTab('manage')}
                  className={`flex-1 sm:flex-none rounded-lg px-6 py-3 font-bold transition ${activeTab === 'manage' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  My Listings
                </button>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 sm:flex-none rounded-lg px-6 py-3 font-bold transition ${activeTab === 'overview' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 -mt-12 relative z-10">
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200 text-center">
            <div className="text-2xl font-bold text-sky-600">{products.length}</div>
            <p className="text-sm text-slate-600 mt-1">Active Listings</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200 text-center">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <p className="text-sm text-slate-600 mt-1">Rating (★)</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200 text-center">
            <div className="text-2xl font-bold text-purple-600">98%</div>
            <p className="text-sm text-slate-600 mt-1">Positive</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200 text-center">
            <div className="text-2xl font-bold text-amber-600">24h</div>
            <p className="text-sm text-slate-600 mt-1">Response</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Seller Info Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
              <p className="text-sm font-bold uppercase tracking-widest text-sky-600">Seller Info</p>
              <h2 className="mt-3 text-xl font-bold text-slate-900">{profile?.displayName || 'Seller'}</h2>
              
              <div className="mt-4 space-y-3">
                {profile?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 truncate">{profile.email}</span>
                  </div>
                )}
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{profile.phoneNumber}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{profile.location}</span>
                  </div>
                )}
              </div>

              <button className="w-full mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 transition flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Seller
              </button>
            </div>

            {/* Trust & Safety */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
              <p className="text-sm font-bold uppercase tracking-widest text-green-600">Trust & Safety</p>
              
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Verification status</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {profile?.verified ? 'Verified seller' : profile?.verificationStatus === 'pending' ? 'Verification pending review' : profile?.verificationStatus === 'rejected' ? 'Verification request rejected' : 'Not verified yet'}
                  </p>
                </div>
                {profile?.role === 'seller' && !profile?.verified && (
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Seller verification</p>
                    <p className="mt-2 text-sm text-slate-600">Submit documents and details to get the verified badge.</p>
                    <textarea
                      value={verificationMessage}
                      onChange={(event) => setVerificationMessage(event.target.value)}
                      rows={3}
                      placeholder="Tell us why your account should be verified"
                      className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      type="button"
                      onClick={requestVerificationHandler}
                      disabled={isRequestingVerification || profile?.verificationStatus === 'pending'}
                      className="mt-4 w-full rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 transition"
                    >
                      {profile?.verificationStatus === 'pending' ? 'Verification pending' : 'Request verification'}
                    </button>
                    {statusMessage && (
                      <p className="mt-3 text-sm text-slate-600">{statusMessage}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-700">Verified Seller</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-700">Active Since 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-slate-700">Top Rated</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="space-y-6">
            {activeTab === 'manage' ? (
              <>
                <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Your Listings</h2>
                      <p className="mt-2 text-slate-600">Manage and view all your active product listings</p>
                    </div>
                    <button className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold text-white hover:bg-sky-600 transition whitespace-nowrap">
                      Post New Ad
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600">
                    Loading your products…
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        id={product._id || product.id}
                        title={product.title}
                        price={typeof product.price === 'number' ? `₨${product.price.toLocaleString()}` : product.price}
                        location={product.location || 'Unknown'}
                        category={product.category?.labelKh || product.category?.name || 'General'}
                        imageUrl={product.images?.[0]?.secureUrl || product.images?.[0]?.url || product.imageUrl || ''}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <div className="text-slate-600">
                      <p className="text-lg font-semibold">No active listings yet</p>
                      <p className="mt-1 text-sm">Start selling by posting your first product</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900">Profile Overview</h2>
                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest">About this seller</p>
                      <p className="mt-3 text-slate-700">
                        Welcome to this seller's profile. You can view their active listings, ratings, and contact them directly to inquire about products.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div className="rounded-xl bg-sky-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Member Since</p>
                        <p className="mt-2 text-2xl font-bold text-sky-600">2024</p>
                      </div>
                      <div className="rounded-xl bg-green-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Response Rate</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">95%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-8 border border-sky-200">
                    <TrendingUp className="w-8 h-8 text-sky-600 mb-3" />
                    <h3 className="font-bold text-slate-900">Growing Seller</h3>
                    <p className="mt-2 text-sm text-slate-600">This seller has been growing consistently with positive customer feedback.</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 border border-green-200">
                    <Shield className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-bold text-slate-900">Trusted</h3>
                    <p className="mt-2 text-sm text-slate-600">Verified seller with excellent ratings and trustworthy transaction history.</p>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
