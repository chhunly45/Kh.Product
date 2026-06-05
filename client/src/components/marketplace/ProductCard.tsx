import { Link } from 'react-router-dom';

interface ProductCardProps {
  title: string;
  price: string;
  location: string;
  category: string;
  id: string;
  imageUrl?: string;
}

const ProductCard = ({ title, price, location, category, id, imageUrl }: ProductCardProps) => {
  return (
    <Link to={`/products/${id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-slate-200">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.75))]" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
            {category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm text-slate-500">{location}</p>
        <div className="mt-4 flex items-center justify-between gap-3 text-slate-900">
          <span className="text-base font-semibold">{price}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 group-hover:bg-sky-100">View</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
