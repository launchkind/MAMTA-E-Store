import type { Metadata } from "next";
import React from "react";
import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";
import { supabase, mapCategory } from "@/lib/supabase";
import { getBaseConfig } from "@/lib/baseConfig";

async function fetchCategories() {
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image, icon_image, category_type, level, parent_id")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("sort_order")
    .limit(10);
  return (data ?? []).map(mapCategory);
}

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Mamta E-Store – Shop Online",
    template: "%s | Mamta E-Store",
  },
  description:
    "Mamta E-Store — discover thousands of products at great prices. Trusted sellers, fast delivery, and secure payments.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, baseConfig] = await Promise.all([
    fetchCategories(),
    getBaseConfig(),
  ]);

  return (
    <>
      <Header logoUrl={null} baseConfig={baseConfig} categories={categories} />
      <div className="bg-muted min-h-screen pb-20">{children}</div>
      <Footer />
    </>
  );
}
