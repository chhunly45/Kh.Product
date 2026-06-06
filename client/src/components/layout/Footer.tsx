import { Link } from 'react-router-dom';
import { Globe, Share2, Phone, Mail, MapPin, ShoppingBag, Heart, Send } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Khmer24</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Cambodia's #1 online marketplace for buying and selling products locally.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-sky-600 flex items-center justify-center transition">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition">
                <Heart className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-400 flex items-center justify-center transition">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-slate-400 hover:text-sky-400 transition">Home</Link></li>
              <li><Link to="/products" className="text-sm text-slate-400 hover:text-sky-400 transition">Browse Products</Link></li>
              <li><Link to="/post-product" className="text-sm text-slate-400 hover:text-sky-400 transition">Post Product</Link></li>
              <li><Link to="/chat" className="text-sm text-slate-400 hover:text-sky-400 transition">Messages</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Categories</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Electronics</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Vehicles</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Real Estate</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Fashion</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Safety Tips</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Contact Us</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition">Report Issue</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="text-slate-400">+855 (0) 23 999 999</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="text-slate-400">support@khmer24.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Phnom Penh, Cambodia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8"></div>

        {/* Bottom Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-400">
          <p>© {currentYear} Khmer24. All rights reserved. Made for Cambodia. 🇰🇭</p>
          <div className="flex flex-wrap gap-4 sm:justify-end">
            <a href="#" className="hover:text-sky-400 transition">Privacy</a>
            <a href="#" className="hover:text-sky-400 transition">Terms</a>
            <a href="#" className="hover:text-sky-400 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
