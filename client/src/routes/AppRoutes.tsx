import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProductListPage from '../pages/ProductListPage';
const PostProductPage = lazy(() => import('../pages/PostProductPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const AccountSettingsPage = lazy(() => import('../pages/AccountSettingsPage'));
import FavoritesPage from '../pages/FavoritesPage';
const ChatPage = lazy(() => import('../pages/ChatPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const SellerAnalyticsPage = lazy(() => import('../pages/SellerAnalyticsPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminBannersPage = lazy(() => import('../pages/AdminBannersPage'));
const AdminRevenuePage = lazy(() => import('../pages/AdminRevenuePage'));
const AdminTrafficAnalyticsPage = lazy(() => import('../pages/AdminTrafficAnalyticsPage'));
const AdminPromotionsPage = lazy(() => import('../pages/AdminPromotionsPage'));
const SellerPromotionsPage = lazy(() => import('../pages/SellerPromotionsPage'));
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
import AdminRoute from './AdminRoute';
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
import NotFoundPage from '../pages/NotFoundPage';
const VerificationRequestPage = lazy(() => import('../pages/VerificationRequestPage'));
const AdminVerificationReviewPage = lazy(() => import('../pages/AdminVerificationReviewPage'));
import AboutPage from '../pages/AboutPage';
import GuidePage from '../pages/GuidePage';
import HelpPage from '../pages/HelpPage';

const LazyRouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center text-text-secondary" aria-live="polite">
    Loading...
  </div>
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<LazyRouteFallback />}>
    {element}
  </Suspense>
);

const AppRoutes = () => (
  <Routes>
    {/* Root route renders the new Konpuk homepage component */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/products" element={<ProductListPage />} />
    <Route path="/products/:slug" element={<ProductDetailPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/guide" element={<GuidePage />} />
    <Route path="/help" element={<HelpPage />} />
    <Route path="/post-product" element={withSuspense(<PostProductPage />)} />
    <Route path="/profile" element={withSuspense(<ProfilePage />)} />
    <Route path="/profile/:id" element={withSuspense(<ProfilePage />)} />
    <Route path="/account-settings" element={withSuspense(<AccountSettingsPage />)} />
    <Route path="/notifications" element={withSuspense(<NotificationsPage />)} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/chat" element={<Navigate replace to="/messages" />} />
    <Route path="/messages" element={withSuspense(<ChatPage />)} />
    <Route path="/messages/:id" element={withSuspense(<ChatPage />)} />
    <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />
    <Route path="/seller/analytics" element={withSuspense(<SellerAnalyticsPage />)} />
    <Route path="/seller/promotions" element={withSuspense(<SellerPromotionsPage />)} />
    <Route path="/verification/request" element={withSuspense(<VerificationRequestPage />)} />
    <Route path="/admin" element={<AdminRoute />}>
      <Route element={withSuspense(<AdminLayout />)}>
        <Route index element={withSuspense(<AdminDashboardPage />)} />
        <Route path="users" element={withSuspense(<AdminDashboardPage />)} />
        <Route path="sellers" element={withSuspense(<AdminDashboardPage />)} />
        <Route path="verification" element={withSuspense(<AdminVerificationReviewPage />)} />
        <Route path="products" element={withSuspense(<AdminDashboardPage />)} />
        <Route path="reports" element={withSuspense(<AdminDashboardPage />)} />
        <Route path="revenue" element={withSuspense(<AdminRevenuePage />)} />
        <Route path="traffic" element={withSuspense(<AdminTrafficAnalyticsPage />)} />
        <Route path="promotions" element={withSuspense(<AdminPromotionsPage />)} />
        <Route path="analytics" element={withSuspense(<AdminDashboardPage />)} />
        <Route path="audit" element={withSuspense(<AdminDashboardPage />)} />
        <Route path="banners" element={withSuspense(<AdminBannersPage />)} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
