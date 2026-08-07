"use client";

import * as React from "react";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { Tag, Loader2 } from "lucide-react";

interface Banner {
  id: string;
  imageUrl: string;
  isActive: boolean;
}

export default function OffersPage() {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, "banners"), where("isActive", "==", true));
        const snapshot = await getDocs(q);
        const fetchedBanners: Banner[] = [];
        snapshot.forEach((doc) => {
          fetchedBanners.push({ id: doc.id, ...doc.data() } as Banner);
        });
        setBanners(fetchedBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="px-4 py-8 pb-24 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Offers & Deals</h1>
          <p className="text-muted-foreground text-sm">Exclusive discounts just for you.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          Loading amazing offers...
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-black/5 dark:border-white/5">
          <p className="text-muted-foreground">No active offers right now. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative h-48 sm:h-64 w-full rounded-3xl overflow-hidden shadow-lg shadow-black/10"
            >
              <Image
                src={banner.imageUrl}
                alt="Special Offer"
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
