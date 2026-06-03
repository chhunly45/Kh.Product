import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import api from '../../services/api';

interface CategoryItem {
  _id: string;
  name: string;
  labelKh?: string;
}

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="bg-slate-100 rounded-xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{category.labelKh || category.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Browse listings</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">Loading categories…</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
