import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PermissionsProvider } from "@/hooks/usePermissions";
import LoginPage from "@/pages/auth/LoginPage";
import CallbackPage from "@/pages/auth/CallbackPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AccountPage from "@/pages/dashboard/AccountPage";

import UsersPage from "@/pages/dashboard/UsersPage";
import RolesPage from "@/pages/dashboard/RolesPage";
import PermissionsPage from "@/pages/dashboard/PermissionsPage";
import SubscriptionsPage from "@/pages/dashboard/SubscriptionsPage";
import AddressesPage from "@/pages/dashboard/AddressesPage";
import EmployeesPage from "@/pages/dashboard/EmployeesPage";
import SalariesPage from "@/pages/dashboard/SalariesPage";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import CategoriesPage from "@/pages/dashboard/CategoriesPage";
import BrandsPage from "@/pages/dashboard/BrandsPage";
import ProductTypesPage from "@/pages/dashboard/ProductTypesPage";
import OrdersPage from "@/pages/dashboard/Orders";
import ProductBannersPage from "./pages/dashboard/ProductBannersPage";
import BannersPage from "./pages/dashboard/BannersPage";
import AdsBannersPage from "./pages/dashboard/AdsBannersPage";
import InvoicePage from "./pages/dashboard/InvoicePage";
import ReviewsPage from "./pages/dashboard/ReviewsPage";
import SocialMediaPage from "./pages/dashboard/SocialMediaPage";
import SearchPage from "./pages/dashboard/SearchPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import PurchasesPage from "./pages/dashboard/PurchasesPage";
import CreatePurchasePage from "./pages/dashboard/purchases/CreatePurchasePage";
import ApprovedPurchasePage from "./pages/dashboard/purchases/ApprovedPurchasePage";
import PurchasedItemsPage from "./pages/dashboard/purchases/PurchasedItemsPage";
import SuppliersPage from "./pages/dashboard/purchases/SuppliersPage";
import WebsiteConfigPage from "./pages/dashboard/WebsiteConfigPage";
import ComponentTypesPage from "./pages/dashboard/ComponentTypesPage";
import WebsiteIconsPage from "./pages/WebsiteIcons";
import SellersPage from "./pages/dashboard/SellersPage";
import SellerProductsPage from "./pages/dashboard/SellerProductsPage";
import SellerConfigPage from "./pages/dashboard/SellerConfigPage";
import BaseConfigPage from "./pages/dashboard/BaseConfigPage";
import ContactMessagesPage from "./pages/dashboard/ContactMessagesPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-dashboard-theme">
      <PermissionsProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route
              path="customers"
              element={<Navigate to="/dashboard/users" replace />}
            />
            <Route path="roles" element={<RolesPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="salaries" element={<SalariesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="invoices" element={<InvoicePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="ads-banners" element={<AdsBannersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="product-types" element={<ProductTypesPage />} />
            <Route path="product-banners" element={<ProductBannersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="purchases/create" element={<CreatePurchasePage />} />
            <Route
              path="purchases/approved"
              element={<ApprovedPurchasePage />}
            />
            <Route
              path="purchases/purchased"
              element={<PurchasedItemsPage />}
            />
            <Route path="purchases/suppliers" element={<SuppliersPage />} />
            <Route path="social-media" element={<SocialMediaPage />} />
            <Route path="base-config" element={<BaseConfigPage />} />
            <Route path="website-config" element={<WebsiteConfigPage />} />
            <Route path="website-icons" element={<WebsiteIconsPage />} />
            <Route path="component-types" element={<ComponentTypesPage />} />
            <Route path="sellers" element={<SellersPage />} />
            <Route path="seller-products" element={<SellerProductsPage />} />
            <Route path="seller-config" element={<SellerConfigPage />} />
            <Route path="contact" element={<ContactMessagesPage />} />
          </Route>

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* API Debugger - Development Only */}
        {/* <ApiDebugger />  */}
      </PermissionsProvider>
    </ThemeProvider>
  );
}

export default App;
