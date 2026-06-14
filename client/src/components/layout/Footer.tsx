import { Link } from 'react-router-dom';
import { Globe, Share2, Phone, Mail, MapPin, ShoppingBag, Heart, Send } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white border-t border-primary-hover">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Konpuk</span>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Cambodia's #1 online marketplace for buying and selling products locally.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/80 hover:bg-primary-hover flex items-center justify-center transition">
                <Share2 className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/80 hover:bg-accent flex items-center justify-center transition">
                <Heart className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/80 hover:bg-accent/90 flex items-center justify-center transition">
                <Send className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-white/80 hover:text-white transition">Home</Link></li>
              <li><Link to="/products" className="text-sm text-white/80 hover:text-white transition">Browse Products</Link></li>
              <li><Link to="/post-product" className="text-sm text-white/80 hover:text-white transition">Post Product</Link></li>
              <li><Link to="/messages" className="text-sm text-white/80 hover:text-white transition">Messages</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Categories</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Electronics</a></li>
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Vehicles</a></li>
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Real Estate</a></li>
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Fashion</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Safety Tips</a></li>
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="text-sm text-white/80 hover:text-white transition">Report Issue</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-white/80 flex-shrink-0" />
                <span className="text-white/80">+855 (0) 23 999 999</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                <span className="text-white/80">support@konpuk.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
                <span className="text-white/80">Phnom Penh, Cambodia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-hover pt-8"></div>

        {/* Bottom Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-white/80">
          <p>© {currentYear} Konpuk. All rights reserved. Made for Cambodia. 🇰🇭</p>
          <div className="flex flex-wrap gap-4 sm:justify-end">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
