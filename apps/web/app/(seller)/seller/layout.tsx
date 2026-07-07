import SellerDashboardLayout from "@/components/seller/SellerDashboardLayout";

export const metadata = {
  title: "Seller Dashboard - Entry Ecommerce",
  description: "Manage your seller account and products",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerDashboardLayout>{children}</SellerDashboardLayout>;
}
