import { Link } from 'react-router-dom';
import { Globe, AtSign, Share2, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Khmer24</h3>
            <p className="text-sm text-slate-400 mb-4">
              Cambodia's leading online marketplace for buying and selling products locally.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-sky-400 transition">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-sky-400 transition">
                <AtSign className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-sky-400 transition">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-sky-400 transition">Home</Link></li>
              <li><Link to="/post-product" className="text-sm hover:text-sky-400 transition">Post Product</Link></li>
              <li><Link to="/dashboard" className="text-sm hover:text-sky-400 transition">Dashboard</Link></li>
              <li><Link to="/chat" className="text-sm hover:text-sky-400 transition">Messages</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Popular Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-sky-400 transition">Electronics</a></li>
              <li><a href="#" className="text-sm hover:text-sky-400 transition">Vehicles</a></li>
              <li><a href="#" className="text-sm hover:text-sky-400 transition">Real Estate</a></li>
              <li><a href="#" className="text-sm hover:text-sky-400 transition">Fashion</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>+855 (0) 12 345 678</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>support@khmer24.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Phnom Penh, Cambodia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© {currentYear} Khmer24. All rights reserved. Built for Cambodian buyers and sellers.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-sky-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-sky-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-sky-400 transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
