"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Clock, Info, Mail, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);



export default function ContactPage() {
  const [contactData, setContactData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showContactPopup, setShowContactPopup] = React.useState(false);

  React.useEffect(() => {
    const contactRef = doc(db, "settings", "contact");
    const unsubscribe = onSnapshot(contactRef, (docSnap) => {
      if (docSnap.exists()) {
        setContactData(docSnap.data());
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 py-32 flex justify-center items-center">
        <div className="animate-pulse text-muted-foreground font-bold">Loading details...</div>
      </div>
    );
  }

  const openingDays = contactData?.openingDays || "Mon - Sun";
  const openingHours = contactData?.openingHours || "11:00 AM - 11:00 PM";
  const contactEmail = contactData?.contactEmail || "hello@brosbitez.com";
  const contactPhone = contactData?.whatsappNumber || "+1 234 567 890";
  const addressText = contactData?.addressText || "123 Food Street, Culinary District, City 45678";
  const googleMapsUrl = contactData?.googleMapsUrl;
  const instagramUrl = contactData?.instagramUrl;
  const facebookUrl = contactData?.facebookUrl;

  return (
    <div className="px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Contact Us</h1>
          <p className="text-muted-foreground text-sm">Get in touch with us.</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl flex flex-col items-start gap-3">
          <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Opening Hours</h3>
            <p className="text-xs text-muted-foreground">{openingDays}<br/>{openingHours}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowContactPopup(true)}
          className="glass-card p-4 rounded-2xl flex flex-col items-start gap-3 hover:bg-secondary/80 transition-colors text-left"
        >
          <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Contact</h3>
            <p className="text-xs text-muted-foreground">{contactPhone}<br/>{contactEmail}</p>
          </div>
        </button>
      </div>

      {/* Address */}
      {googleMapsUrl ? (
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="glass-card p-4 rounded-3xl flex items-center gap-4 hover:bg-secondary/80 transition-colors group cursor-pointer block">
          <div className="h-12 w-12 shrink-0 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Address</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{addressText}</p>
          </div>
        </a>
      ) : (
        <section className="glass-card p-4 rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Address</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{addressText}</p>
          </div>
        </section>
      )}

      {/* Socials */}
      {(instagramUrl || facebookUrl) && (
        <section className="flex gap-4">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex-1 glass-card p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="font-bold text-sm">Instagram</span>
            </a>
          )}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex-1 glass-card p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-sm">Facebook</span>
            </a>
          )}
        </section>
      )}



      {/* Contact Popup */}
      <AnimatePresence>
        {showContactPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactPopup(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl shadow-xl border border-border relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
                <h3 className="font-bold text-lg">Reach Out</h3>
                <button 
                  onClick={() => setShowContactPopup(false)}
                  className="h-8 w-8 bg-background rounded-full flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <a 
                  href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} 
                  className="w-full flex items-center gap-4 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-500 p-4 rounded-2xl transition-colors group"
                >
                  <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Call Us</h4>
                    <p className="text-sm font-medium">{contactPhone}</p>
                  </div>
                </a>
                
                <a 
                  href={`mailto:${contactEmail}`} 
                  className="w-full flex items-center gap-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-500 p-4 rounded-2xl transition-colors group"
                >
                  <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Email Us</h4>
                    <p className="text-sm font-medium">{contactEmail}</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
