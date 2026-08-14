"use client";

import * as React from "react";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
}



export function BannerCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );
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
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading || banners.length === 0) return null;

  return (
    <div className="w-full px-4 pt-4 mb-2">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-48 sm:h-64 w-full rounded-3xl overflow-hidden shadow-lg shadow-black/10">
                <Image
                  src={banner.imageUrl}
                  alt="Special Offer"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
