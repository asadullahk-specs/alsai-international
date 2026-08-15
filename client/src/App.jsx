import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthTransitionProvider } from './context/AuthTransitionContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerNotificationProvider } from './context/CustomerNotificationContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminNotificationProvider } from './context/AdminNotificationContext';
import { CartProvider } from './context/CartContext';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminProtectedRoute from './routes/AdminProtectedRoute';
import AdminLayout from './admin/layouts/AdminLayout';

import Home from './pages/Home';
import Shop from './pages/shop/Shop';
import ProductPage from './pages/product/ProductPage';
import GiftSetPage from './pages/product/GiftSetPage';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import GiftSets from './pages/GiftSets';
import Promotions from './pages/SeasonalCuts';
import Contact from './pages/Contact';
import About from './pages/static/About';
import PolicyPage from './pages/static/PolicyPage';
import FAQs from './pages/static/FAQs';
import NotFound from './pages/static/NotFound';

import Checkout from './pages/checkout/Checkout';

import OrdersList from './pages/account/OrdersList';
import OrderDetails from './pages/account/OrderDetails';
import Profile from './pages/account/Profile';
import Notifications from './pages/account/Notifications';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import AdminLogin from './admin/pages/AdminLogin/AdminLogin';
import AdminForgotPassword from './admin/pages/AdminForgotPassword/AdminForgotPassword';
import AdminResetPassword from './admin/pages/AdminResetPassword/AdminResetPassword';
import AdminDashboard from './admin/pages/Dashboard/Dashboard';
import CategoriesPage from './admin/pages/Categories/CategoriesPage';
import CollectionsPage from './admin/pages/Collections/CollectionsPage';
import FragranceFamiliesPage from './admin/pages/FragranceFamilies/FragranceFamiliesPage';
import GiftSetsList from './admin/pages/GiftSets/GiftSetsList';
import GiftSetForm from './admin/pages/GiftSets/GiftSetForm';
import ProductsList from './admin/pages/Products/ProductsList';
import ProductForm from './admin/pages/Products/ProductForm';

import OrdersListAdmin from './admin/pages/Orders/OrdersList';
import OrderDetailsAdmin from './admin/pages/Orders/OrderDetails';
import CustomersList from './admin/pages/Customers/CustomersList';
import CustomerDetails from './admin/pages/Customers/CustomerDetails';
import ReviewsPage from './admin/pages/Reviews/ReviewsPage';
import NewsletterPage from './admin/pages/Newsletter/NewsletterPage';
import MessagesPage from './admin/pages/Messages/MessagesPage';
import InventoryPage from './admin/pages/Inventory/InventoryPage';
import ReportsPage from './admin/pages/Reports/ReportsPage';
import AdminNotificationsPage from './admin/pages/Notifications/NotificationsPage';
import FeaturedCollectionsPage from './admin/pages/FeaturedCollections/FeaturedCollectionsPage';
import PromotionsAdminPage from './admin/pages/SeasonalCollections/SeasonalCollectionsPage';
import HomepageManager from './admin/pages/HomepageManager/HomepageManager';
import WebsiteContentPage from './admin/pages/WebsiteContent/WebsiteContentPage';
import SettingsPage from './admin/pages/Settings/SettingsPage';
import UsersRolesPage from './admin/pages/UsersRoles/UsersRolesPage';
import ActivityLogsPage from './admin/pages/ActivityLogs/ActivityLogsPage';
import BackupRestorePage from './admin/pages/BackupRestore/BackupRestorePage';
import SuppliersList from './admin/pages/Suppliers/SuppliersList';
import SupplierDetails from './admin/pages/Suppliers/SupplierDetails';
import PurchasesList from './admin/pages/Purchases/PurchasesList';
import PurchaseForm from './admin/pages/Purchases/PurchaseForm';
import PurchaseDetails from './admin/pages/Purchases/PurchaseDetails';
import PaymentsList from './admin/pages/Payments/PaymentsList';
import ExpensesList from './admin/pages/Expenses/ExpensesList';
import ReturnsList from './admin/pages/Returns/ReturnsList';
import ReturnDetails from './admin/pages/Returns/ReturnDetails';
import TestimonialsPage from './admin/pages/Testimonials/TestimonialsPage';

function App() {
  return (
    <AuthTransitionProvider>
    <AuthProvider>
      <CustomerNotificationProvider>
      <AdminAuthProvider>
        <AdminNotificationProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/gift-sets" element={<GiftSets />} />
              <Route path="/gift-sets/:slug" element={<GiftSetPage />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/policies/:type" element={<PolicyPage />} />

              {/* No customer panel/dashboard - these are ordinary pages inside
                  the normal site chrome (navbar/footer), gated only by login. */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="fragrance-families" element={<FragranceFamiliesPage />} />
              <Route path="gift-sets" element={<GiftSetsList />} />
              <Route path="gift-sets/new" element={<GiftSetForm />} />
              <Route path="gift-sets/:id" element={<GiftSetForm />} />
              <Route path="orders" element={<OrdersListAdmin />} />
              <Route path="orders/:id" element={<OrderDetailsAdmin />} />
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="newsletter" element={<NewsletterPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="featured-collections" element={<FeaturedCollectionsPage />} />
              <Route path="promotions" element={<PromotionsAdminPage />} />
              <Route path="homepage-manager" element={<HomepageManager />} />
              <Route path="website-content" element={<WebsiteContentPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users-roles" element={<UsersRolesPage />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="backup-restore" element={<BackupRestorePage />} />
              <Route path="suppliers" element={<SuppliersList />} />
              <Route path="suppliers/:id" element={<SupplierDetails />} />
              <Route path="purchases" element={<PurchasesList />} />
              <Route path="purchases/new" element={<PurchaseForm />} />
              <Route path="purchases/:id" element={<PurchaseDetails />} />
              <Route path="purchases/:id/edit" element={<PurchaseForm />} />
              <Route path="payments" element={<PaymentsList />} />
              <Route path="expenses" element={<ExpensesList />} />
              <Route path="returns" element={<ReturnsList />} />
              <Route path="returns/:id" element={<ReturnDetails />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
            </Route>
          </Routes>
        </CartProvider>
        </AdminNotificationProvider>
      </AdminAuthProvider>
      </CustomerNotificationProvider>
    </AuthProvider>
    </AuthTransitionProvider>
  );
}

export default App;
