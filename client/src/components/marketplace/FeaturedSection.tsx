import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  category: string;
}

interface FeaturedSectionProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllLink?: string;
}

const FeaturedSection = ({ title, description, products, viewAllLink = '/' }: FeaturedSectionProps) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-2 text-slate-600">{description}</p>}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition group"
            >
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              imageUrl={(product as any).images?.[0]?.secureUrl || (product as any).images?.[0]?.url || (product as any).imageUrl || ''}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
