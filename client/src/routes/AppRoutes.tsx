import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProductListPage from '../pages/ProductListPage';
import PostProductPage from '../pages/PostProductPage';
import ProfilePage from '../pages/ProfilePage';
import FavoritesPage from '../pages/FavoritesPage';
import ChatPage from '../pages/ChatPage';
import DashboardPage from '../pages/DashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import NotificationsPage from '../pages/NotificationsPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => (
  <Routes>
    {/* Root route renders the new Khmer24 homepage component */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/products" element={<ProductListPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/post-product" element={<PostProductPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/admin" element={<AdminDashboardPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
