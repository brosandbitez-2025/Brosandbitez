"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
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
    addons?: { name: string; price: number }[];
  };
  onImageClick: (image: string) => void;
  isLast?: boolean;
}

export function MenuItemCard({ item, onImageClick, isLast }: MenuItemProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  
  const totalQuantity = items.filter((i) => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
  const baseCartItem = items.find((i) => i.id === item.id && (!i.addons || i.addons.length === 0));
  const baseQuantity = baseCartItem?.quantity || 0;
  
  const hasAddons = item.addons && item.addons.length > 0;
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedAddons, setSelectedAddons] = React.useState<{name: string, price: number}[]>([]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasAddons) {
      setSelectedAddons([]);
      setIsModalOpen(true);
    } else {
      const basePrice = item.offerPrice || item.price;
      addItem({
        id: item.id,
        cartItemId: item.id,
        name: item.name,
        price: basePrice,
        imageUrl: item.image,
        quantity: 1,
        addons: [],
      });
    }
  };

  const handleConfirmAddons = () => {
    const basePrice = item.offerPrice || item.price;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const cartItemId = item.id + (selectedAddons.length > 0 ? '-' + selectedAddons.map(a => a.name).sort().join('-') : '');
    
    addItem({
      id: item.id,
      cartItemId,
      name: item.name,
      price: basePrice + addonsTotal,
      imageUrl: item.image,
      quantity: 1,
      addons: selectedAddons,
    });
    setIsModalOpen(false);
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasAddons) {
      const lastVariant = items.slice().reverse().find(i => i.id === item.id);
      if (lastVariant) {
        updateQuantity(lastVariant.cartItemId, lastVariant.quantity - 1);
      }
    } else if (baseCartItem) {
      updateQuantity(baseCartItem.cartItemId, baseQuantity - 1);
    }
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasAddons) {
      setSelectedAddons([]);
      setIsModalOpen(true);
    } else if (baseCartItem) {
      updateQuantity(baseCartItem.cartItemId, baseQuantity + 1);
    }
  };

  const toggleAddon = (addon: {name: string, price: number}) => {
    if (selectedAddons.some(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  return (
    <>
      <article
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
          ) : totalQuantity > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="self-start flex items-center gap-3 bg-secondary text-foreground font-bold text-sm px-1 py-1 rounded-full shadow-sm">
                <button 
                  onClick={handleMinus}
                  className="h-6 w-6 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                >
                  -
                </button>
                <span className="w-4 text-center">{totalQuantity}</span>
                <button 
                  onClick={handlePlus}
                  className="h-6 w-6 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                >
                  +
                </button>
              </div>
              {hasAddons && (
                <span className="text-[10px] text-muted-foreground font-medium pl-2">Customized</span>
              )}
            </div>
          ) : (
            <button 
              onClick={handleAdd}
              className="self-start flex items-center gap-1 bg-primary text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform relative"
            >
              {hasAddons ? "Customize" : "Add"} <Plus className="h-3 w-3" />
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
      </article>

      <AnimatePresence>
        {isModalOpen && item.addons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card z-10">
                <h3 className="font-bold text-lg">Customize {item.name}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Add-Ons</p>
                <div className="space-y-3">
                  {item.addons.map((addon, idx) => {
                    const isSelected = selectedAddons.some(a => a.name === addon.name);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-primary border-primary text-black' : 'border-muted-foreground'
                          }`}>
                            {isSelected && <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5"><path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="font-medium text-foreground">{addon.name}</span>
                        </div>
                        <span className="font-bold text-muted-foreground">+₹{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-md sticky bottom-0">
                <button
                  onClick={handleConfirmAddons}
                  className="w-full h-14 bg-primary text-black font-bold text-lg rounded-2xl flex justify-between items-center px-6 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
                >
                  <span>Add Item</span>
                  <span>₹{( (item.offerPrice || item.price) + selectedAddons.reduce((sum, a) => sum + a.price, 0) ).toFixed(2)}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
