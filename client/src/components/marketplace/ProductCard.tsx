import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';

interface ProductCardProps {
  title: string;
  price: string | number;
  location?: string;
  category?: string;
  id: string;
  imageUrl?: string;
}

const ProductCard = ({ title, price, location, category, id, imageUrl }: ProductCardProps) => {
  const fallback = 'https://via.placeholder.com/600x400.png?text=No+Image';
  const src = imageUrl || fallback;
  
  const formatPrice = (p: string | number): string => {
    if (typeof p === 'number') {
      return `₨${p.toLocaleString()}`;
    }
    return p;
  };

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
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-slate-400 hover:text-red-500 hover:bg-white transition shadow-md"
        >
          <Heart className="w-5 h-5" />
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
          <span className="text-lg font-bold text-sky-600">
            {formatPrice(price)}
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-600 group-hover:bg-sky-100 transition">
            View
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
