import { Link } from 'react-router-dom';
import { ShoppingBag, MessageSquare, LayoutDashboard, UploadCloud, LogIn, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Khmer24
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-sky-600 transition">Home</Link>
            <Link to="/post-product" className="flex items-center gap-1 hover:text-sky-600 transition">
              <UploadCloud className="w-4 h-4" />
              Post Product
            </Link>
            <Link to="/chat" className="flex items-center gap-1 hover:text-sky-600 transition">
              <MessageSquare className="w-4 h-4" />
              Chat
            </Link>
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-sky-600 transition">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 transition"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition shadow-lg shadow-sky-500/30"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Register</span>
            </Link>
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50 transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
