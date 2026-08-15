"use client";

import * as React from "react";
import { MenuItemCard } from "@/components/shop/menu-item-card";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Image from "next/image";

interface MenuListProps {
  selectedCategoryId: string | null;
  searchQuery: string;
}

export type FilterType = "all" | "veg" | "nonveg" | "spicy" | "bestseller";

export function MenuList({ selectedCategoryId, searchQuery }: MenuListProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");

  React.useEffect(() => {
    const unsubItems = onSnapshot(collection(db, "menuItems"), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setMenuItems(items);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching menu items:", error);
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      setCategories(cats);
    });

    return () => {
      unsubItems();
      unsubCategories();
    };
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId ? item.categoryId === selectedCategoryId : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (activeFilter === "veg") matchesFilter = !!item.isVeg;
    if (activeFilter === "nonveg") matchesFilter = !!item.isNonVeg;
    if (activeFilter === "spicy") matchesFilter = !!item.isSpicy;
    if (activeFilter === "bestseller") matchesFilter = !!item.isBestSeller;

    return matchesCategory && matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground flex flex-col items-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        Loading menu...
      </div>
    );
  }

  return (
    <div className="px-4 py-4" id="menu">
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mt-2">
        <button 
          onClick={() => setActiveFilter("all")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border-2 flex items-center gap-2 ${
            activeFilter === "all" 
              ? "bg-foreground text-background border-foreground shadow-md shadow-black/10 dark:shadow-white/10" 
              : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:bg-secondary/50"
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveFilter("veg")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border-2 flex items-center gap-2.5 ${
            activeFilter === "veg" 
              ? "bg-green-50 text-green-700 border-green-500 shadow-sm shadow-green-500/20 dark:bg-green-950/30 dark:text-green-400" 
              : "bg-background text-muted-foreground border-border hover:border-green-500/30 hover:bg-green-50/50 dark:hover:bg-green-950/10"
          }`}
        >
          <div className={`h-3.5 w-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center ${activeFilter === "veg" ? "border-green-600 dark:border-green-400" : "border-muted-foreground"}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${activeFilter === "veg" ? "bg-green-600 dark:bg-green-400" : "bg-transparent"}`}></div>
          </div>
          Veg
        </button>
        <button 
          onClick={() => setActiveFilter("nonveg")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border-2 flex items-center gap-2.5 ${
            activeFilter === "nonveg" 
              ? "bg-red-50 text-red-700 border-red-500 shadow-sm shadow-red-500/20 dark:bg-red-950/30 dark:text-red-400" 
              : "bg-background text-muted-foreground border-border hover:border-red-500/30 hover:bg-red-50/50 dark:hover:bg-red-950/10"
          }`}
        >
          <div className={`h-3.5 w-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center ${activeFilter === "nonveg" ? "border-red-600 dark:border-red-400" : "border-muted-foreground"}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${activeFilter === "nonveg" ? "bg-red-600 dark:bg-red-400" : "bg-transparent"}`}></div>
          </div>
          Non-Veg
        </button>
        <button 
          onClick={() => setActiveFilter("spicy")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border-2 flex items-center gap-2 ${
            activeFilter === "spicy" 
              ? "bg-orange-50 text-orange-700 border-orange-500 shadow-sm shadow-orange-500/20 dark:bg-orange-950/30 dark:text-orange-400" 
              : "bg-background text-muted-foreground border-border hover:border-orange-500/30 hover:bg-orange-50/50 dark:hover:bg-orange-950/10"
          }`}
        >
          <span className="text-base leading-none">🌶️</span>
          Spicy
        </button>
        <button 
          onClick={() => setActiveFilter("bestseller")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border-2 flex items-center gap-2 ${
            activeFilter === "bestseller" 
              ? "bg-yellow-50 text-yellow-700 border-yellow-500 shadow-sm shadow-yellow-500/20 dark:bg-yellow-950/30 dark:text-yellow-400" 
              : "bg-background text-muted-foreground border-border hover:border-yellow-500/30 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/10"
          }`}
        >
          <span className="text-base leading-none">⭐</span>
          Bestseller
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 bg-[#F8F5EC] dark:bg-secondary/20 rounded-3xl">
          <Search className="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold">No items found</h3>
          <p className="text-sm mt-2">Try changing your search or category.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="bg-[#F8F5EC] dark:bg-secondary/30 rounded-3xl px-4 py-2 shadow-sm border border-black/5 dark:border-white/5"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const category = categories.find(c => c.id === item.categoryId);
              const isItemAvailable = item.isAvailable !== false && category?.isAvailable !== false;
              const itemToPass = { ...item, isAvailable: isItemAvailable };
              
              return (
                <motion.div
                  layout
                  key={itemToPass.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <MenuItemCard 
                    item={itemToPass} 
                    onImageClick={(image) => setSelectedImage(image)} 
                    isLast={index === filteredItems.length - 1}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Fullscreen Image Popup */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={selectedImage} 
                alt="Enlarged view" 
                fill 
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
