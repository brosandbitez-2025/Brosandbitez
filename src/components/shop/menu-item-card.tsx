"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    offerPrice: number | null;
    image: string;
    isVeg: boolean;
    isNonVeg?: boolean;
    isEgg?: boolean;
    isBestSeller?: boolean;
    isAvailable: boolean;
  };
  onImageClick: (image: string) => void;
  isLast?: boolean;
}

export function MenuItemCard({ item, onImageClick, isLast }: MenuItemProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      price: item.offerPrice || item.price,
      imageUrl: item.image,
      quantity: 1,
    });
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity + 1);
  };

  return (
    <div
      className={`flex items-center justify-between py-4 group transition-colors ${
        !isLast ? "border-b border-black/10 dark:border-white/10" : ""
      }`}
    >
      <div className="flex flex-col flex-1 pr-4">
        {item.isBestSeller && (
          <div className="mb-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shadow-sm">
              <span className="text-[10px]">⭐</span> Bestseller
            </span>
          </div>
        )}
        <h3 className="font-bold text-base text-foreground mb-1 leading-tight line-clamp-2">
          {item.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-foreground">
            ₹{(item.offerPrice || item.price).toFixed(2)}
          </span>
        </div>
        
        {item.isAvailable === false ? (
          <span className="text-xs text-red-500 font-bold mt-1">Sold Out</span>
        ) : quantity > 0 ? (
          <div className="self-start flex items-center gap-3 bg-secondary text-foreground font-bold text-sm px-1 py-1 rounded-full shadow-sm">
            <button 
              onClick={handleMinus}
              className="h-6 w-6 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
            >
              -
            </button>
            <span className="w-4 text-center">{quantity}</span>
            <button 
              onClick={handlePlus}
              className="h-6 w-6 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAdd}
            className="self-start flex items-center gap-1 bg-primary text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>

      <motion.div 
        whileTap={{ scale: 0.95 }}
        onClick={() => onImageClick(item.image)}
        className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden shrink-0 bg-secondary shadow-sm cursor-pointer"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
            item.isAvailable === false ? "grayscale opacity-70" : ""
          }`}
          sizes="(max-width: 768px) 33vw, 20vw"
        />
        <div className="absolute top-1 right-1">
          {item.isNonVeg ? (
            <span className="h-3 w-3 border border-red-600 bg-red-100 flex items-center justify-center p-[2px]">
              <span className="h-full w-full bg-red-600"></span>
            </span>
          ) : item.isEgg ? (
            <span className="h-3 w-3 border border-yellow-600 bg-yellow-100 flex items-center justify-center p-[2px]">
              <span className="h-full w-full bg-yellow-600"></span>
            </span>
          ) : item.isVeg ? (
            <span className="h-3 w-3 border border-green-600 bg-green-100 flex items-center justify-center p-[2px]">
              <span className="h-full w-full bg-green-600"></span>
            </span>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
