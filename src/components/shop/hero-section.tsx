"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 flex flex-col items-center text-center">
      {/* Background gradients */}
      <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-black">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-orange-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Now Open for Dine-in & Takeaway
        </div>
      </motion.div>

      <motion.h1
        className="text-4xl md:text-6xl font-black tracking-tight mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        Taste the <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
          Extraordinary.
        </span>
      </motion.h1>

      <motion.p
        className="text-muted-foreground text-base md:text-lg max-w-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        Premium quality burgers, wraps, and more, crafted with passion.
      </motion.p>

      <motion.button
        className="flex items-center gap-2 rounded-full bg-primary text-black font-bold px-8 py-4 shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        onClick={() => {
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Explore Menu
        <ChevronRight className="h-5 w-5" />
      </motion.button>

      {/* Floating images decoration (optional) */}
      <motion.div
        className="absolute left-[-20px] top-[20%] w-24 h-24 rounded-full overflow-hidden shadow-2xl shadow-black/20 border-4 border-white dark:border-zinc-800 hidden sm:block"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80"
          alt="Burger"
          fill
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="absolute right-[-10px] top-[40%] w-20 h-20 rounded-full overflow-hidden shadow-2xl shadow-black/20 border-4 border-white dark:border-zinc-800 hidden sm:block"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
      >
        <Image
          src="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=200&q=80"
          alt="Fries"
          fill
          className="object-cover"
        />
      </motion.div>
    </section>
  );
}
