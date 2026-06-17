import { Link } from 'react-router-dom';
import { useEffect, useState, MouseEvent } from 'react';
import { MapPin, Heart, Eye } from 'lucide-react';
import { formatViewsCount } from '../../utils/views';
import { formatPriceKHR, formatPriceUSD } from '../../utils/price';
import { getCategoryLabel } from '../../utils/category';

interface ProductCardProps {
  title?: string;
  titleKh?: string;
  titleEn?: string;
  price: string | number;
  location?: string;
  category?: string | { name?: string; labelKh?: string };
  id: string;
  imageUrl?: string;
  viewsCount?: number;
  featured?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string, currentlyFavorite: boolean) => void;
  seller?: { displayName?: string; sellerVerificationStatus?: string };
}

const ProductCard = ({ title, titleKh, titleEn, price, location, category, id, imageUrl, viewsCount = 0, featured = false, isFavorite = false, onToggleFavorite, seller }: ProductCardProps) => {
  const [isSaved, setIsSaved] = useState<boolean>(isFavorite);

  const categoryLabel = getCategoryLabel(category, '');

  // Determine display title: prefer bilingual (Kh / En), fallback to whichever is available
  const displayTitle = titleKh && titleEn ? `${titleKh} / ${titleEn}` : titleEn || titleKh || title || 'Product';
  const altText = title || displayTitle;

  useEffect(() => {
    setIsSaved(Boolean(isFavorite));
  }, [isFavorite]);

  const fallback = '/no-image.png';
  const src = imageUrl || fallback;

  const formatPrice = (p: string | number): { usd: string; khr: string } => ({
    usd: formatPriceUSD(p),
    khr: formatPriceKHR(p)
  });

  const priceText = formatPrice(price);
  const sellerVerified = seller?.sellerVerificationStatus === 'verified';

  return (
    <Link
      to={`/products/${id}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-surface-muted bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:border-primary"
    >
      <div className="relative h-64 overflow-hidden bg-surface">
        <img
          src={src}
          alt={altText}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {categoryLabel && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary shadow-sm">
            {categoryLabel}
          </span>
        )}

        {featured && (
          <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
            Featured
          </span>
        )}

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
          className="absolute right-4 bottom-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-muted shadow-lg transition hover:text-red-500 hover:bg-white"
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-5 h-5 transition ${isSaved ? 'text-red-500 fill-current' : 'text-muted'}`} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition">
              {displayTitle}
            </h3>
            {location && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4 text-muted" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{priceText.usd}</p>
            <p className="text-xs text-text-secondary">{priceText.khr}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {seller?.sellerVerificationStatus && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${sellerVerified ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-text-secondary'}`}
            >
              {sellerVerified ? 'Verified seller' : 'Unverified seller'}
            </span>
          )}
          <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {formatViewsCount(viewsCount)} views
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;


