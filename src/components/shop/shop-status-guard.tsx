"use client";

import * as React from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import Image from "next/image";

export function ShopStatusGuard({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState<boolean>(true);

  React.useEffect(() => {
    const docRef = doc(db, "settings", "shopStatus");

    // Force an initial fetch so it doesn't hang silently if websocket is blocked
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setIsOpen(docSnap.data().isOpen);
      } else {
        setIsOpen(true);
      }
    }).catch((err) => {
      console.error("Initial fetch failed:", err);
      // If we fail to connect, we must assume open to not break the app
      setIsOpen(true);
    });

    // Also set up the real-time listener
    const unsub = onSnapshot(
      docRef, 
      (doc) => {
        if (doc.exists()) {
          setIsOpen(doc.data().isOpen);
        }
      },
      (error) => {
        console.error("Error listening to shop status:", error);
      }
    );

    return () => unsub();
  }, []);

  return (
    <>
      {/* 
        We render the children regardless, but if it's closed, 
        we completely obscure them with a high z-index fixed overlay 
        so they can't be interacted with or seen properly.
      */}
      {children}

      {!isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 overflow-hidden bg-background/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: -500, rotate: -15 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              mass: 1.5,
            }}
            className="relative flex flex-col items-center"
          >
            {/* The Strings */}
            <div className="flex justify-between w-48 mb-[-10px] z-0">
              <div className="h-32 w-1 bg-gradient-to-b from-transparent to-amber-900/40 rotate-12" />
              <div className="h-32 w-1 bg-gradient-to-b from-transparent to-amber-900/40 -rotate-12" />
            </div>
            
            {/* The Wooden Board */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10 w-80 max-w-[90vw] p-8 rounded-xl shadow-2xl overflow-hidden bg-amber-800 border-4 border-amber-950 flex flex-col items-center"
              style={{
                backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,0,0,0.3))",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2)"
              }}
            >
              {/* Wood Grain Texture Overlay (simulated with CSS stripes) */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,1) 10px, rgba(0,0,0,1) 20px)" }} 
              />
              
              <div className="relative h-20 w-40 mb-4 bg-white/10 rounded-xl p-2 backdrop-blur-md shadow-inner border border-white/20 flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" fill sizes="160px" className="object-contain drop-shadow-lg p-1" />
              </div>
              
              <h2 className="text-4xl font-black text-amber-50 uppercase tracking-widest drop-shadow-md text-center">
                Closed
              </h2>
              
              <div className="w-full h-px bg-amber-950/50 my-4" />
              <div className="w-full h-px bg-amber-500/30 mb-4 -mt-3" />
              
              <p className="text-amber-100/90 text-center text-sm font-medium">
                Sorry, we are currently not accepting orders. Please check back later!
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
}
