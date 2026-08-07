"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Tag, Phone } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Offers", href: "/offers", icon: Tag },
  { name: "Contact", href: "/contact", icon: Phone },
];

export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <nav className="fixed bottom-0 z-50 w-full glass pb-safe md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                <item.icon
                  className={`h-5 w-5 z-10 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {item.name === "Cart" && totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium z-10 transition-colors ${
                  isActive ? "text-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
