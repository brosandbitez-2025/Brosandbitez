"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { CategoryList } from "@/components/shop/category-list";
import { MenuList } from "@/components/shop/menu-list";
import { BannerCarousel } from "@/components/shop/banner-carousel";

export default function ShopPage() {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="flex flex-col min-h-screen">
      <BannerCarousel />

      <div className="px-4 mt-4 mb-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for your favorite food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary border border-black/5 dark:border-white/5 outline-none focus:ring-2 focus:ring-primary/50 text-base shadow-sm"
          />
        </div>
      </div>

      <CategoryList 
        selectedCategoryId={selectedCategoryId} 
        onSelectCategory={setSelectedCategoryId} 
      />
      
      <MenuList 
        selectedCategoryId={selectedCategoryId} 
        searchQuery={searchQuery}
      />
    </div>
  );
}
