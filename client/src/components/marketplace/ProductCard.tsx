import { Link } from 'react-router-dom';
import { useEffect, useState, MouseEvent } from 'react';
import { MapPin, Heart, Eye } from 'lucide-react';
import { formatViewsCount } from '../../utils/views';
import { formatPriceKHR, formatPriceUSD } from '../../utils/price';

interface ProductCardProps {
  title: string;
  price: string | number;
  location?: string;
  category?: string;
  id: string;
  imageUrl?: string;
  viewsCount?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string, currentlyFavorite: boolean) => void;
  seller?: { displayName?: string; sellerVerificationStatus?: string };
}

const ProductCard = ({ title, price, location, category, id, imageUrl, viewsCount = 0, isFavorite = false, onToggleFavorite, seller }: ProductCardProps) => {
  const [isSaved, setIsSaved] = useState<boolean>(isFavorite);

  useEffect(() => {
    setIsSaved(Boolean(isFavorite));
  }, [isFavorite]);
  const fallback = 'https://via.placeholder.com/600x400.png?text=No+Image';
  const src = imageUrl || fallback;
  
  const formatPrice = (p: string | number): { usd: string; khr: string } => {
    return {
      usd: formatPriceUSD(p),
      khr: formatPriceKHR(p)
    };
  };

  const priceText = formatPrice(price);

  return (
    <Link to={`/products/${id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:border-sky-200">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-slate-200">
        <img 
          src={src} 
          alt={title} 
          className="h-full w-full object-cover transition duration-300 group-hover:scale-110" 
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              {category}
            </span>
          </div>
        )}
        {/* Seller badge */}
        {seller?.sellerVerificationStatus === 'verified' && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
              Verified Seller ✓
            </span>
          </div>
        )}
        {seller?.sellerVerificationStatus === 'unverified' && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow">
              Unverified Seller
            </span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const nextValue = !isSaved;
            setIsSaved(nextValue);
            if (onToggleFavorite) {
              onToggleFavorite(id, isSaved);
            }
          }}
          className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-slate-400 hover:text-red-500 hover:bg-white transition shadow-md"
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`w-5 h-5 transition ${isSaved ? 'text-red-500 fill-current' : 'text-slate-400'}`}
            fill={isSaved ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
          {title}
        </h3>

        {/* Location */}
        {location && (
          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <span className="text-lg font-bold text-sky-600 block">
              {priceText.usd}
            </span>
            <span className="text-xs text-slate-500">
              {priceText.khr}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 group-hover:bg-slate-200 transition">
            <Eye className="w-4 h-4" />
            {formatViewsCount(viewsCount)} views
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
