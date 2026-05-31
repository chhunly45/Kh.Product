import { Link } from 'react-router-dom';
import { ShoppingBag, Car, Home, Sofa, Smartphone, Briefcase, Music, TrendingUp } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Smartphone, color: 'bg-blue-100', iconColor: 'text-blue-600' },
  { name: 'Vehicles', icon: Car, color: 'bg-red-100', iconColor: 'text-red-600' },
  { name: 'Real Estate', icon: Home, color: 'bg-green-100', iconColor: 'text-green-600' },
  { name: 'Furniture', icon: Sofa, color: 'bg-purple-100', iconColor: 'text-purple-600' },
  { name: 'Fashion', icon: ShoppingBag, color: 'bg-pink-100', iconColor: 'text-pink-600' },
  { name: 'Business', icon: Briefcase, color: 'bg-amber-100', iconColor: 'text-amber-600' },
  { name: 'Entertainment', icon: Music, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { name: 'More', icon: TrendingUp, color: 'bg-slate-100', iconColor: 'text-slate-600' },
];

const CategoriesGrid = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className={`${category.color} rounded-xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${category.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Browse listings</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
