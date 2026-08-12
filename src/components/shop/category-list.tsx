"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder?: number;
}

interface CategoryListProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryList({ selectedCategoryId, onSelectCategory }: CategoryListProps) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const cats: Category[] = [];
        querySnapshot.forEach((doc) => {
          cats.push({ id: doc.id, ...doc.data() } as Category);
        });
        cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full pt-2 pb-6 px-4">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 bg-secondary rounded-full animate-pulse flex-shrink-0" />
              <div className="h-3 w-12 bg-secondary rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto hide-scrollbar pt-2 pb-6 px-4">
      <div className="flex gap-4 w-max">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(null)}
          className="flex flex-col items-center gap-2 group outline-none"
        >
          <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            selectedCategoryId === null
              ? "bg-primary text-black shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
              : "bg-secondary text-secondary-foreground group-hover:bg-secondary/80"
          }`}>
            All
          </div>
          <span className={`text-xs font-semibold ${selectedCategoryId === null ? "text-primary" : "text-muted-foreground"}`}>
            Menu
          </span>
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className="flex flex-col items-center gap-2 group outline-none"
          >
            <div className={`relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-secondary transition-all duration-300 ${
              selectedCategoryId === category.id
                ? "shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                : "group-hover:opacity-90"
            }`}>
              {category.imageUrl && (category.imageUrl.startsWith('http') || category.imageUrl.startsWith('/')) ? (
                <Image 
                  src={category.imageUrl} 
                  alt={category.name} 
                  fill 
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground text-lg bg-secondary">
                  {category.imageUrl ? category.imageUrl : category.name.charAt(0)}
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold whitespace-nowrap ${selectedCategoryId === category.id ? "text-primary" : "text-muted-foreground"}`}>
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
