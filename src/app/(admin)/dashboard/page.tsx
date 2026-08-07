"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed, Tags, List, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: "Total Menu Items", value: "-", icon: UtensilsCrossed, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Categories", value: "-", icon: List, color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Active Offers", value: "-", icon: Tags, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const itemsSnap = await getCountFromServer(collection(db, "menuItems"));
        const catsSnap = await getCountFromServer(collection(db, "categories"));
        const bannersSnap = await getCountFromServer(collection(db, "banners"));

        setStats([
          { name: "Total Menu Items", value: itemsSnap.data().count.toString(), icon: UtensilsCrossed, color: "text-blue-500", bg: "bg-blue-500/10" },
          { name: "Categories", value: catsSnap.data().count.toString(), icon: List, color: "text-green-500", bg: "bg-green-500/10" },
          { name: "Active Offers", value: bannersSnap.data().count.toString(), icon: Tags, color: "text-orange-500", bg: "bg-orange-500/10" },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your digital menu performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden"
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
              <h3 className="text-3xl font-black">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1 text-muted-foreground/50" /> : stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>


    </div>
  );
}
