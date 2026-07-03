import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../services/auth.api';
import { getUserProfile, updateUserProfile } from '../services/user.api';
import { getProducts } from '../services/product.api';
import { getSellerReviews, createReview } from '../services/review.api';
import { useAuth } from '../hooks/useAuth';
import { getProvinces, getDistricts } from '../services/location.api';
import ProductCard from '../components/marketplace/ProductCard';
import { getProductCoverImageUrl } from '../utils/product';
import {
  MapPin,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  CalendarDays,
  Link2,
  Globe,
  Edit3,
  Camera,
  Image,
  Star,
  Eye,
  Package
} from 'lucide-react';
import { formatPriceKHR, formatPriceUSD } from '../utils/price';
import SellerHero from '../components/marketplace/SellerHero';
import SellerStats from '../components/marketplace/SellerStats';
import SellerSidebar from '../components/marketplace/SellerSidebar';

const defaultCover = 'https://images.unsplash.com/photo-1528222354215-6da0c9bd62f9?auto=format&fit=crop&w=1600&q=80';
const defaultAvatar = 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&q=80';

const profileUi = {
  pageTitle: 'ប្រវត្តិអ្នកលក់ / Seller Profile',
  editProfile: 'កែព័ត៌មាន / Edit Profile',
  products: 'ផលិតផល / Products',
  about: 'អំពីហាង / About',
  reviews: 'ការវាយតម្លៃ / Reviews',
  sellerProfile: 'ប្រវត្តិអ្នកលក់ / Seller Profile',
  displayName: 'ឈ្មោះបង្ហាញ / Display Name',
  aboutStore: 'អំពីហាង / About Store',
  location: 'ទីតាំង / Location',
  phoneNumber: 'លេខទូរស័ព្ទ / Phone Number',
  avatar: 'រូបប្រវត្តិ / Avatar',
  coverImage: 'រូបគម្រប / Cover Image',
  chooseAvatar: 'ជ្រើសរើសរូប / Choose Avatar',
  chooseCover: 'ជ្រើសរើសរូបគម្រប / Choose Cover',
  cancel: 'បោះបង់ / Cancel',
  saveProfile: 'រក្សាទុកព័ត៌មាន / Save Profile',
  productsBySeller: 'ផលិតផលរបស់ {name} / Products by {name}',
  postNewProduct: 'បោះពុម្ពផលិតផលថ្មី / Post New Product',
  noProducts: 'មិនមានផលិតផលដែលដាក់បង្ហាញនៅឡើយទេ។ / No active listings yet.',
  noProductsForSeller: 'អ្នកលក់នេះមិនទាន់មានផលិតផលដែលបានបង្ហាញនៅឡើយទេ។ / This seller has no active listings yet.',
  aboutSeller: 'អំពីអ្នកលក់នេះ / About This Seller',
  biography: 'ប្រវត្តិរូប / Biography',
  noBiography: 'មិនទាន់មានប្រវត្តិរូប។ / No biography has been added yet.',
  contactInformation: 'ព័ត៌មានទំនាក់ទំនង / Contact Information',
  averageRating: 'ការវាយតម្លៃជាមធ្យម / Average Rating',
  totalReviews: 'ចំនួនការវាយតម្លៃសរុប / Total Reviews',
  leaveReview: 'ផ្តល់ការវាយតម្លៃ / Leave a Review',
  rating: 'ការវាយតម្លៃ / Rating',
  commentOptional: 'មតិ (ជាជម្រើស) / Comment (optional)',
  postReview: 'បង្ហាញការវាយតម្លៃ / Post Review',
  allReviews: 'ការវាយតម្លៃទាំងអស់ / All Reviews',
  noReviews: 'មិនទាន់មានការវាយតម្លៃទេ។ / No reviews yet.',
  noContactDetails: 'មិនទាន់មានព័ត៌មានទំនាក់ទំនងដោយផ្ទាល់នៅឡើយទេ។ / No direct contact details available yet.',
  basicInformation: 'ព័ត៌មានមូលដ្ឋាន / Basic Information',
  contactInformationForm: 'ព័ត៌មានទំនាក់ទំនង / Contact Information',
  storeImages: 'រូបភាពហាង / Store Images',
  verificationStatus: 'ស្ថានភាពផ្ទៀងផ្ទាត់ / Verification Status',
  memberSince: 'ជាសមាជិកតាំងពី / Member Since',
  productCount: 'ចំនួនផលិតផល / Product Count',
  profileViews: 'ចំនួនអ្នកមើលប្រវត្តិ / Profile Views',
  verifiedLabel: 'បានផ្ទៀងផ្ទាត់ / Verified',
  unverifiedLabel: 'មិនទាន់ផ្ទៀងផ្ទាត់ / Unverified',
  pendingLabel: 'កំពុងរង់ចាំ / Pending',
  emailVerifiedLabel: 'អ៊ីមែលបានផ្ទៀងផ្ទាត់ / Email Verified',
  notVerifiedLabel: 'មិនទាន់ផ្ទៀងផ្ទាត់ / Not Verified',
  storeCompletion: 'ការបំពេញប្រវត្តិហាង / Store Completion',
  completionHint: 'បំពេញព័ត៌មានហាងរបស់អ្នកដើម្បីបង្កើនភាពជឿជាក់ / Complete your store details to build more trust',
  trustAndSafety: 'ភាពជឿជាក់ និងសុវត្ថិភាព / Trust & Safety',
  quickActions: 'សកម្មភាពរហ័ស / Quick Actions',
  storeMedia: 'មេឌៀហាង / Store Media',
  profilePhoto: 'រូបប្រវត្តិ / Profile Photo',
  coverPhoto: 'រូបគម្រប / Cover Photo',
  contactSeller: 'ទំនាក់ទំនងអ្នកលក់ / Contact Seller',
  storeInformation: 'ព័ត៌មានហាង / Store Information',
  trustedStore: 'ហាងដែលជឿជាក់ / Trusted Store',
  responseTime: 'ពេលវេលាការឆ្លើយតប / Response time',
  storeHighlights: 'ចំណុចសំខាន់ / Highlights',
  favorites: 'ចូលចិត្ត / Favorites',
  sellerRole: 'អ្នកលក់ / Seller',
  userRole: 'អ្នកប្រើប្រាស់ / User',
  verifiedSellerBadge: 'អ្នកលក់ដែលបានផ្ទៀងផ្ទាត់ ✓ / Verified Seller',
  unverifiedSellerBadge: 'មិនទាន់ផ្ទៀងផ្ទាត់ / Unverified Seller',
  trustPromptTitle: 'ចង់បង្កើនភាពជឿជាក់របស់អ្នកទិញ? / Want higher buyer trust?',
  trustPromptBody: 'ដាក់ស្នើការផ្ទៀងផ្ទាត់ដើម្បីទទួលបានបាក់ដៃអ្នកលក់ដែលបានផ្ទៀងផ្ទាត់។ / Submit your verification request to get a verified seller badge.',
  requestVerification: 'ស្នើសុំផ្ទៀងផ្ទាត់ / Request verification',
  coreSellerDetails: 'ព័ត៌មានพื้นฐานของร้าน / Core seller details',
  contactDetailsForBuyers: 'ព័ត៌មានទំនាក់ទំនងដើម្បីឱ្យអ្នកទិញទាក់ទង / Contact details for buyers',
  storeVisuals: 'រូបភាពដាក់បង្ហាញទាំងអស់ / Visuals that represent your store',
  telegramLabel: 'តេលេក្រាម / Telegram',
  facebookLabel: 'ហ្វេសប៊ុក / Facebook'
};

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>({ avgRating: 0, totalReviews: 0 });
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
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

  const memberSinceLabel = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const verificationStatusLabel = profile?.sellerVerificationStatus === 'verified'
    ? profileUi.verifiedLabel
    : profile?.sellerVerificationStatus === 'unverified'
    ? profileUi.unverifiedLabel
    : profile?.verificationStatus === 'pending'
    ? profileUi.pendingLabel
    : profile?.emailVerified
    ? profileUi.emailVerifiedLabel
    : profileUi.notVerifiedLabel;

  const completionChecks = useMemo(() => {
    const hasDisplayName = Boolean(profile?.displayName);
    const hasBio = Boolean(profile?.bio);
    const hasLocation = Boolean(profile?.location || profile?.province);
    const hasContact = Boolean(profile?.phoneNumber || profile?.email || profile?.telegram || profile?.facebook);
    const hasAvatar = Boolean(avatarPreview || profile?.avatar || profile?.profileImageUrl);
    const hasCover = Boolean(coverPreview || profile?.coverImage);

    return [
      { label: 'ព័ត៌មានមូលដ្ឋាន / Basic info', complete: hasDisplayName },
      { label: 'ប្រវត្តិហាង / Store story', complete: hasBio },
      { label: 'ទីតាំង / Location', complete: hasLocation },
      { label: 'ព័ត៌មានទំនាក់ទំនង / Contact', complete: hasContact },
      { label: 'រូបប្រវត្តិ / Profile photo', complete: hasAvatar },
      { label: 'រូបគម្រប / Cover photo', complete: hasCover }
    ];
  }, [avatarPreview, coverPreview, profile]);

  const completionPercentage = useMemo(() => {
    if (!completionChecks.length) return 0;
    const completed = completionChecks.filter((item) => item.complete).length;
    return Math.round((completed / completionChecks.length) * 100);
  }, [completionChecks]);

  const completionTone = completionPercentage >= 80
    ? 'from-emerald-500 to-emerald-600'
    : completionPercentage >= 50
    ? 'from-amber-500 to-orange-500'
    : 'from-slate-500 to-slate-600';

  const trustHighlights = useMemo(() => [
    { label: profileUi.verificationStatus, value: verificationStatusLabel },
    { label: profileUi.responseTime, value: 'ឆាប់ចំលើយ / Usually responsive' },
    { label: profileUi.storeHighlights, value: profile?.bio ? 'មានប្រវត្តិហាង / Store story added' : 'កំពុងរៀបរាប់ហាង / Story pending' }
  ], [profile?.bio, profileUi.responseTime, profileUi.storeHighlights, profileUi.verificationStatus, verificationStatusLabel]);

  const getLocationName = (province: number, district: number) => {
    const provinceObj = provinces.find((p) => p.id === province);
    if (!provinceObj) return '';
    if (!district) return provinceObj.name;
    const districtObj = provinceObj.districts?.find((d: any) => d.id === district);
    return districtObj ? `${districtObj.name}, ${provinceObj.name}` : provinceObj.name;
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setStatusMessage('');
      try {
        const provincesList = await getProvinces();
        setProvinces(provincesList);

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
          const [productsResponse, reviewsResponse] = await Promise.all([
            getProducts({ seller: finalProfile.id || finalProfile._id, page: '1', perPage: '12' }),
            getSellerReviews(finalProfile.id || finalProfile._id, { page: '1', perPage: '10' })
          ]);
          setProducts(productsResponse.items || []);
          setReviews(reviewsResponse.items || []);
          setReviewSummary(reviewsResponse.summary || { avgRating: 0, totalReviews: 0 });
        }
      } catch (error) {
        console.error(error);
        const response = (error as any)?.response;
        const message = response?.data?.message;
        if (response?.status === 401 && typeof message === 'string' && message.toLowerCase().includes('invalid or expired')) {
          return;
        }
        setStatusMessage('មិនអាចផ្ទុកព័ត៌មានប្រវត្តិអ្នកលក់បានទេ។ Unable to load profile.');
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
    setStatusMessage('កំពុងរក្សាទុកព័ត៌មាន... Saving profile...');
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
      setSuccessMessage('ព័ត៌មានត្រូវបានធ្វើបច្ចុប្បនីយដោយជោគជ័យ។ Profile updated successfully.');
      setStatusMessage('');

      if (isOwner) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedProfile }));
        setCurrentUser((current: any) => ({ ...current, ...updatedProfile }));
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('មិនអាចរក្សាទុកព័ត៌មានបានទេ។ សូមព្យាយាមម្តងទៀត។ Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.10),_transparent_32%),linear-gradient(135deg,_#f8fafc_0%,_#eef6f4_100%)] pb-14">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.65fr)] lg:items-start">
            <div className="relative overflow-hidden bg-text-primary">
              <SellerHero
                profile={profile}
                avatarImage={avatarImage}
                coverImage={coverImage}
                username={username}
                verificationStatusLabel={verificationStatusLabel}
                memberSinceLabel={memberSinceLabel}
              />
              <SellerStats stats={stats} memberSinceLabel={memberSinceLabel} />
            </div>

            <SellerSidebar
              profile={profile}
              isOwner={isOwner}
              completionPercentage={completionPercentage}
              completionTone={completionTone}
              completionChecks={completionChecks}
              startEdit={startEdit}
              setActiveTab={setActiveTab}
              profileUi={profileUi}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="hidden lg:block space-y-5">
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-muted">{profileUi.contactInformation}</p>
              <div className="mt-4 space-y-3 text-text-secondary">
                {profile?.phoneNumber && (
                  <a href={`tel:${profile.phoneNumber}`} className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-background px-4 py-3 text-sm text-text-secondary hover:border-primary hover:text-primary transition">
                    <Phone className="h-4 w-4 text-primary" /> {profile.phoneNumber}
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-background px-4 py-3 text-sm text-text-secondary hover:border-primary hover:text-primary transition">
                    <Mail className="h-4 w-4 text-primary" /> {profile.email}
                  </a>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-background px-4 py-3 text-sm text-text-secondary">
                    <MapPin className="h-4 w-4 text-primary" /> {profile.location}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-muted">Social</p>
              <div className="mt-4 space-y-3 text-text-secondary">
                {profile?.telegram && (
                  <a href={profile.telegram.startsWith('http') ? profile.telegram : `https://t.me/${profile.telegram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-background px-4 py-3 text-sm text-text-secondary hover:border-primary hover:text-primary transition">
                    <Link2 className="h-4 w-4 text-primary" /> {profile.telegram}
                  </a>
                )}
                {profile?.facebook && (
                  <a href={profile.facebook.startsWith('http') ? profile.facebook : `https://www.facebook.com/${profile.facebook.replace(/^\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-background px-4 py-3 text-sm text-text-secondary hover:border-primary hover:text-primary transition">
                    <Globe className="h-4 w-4 text-primary" /> {profile.facebook}
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-muted">{profileUi.storeInformation}</p>
              <div className="mt-4 space-y-3 text-text-secondary">
                <div className="rounded-[1.15rem] border border-slate-200 bg-background p-4">
                  <p className="text-sm font-semibold text-text-primary">{profileUi.verificationStatus}</p>
                  <p className="mt-2 text-sm">{verificationStatusLabel}</p>
                </div>
                <div className="rounded-[1.15rem] border border-slate-200 bg-background p-4">
                  <p className="text-sm font-semibold text-text-primary">{profileUi.trustAndSafety}</p>
                  <div className="mt-2 space-y-2 text-sm text-text-secondary">
                    <p>{profile?.bio ? 'Store story added' : 'Story pending'}</p>
                    <p>{profile?.location || 'Location not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <main className="space-y-5">
            {successMessage && (
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{successMessage}</div>
            )}
            {statusMessage && !successMessage && (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{statusMessage}</div>
            )}

            {isEditing ? (
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{profileUi.editProfile}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-text-primary">{profileUi.editProfile}</h2>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <section className="rounded-[1.5rem] border border-slate-200 bg-background p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{profileUi.basicInformation}</h3>
                        <p className="text-sm text-muted">{profileUi.coreSellerDetails}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <label className="block text-sm font-semibold text-text-secondary">
                        <span className="mb-2 block">{profileUi.displayName}</span>
                        <input
                          className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={profileForm.displayName}
                          onChange={(event) => setProfileForm((current) => ({ ...current, displayName: event.target.value }))}
                          placeholder="ឈ្មោះបង្ហាញ / Display name"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-text-secondary">
                        <span className="mb-2 block">{profileUi.location}</span>
                        <input
                          className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={profileForm.location}
                          onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                          placeholder="ទីក្រុង / City, Province"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-text-secondary lg:col-span-2">
                        <span className="mb-2 block">{profileUi.aboutStore}</span>
                        <textarea
                          className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          rows={5}
                          value={profileForm.bio}
                          onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                          placeholder="សូមរៀបរាប់អំពីហាងរបស់អ្នក / Tell buyers about your store"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-slate-200 bg-background p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{profileUi.contactInformationForm}</h3>
                        <p className="text-sm text-muted">{profileUi.contactDetailsForBuyers}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-semibold text-text-secondary">
                        <span className="mb-2 block">{profileUi.phoneNumber}</span>
                        <input
                          className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={profileForm.phoneNumber}
                          onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                          placeholder="+855 12 345 678"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-text-secondary">
                        <span className="mb-2 block">Telegram</span>
                        <input
                          className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={profileForm.telegram}
                          onChange={(event) => setProfileForm((current) => ({ ...current, telegram: event.target.value }))}
                          placeholder="@yourusername"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-text-secondary md:col-span-2">
                        <span className="mb-2 block">Facebook</span>
                        <input
                          className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={profileForm.facebook}
                          onChange={(event) => setProfileForm((current) => ({ ...current, facebook: event.target.value }))}
                          placeholder="facebook.com/yourpage"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-slate-200 bg-background p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Image className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{profileUi.storeImages}</h3>
                        <p className="text-sm text-muted">{profileUi.storeVisuals}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Camera className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-text-secondary">{profileUi.avatar}</span>
                        </div>
                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="h-24 w-24 overflow-hidden rounded-[1.15rem] bg-background shadow-sm">
                            <img src={avatarPreview || defaultAvatar} alt="Avatar preview" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          </div>
                          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-background px-4 py-3 text-sm font-semibold text-text-secondary shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-primary/30">
                            {profileUi.chooseAvatar}
                            <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, 'avatar')} />
                          </label>
                        </div>
                      </div>
                      <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Image className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-text-secondary">{profileUi.coverImage}</span>
                        </div>
                        <div className="mt-4">
                          <div className="h-36 overflow-hidden rounded-[1.15rem] bg-background shadow-sm">
                            <img src={coverPreview || defaultCover} alt="Cover preview" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          </div>
                          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-background px-4 py-3 text-sm font-semibold text-text-secondary shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-primary/30">
                            {profileUi.chooseCover}
                            <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, 'coverImage')} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-text-secondary transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {profileUi.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={loading}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {profileUi.saveProfile}
                  </button>
                </div>
              </div>
            ) : null}

            {activeTab === 'products' && !isEditing && (
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-bold text-text-primary">{profileUi.productsBySeller.replace('{name}', profile?.displayName || 'អ្នកលក់ / this seller')}</h2>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => window.location.assign('/post-product')}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    >
                      {profileUi.postNewProduct}
                    </button>
                  )}
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {loading ? (
                    <div className="col-span-full rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-muted">កំពុងទាញយកផលិតផល... / Loading products…</div>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        id={product.slug || product._id || product.id}
                        title={product.title}
                        price={product.price}
                        location={product.location}
                        category={product.category?.labelKh || product.category?.name}
                        imageUrl={getProductCoverImageUrl(product, product.imageUrl || '')}
                        viewsCount={product.viewsCount}
                        featured={product.featured || product.isFeatured}
                        seller={product.seller}
                      />
                    ))
                  ) : (
                    <div className="col-span-full rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-muted">
                      <p className="text-base font-semibold text-text-secondary">{profileId ? profileUi.noProductsForSeller : profileUi.noProducts}</p>
                      <p className="mt-2 text-sm">ទទួលបានអតិថិជនដោយការបង្ហាញផលិតផលថ្មី។ / Grow trust by listing a fresh product.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'about' && !isEditing && (
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{profileUi.aboutSeller}</p>
                    <h2 className="mt-2 text-lg font-semibold text-text-primary">{profileUi.storeInformation}</h2>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={startEdit}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    >
                      {profileUi.editProfile}
                    </button>
                  )}
                </div>
                <div className="mt-6 space-y-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-6">
                  <div className="space-y-6">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-background p-6">
                      <p className="text-sm font-semibold text-text-secondary">{profileUi.biography}</p>
                      <p className="mt-4 leading-8 text-text-secondary text-sm max-w-prose">{profile?.bio || profileUi.noBiography}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-background p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Image className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{profileUi.storeMedia}</p>
                          <p className="text-sm text-muted">រូបភាពដែលតំណាងឱ្យហាង / Visuals that represent your store</p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <img src={avatarImage} alt={profile?.displayName ? `${profile.displayName} avatar` : 'Seller avatar'} loading="lazy" decoding="async" className="h-32 w-full rounded-[1rem] object-cover" />
                          <p className="mt-3 text-sm font-semibold text-text-primary">{profileUi.profilePhoto}</p>
                        </div>
                        <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <img src={coverImage} alt={profile?.displayName ? `${profile.displayName} cover` : 'Seller cover'} loading="lazy" decoding="async" className="h-32 w-full rounded-[1rem] object-cover" />
                          <p className="mt-3 text-sm font-semibold text-text-primary">{profileUi.coverPhoto}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-background p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">{profileUi.contactInformation}</p>
                    <div className="mt-4 space-y-3 text-text-secondary">
                      {profile?.phoneNumber && (
                        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Phone className="h-4 w-4" />
                          </div>
                          <a className="text-sm text-text-secondary hover:text-primary" href={`tel:${profile.phoneNumber}`}>
                            {profile.phoneNumber}
                          </a>
                        </div>
                      )}
                      {profile?.email && (
                        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Mail className="h-4 w-4" />
                          </div>
                          <a className="text-sm text-text-secondary hover:text-primary" href={`mailto:${profile.email}`}>
                            {profile.email}
                          </a>
                        </div>
                      )}
                      {profile?.telegram && (
                        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Link2 className="h-4 w-4" />
                          </div>
                          <a
                            className="text-sm text-text-secondary hover:text-primary"
                            href={profile.telegram.startsWith('http') ? profile.telegram : `https://t.me/${profile.telegram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {profile.telegram}
                          </a>
                        </div>
                      )}
                      {profile?.facebook && (
                        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Globe className="h-4 w-4" />
                          </div>
                          <a
                            className="text-sm text-text-secondary hover:text-primary"
                            href={profile.facebook.startsWith('http') ? profile.facebook : `https://www.facebook.com/${profile.facebook.replace(/^\//, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {profile.facebook}
                          </a>
                        </div>
                      )}
                      {profile?.location && (
                        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-muted">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-text-secondary">{profile.location}</span>
                        </div>
                      )}
                      {(profile?.province || profile?.district) && (
                        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-muted">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-text-secondary">{getLocationName(profile.province, profile.district)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && !isEditing && (
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] space-y-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-muted">{profileUi.averageRating}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-3xl font-bold text-text-primary">{reviewSummary.avgRating.toFixed(1)}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`h-5 w-5 ${i <= Math.round(reviewSummary.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] bg-background px-6 py-4">
                    <p className="text-sm text-muted">{profileUi.totalReviews}</p>
                    <p className="mt-2 text-2xl font-bold text-text-primary">{reviewSummary.totalReviews}</p>
                  </div>
                </div>

                {authUser && !isOwner && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-base font-semibold text-text-primary">{profileUi.leaveReview}</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">{profileUi.rating}</label>
                        <div className="mt-2 flex gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                              className="focus:outline-none transition"
                            >
                              <Star className={`h-6 w-6 ${i <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">{profileUi.commentOptional}</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="ចែករំលែកបទពិសោធន៍របស់អ្នក... / Share your experience..."
                          className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          rows={4}
                          disabled={reviewLoading}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!profile?.id && !profile?._id) return;
                          setReviewLoading(true);
                          try {
                            await createReview({
                              seller: profile.id || profile._id,
                              rating: reviewForm.rating,
                              comment: reviewForm.comment
                            });
                            setReviewForm({ rating: 5, comment: '' });
                            const updated = await getSellerReviews(profile.id || profile._id, { page: '1', perPage: '10' });
                            setReviews(updated.items || []);
                            setReviewSummary(updated.summary || { avgRating: 0, totalReviews: 0 });
                            setSuccessMessage('ការវាយតម្លៃត្រូវបានបង្ហោះដោយជោគជ័យ! / Review posted successfully!');
                            setTimeout(() => setSuccessMessage(''), 4000);
                          } catch (err: any) {
                            const errorMsg = err.response?.data?.message || 'មិនអាចបង្ហោះការវាយតម្លៃបានទេ។ / Unable to post review';
                            setStatusMessage(errorMsg);
                          } finally {
                            setReviewLoading(false);
                          }
                        }}
                        disabled={reviewLoading}
                        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                      >
                        {reviewLoading ? 'កំពុងបង្ហោះ... / Posting...' : profileUi.postReview}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 border-t border-slate-200 pt-6">
                  <h3 className="text-base font-semibold text-text-primary">{profileUi.allReviews}</h3>
                  {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div key={review._id} className="rounded-[1.25rem] bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-text-primary">{review.reviewer?.displayName || 'អនាមិក / Anonymous'}</p>
                            <div className="mt-1 flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        {review.comment && <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-text-secondary">
                    <p className="font-semibold text-text-primary">{profileUi.noReviews}</p>
                    <p className="mt-2 text-sm text-muted">ការវាយតម្លៃចុងក្រោយនឹងបង្ហាញនៅទីនេះ។ / Recent feedback will appear here.</p>
                  </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


