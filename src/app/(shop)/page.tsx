"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { CategoryList } from "@/components/shop/category-list";
import { MenuList } from "@/components/shop/menu-list";
import { BannerCarousel } from "@/components/shop/banner-carousel";

export default function ShopPage() {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <BannerCarousel />

      <CategoryList 
        selectedCategoryId={selectedCategoryId} 
        onSelectCategory={setSelectedCategoryId} 
      />
      
      <MenuList 
        selectedCategoryId={selectedCategoryId} 
        searchQuery=""
      />
    </div>
  );
}
