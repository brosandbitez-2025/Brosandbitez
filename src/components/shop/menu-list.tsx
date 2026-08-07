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

export function MenuList({ selectedCategoryId, searchQuery }: MenuListProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
    return matchesCategory && matchesSearch;
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
