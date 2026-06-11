import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Phone, MessageCircle, ShieldCheck, ArrowUpRight, AlertTriangle, MapPin, CalendarDays, Heart } from 'lucide-react';
import { getProductById, getProducts, updateProduct, deleteProduct } from '../services/product.api';
import { getProfile } from '../services/auth.api';
import { checkFavorite, addFavorite, removeFavorite } from '../services/favorites.api';
import { createReport } from '../services/report.api';
import { formatPriceKHR, formatPriceUSD } from '../utils/price';
import SellerContactCard from '../components/marketplace/SellerContactCard';
import SEO from '../components/SEO';
import ProductCard from '../components/marketplace/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<'product' | 'user'>('product');
  const [reportReason, setReportReason] = useState<'scam' | 'fake_product' | 'duplicate_listing' | 'wrong_category' | 'other' | ''>('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  const getUserId = (user: any) => user?._id || user?.id || user?.userId;
  const getProductSellerId = (product: any) => product?.seller?._id || product?.seller?.id || product?.seller;

  const isOwner = useMemo(() => {
    const currentUserId = getUserId(currentUser);
    const sellerId = getProductSellerId(product);
    const emailMatch = currentUser?.email && product?.seller?.email && currentUser.email.toLowerCase() === product.seller.email.toLowerCase();
    return (
      Boolean(currentUserId && sellerId && String(currentUserId) === String(sellerId)) ||
      Boolean(emailMatch)
    );
  }, [currentUser, product]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setStatus('Loading product details...');
      try {
        const data = await getProductById(id);
        setProduct(data);
        setSelectedImage(data.images?.[0]?.secureUrl || data.images?.[0]?.url || '');
        const favorite = await checkFavorite(id);
        setIsFavorite(Boolean(favorite));
        setStatus('');
        try {
          const profile = await getProfile();
          setCurrentUser(profile);
        } catch (err) {
          setCurrentUser(null);
        }
      } catch (error) {
        setStatus('Unable to load product.');
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!product?.category?._id || !id) return;
      try {
        const response = await getProducts({ category: product.category._id, perPage: '4', sort: 'newest' });
        const items = response.items || [];
        setRelatedProducts(items.filter((item: any) => item._id !== product._id).slice(0, 4));
      } catch (error) {
        setRelatedProducts([]);
      }
    };
    loadRelated();
  }, [product, id]);

  const formatPrice = (price: number | string) => {
    return {
      usd: formatPriceUSD(price),
      khr: formatPriceKHR(price)
    };
  };

  const safelyPhone = (value?: string) => {
    if (!value) return '';
    return value.replace(/[^0-9+]/g, '');
  };

  const reportProduct = async () => {
    if (!product) return;
    const reason = reportReason || 'other';
    try {
      await createReport({
        targetType: reportTargetType,
        targetId: reportTargetType === 'product' ? product._id : product.seller?._id,
        reason,
        details: reportMessage || `Please review this listing: ${product.title}`
      });
      setReportSuccess('Your report has been submitted and will be reviewed by our team.');
      setReportOpen(false);
      setReportReason('');
      setReportMessage('');
    } catch (error) {
      setReportSuccess('Unable to submit the report. Please try again.');
    }
  };

  if (!product) {
    return <div className="p-8 text-center text-slate-600">{status || 'Loading product details...'}</div>;
  }

  const sellerPhone = safelyPhone(product.seller?.phoneNumber);
  const whatsappLink = sellerPhone ? `https://wa.me/${sellerPhone.replace(/^\+/, '')}` : null;
  const emailLink = product.seller?.email ? `mailto:${product.seller.email}?subject=Question%20about%20${encodeURIComponent(product.title)}` : null;
  const sellerJoined = product.seller?.createdAt ? new Date(product.seller.createdAt).toLocaleDateString() : null;
  const sellerVerificationStatus = product.seller?.sellerVerificationStatus || (product.seller?.verified ? 'verified' : 'unverified');

  return (
    <>
      <SEO
        title={`${product.title} in ${product.location || 'Cambodia'}`}
        description={product.description.slice(0, 155)}
        url={window.location.href}
        image={product.images?.[0]?.secureUrl || product.images?.[0]?.url || 'https://via.placeholder.com/1200x630.png?text=Marketplace+Kh'}
        type="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          image: [product.images?.[0]?.secureUrl || product.images?.[0]?.url || 'https://via.placeholder.com/1200x630.png?text=Marketplace+Kh'],
          description: product.description,
          sku: product._id,
          brand: {
            '@type': 'Brand',
            name: product.category?.labelKh || product.category?.name || 'Konpuk'
          },
          offers: {
            '@type': 'Offer',
            url: window.location.href,
            priceCurrency: 'USD',
            price: product.price,
            availability: product.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Product detail</p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-slate-900">{product.title}</h1>
                <button
                  type="button"
                  onClick={async () => {
                    if (!id) return;
                    try {
                      if (isFavorite) {
                        await removeFavorite(id);
                        setIsFavorite(false);
                      } else {
                        await addFavorite(id);
                        setIsFavorite(true);
                      }
                    } catch (err) {
                      console.error('Favorite toggle failed:', err);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                >
                  <Heart className="w-4 h-4" />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{product.category?.labelKh || product.category?.name || 'General'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{product.location || 'Local'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{product.condition || 'Condition not specified'}</span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 rounded-3xl bg-slate-100 px-5 py-4 text-left sm:text-right">
              <span className="text-sm text-slate-500">Price</span>
              <span className="text-3xl font-semibold text-sky-600">{formatPrice(product.price).usd}</span>
              <span className="text-sm text-slate-500">{formatPrice(product.price).khr}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                {product.status === 'sold' ? 'Sold' : 'Available'}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(360px,0.5fr)_minmax(480px,0.7fr)]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-sm">
                <img
                  src={selectedImage || product.images?.[0]?.secureUrl || product.images?.[0]?.url || 'https://via.placeholder.com/1000x700.png?text=No+Image'}
                  alt={product.title}
                  className="h-96 w-full object-cover"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid gap-3 grid-cols-3 sm:grid-cols-4">
                  {product.images.map((image: any) => {
                    const src = image.secureUrl || image.url;
                    return (
                      <button
                        key={image._id}
                        type="button"
                        onClick={() => setSelectedImage(src)}
                        className={`overflow-hidden rounded-3xl border ${selectedImage === src ? 'border-sky-500' : 'border-transparent'} bg-white focus:outline-none focus:ring-2 focus:ring-sky-400`}
                      >
                        <img src={src} alt={product.title} className="h-24 w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="rounded-[2rem] bg-slate-50 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Quick details</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Category</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{product.category?.labelKh || product.category?.name || 'General'}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Location</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{product.location || 'Not specified'}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Condition</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{product.condition || 'N/A'}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Listed</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-slate-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Product overview</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Seller information</p>
                        <h3 className="mt-3 text-xl font-semibold text-slate-900 inline-flex items-center gap-2">
                          {product.seller?.displayName || 'Seller'}
                        </h3>
                      </div>
                      {sellerVerificationStatus === 'verified' ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                          <ShieldCheck className="w-4 h-4" /> ✓ Verified Seller
                        </div>
                      ) : sellerVerificationStatus === 'unverified' ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">
                          Unverified Seller
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-100">
                    {product.seller?.profileImageUrl ? (
                      <img src={product.seller.profileImageUrl} alt={product.seller.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">No Image</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {product.seller?.location && (
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {product.seller.location}</p>
                  )}
                  {sellerJoined && (
                    <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-slate-400" /> Joined {sellerJoined}</p>
                  )}
                  {product.seller?.email && (
                    <p className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-slate-400" /> {product.seller.email}</p>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <SellerContactCard 
                    sellerName={product.seller?.displayName}
                    sellerPhone={sellerPhone}
                    sellerEmail={product.seller?.email}
                    telegramHandle={product.seller?.telegramHandle}
                  />
                  {/* Owner controls */}
                  {isOwner && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/post-product?id=${product._id}`)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Edit Product
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this product?')) return;
                          try {
                            await deleteProduct(product._id);
                            navigate('/dashboard');
                          } catch (err) {
                            alert('Unable to delete product.');
                          }
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Delete Product
                      </button>
                      {product.status !== 'sold' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateProduct(product._id, { status: 'sold' });
                              setStatus('Product marked as sold.');
                              setProduct({ ...product, status: 'sold' });
                            } catch (err) {
                              setStatus('Could not update product status.');
                            }
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                        >
                          Mark as Sold
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReportTargetType('product');
                        setReportOpen(!reportOpen);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <AlertTriangle className="w-4 h-4" /> Report listing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportTargetType('user');
                        setReportOpen(!reportOpen);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition"
                    >
                      <ShieldCheck className="w-4 h-4" /> Report seller
                    </button>
                  </div>
                </div>

                {reportOpen && (
                  <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Report this {reportTargetType === 'product' ? 'listing' : 'seller'}</p>
                    <div className="mt-3 space-y-4">
                      <label className="block text-sm text-slate-700">
                        Reason
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value as 'scam' | 'fake_product' | 'duplicate_listing' | 'wrong_category' | 'other' | '')}
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                        >
                          <option value="">Select reason</option>
                          <option value="scam">Scam</option>
                          <option value="fake_product">Fake product</option>
                          <option value="duplicate_listing">Duplicate listing</option>
                          <option value="wrong_category">Wrong category</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <label className="block text-sm text-slate-700">
                        Message
                        <textarea
                          value={reportMessage}
                          onChange={(e) => setReportMessage(e.target.value)}
                          rows={3}
                          placeholder="Add any additional details"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={reportProduct}
                        className="rounded-3xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition"
                      >
                        Submit report
                      </button>
                    </div>
                  </div>
                )}

                {reportSuccess && (
                  <div className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">
                    {reportSuccess}
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] bg-slate-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Safety tips for buyers</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" /> Meet in a safe public place.</li>
                  <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" /> Verify the product before paying.</li>
                  <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" /> Use trusted payment methods where possible.</li>
                  <li className="flex items-start gap-3"><span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" /> Keep conversation on the platform or email for proof.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Related listings</p>
                <h2 className="text-2xl font-semibold text-slate-900">More listings like this</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-sky-600 hover:text-sky-700">Browse all</Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item._id}
                  id={item._id}
                  title={item.title}
                  price={item.price}
                  location={item.location || 'Unknown'}
                  category={item.category?.labelKh || item.category?.name || 'General'}
                  imageUrl={item.images?.[0]?.secureUrl || item.images?.[0]?.url || ''}
                  seller={item.seller}
                />
              ))}
            </div>
          </div>
        )}

        {status && <p className="mt-6 text-sm text-slate-600">{status}</p>}
      </div>
    </>
  );
};

export default ProductDetailPage;
