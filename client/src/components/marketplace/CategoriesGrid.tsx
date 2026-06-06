import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Smartphone, Cpu, Car, Home, Camera, Heart, Gift, Zap, BookOpen, Palette, Utensils } from 'lucide-react';
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

  const categoryIcon = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes('phone') || key.includes('tablet') || key.includes('mobile')) return Smartphone;
    if (key.includes('electronics') || key.includes('computer') || key.includes('laptop') || key.includes('tech')) return Cpu;
    if (key.includes('vehicle') || key.includes('car') || key.includes('motorcycle') || key.includes('auto')) return Car;
    if (key.includes('home') || key.includes('furniture') || key.includes('property') || key.includes('real')) return Home;
    if (key.includes('camera') || key.includes('photo') || key.includes('image') || key.includes('video')) return Camera;
    if (key.includes('fashion') || key.includes('beauty') || key.includes('clothes') || key.includes('dress')) return Heart;
    if (key.includes('book') || key.includes('education') || key.includes('learning')) return BookOpen;
    if (key.includes('art') || key.includes('craft') || key.includes('design')) return Palette;
    if (key.includes('food') || key.includes('restaurant') || key.includes('kitchen')) return Utensils;
    return Gift;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-sky-400',
      'from-purple-500 to-pink-400',
      'from-green-500 to-emerald-400',
      'from-orange-500 to-amber-400',
      'from-red-500 to-rose-400',
      'from-indigo-500 to-blue-400',
      'from-cyan-500 to-sky-400',
      'from-teal-500 to-green-400',
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.length > 0 ? (
            categories.map((category, index) => {
              const Icon = categoryIcon(category.name || category.labelKh || '');
              const colorGradient = getCategoryColor(index);
              return (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 transform hover:scale-105"
                >
                  {/* Background Gradient Icon */}
                  <div className={`absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br ${colorGradient} opacity-10 rounded-full group-hover:opacity-20 transition`}></div>
                  
                  {/* Content */}
                  <div className="relative p-5 sm:p-6 h-full flex flex-col items-start justify-between">
                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition mb-3 sm:mb-4`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug">
                        {category.labelKh || category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">Browse listings</p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition">
                      <Zap className="w-4 h-4 text-sky-500" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-600">
              Loading categories…
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
