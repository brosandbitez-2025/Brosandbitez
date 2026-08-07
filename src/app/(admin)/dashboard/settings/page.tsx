"use client";

import * as React from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { Store, Phone, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [openingDays, setOpeningDays] = React.useState("");
  const [openingHours, setOpeningHours] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [addressText, setAddressText] = React.useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [facebookUrl, setFacebookUrl] = React.useState("");
  
  const [isSavingContact, setIsSavingContact] = React.useState(false);

  React.useEffect(() => {
    const docRef = doc(db, "settings", "shopStatus");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsOpen(docSnap.data().isOpen);
      }
    });

    const contactRef = doc(db, "settings", "contact");
    const unsubContact = onSnapshot(contactRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.whatsappNumber !== undefined) setWhatsappNumber(data.whatsappNumber);
        if (data.openingDays !== undefined) setOpeningDays(data.openingDays);
        if (data.openingHours !== undefined) setOpeningHours(data.openingHours);
        if (data.contactEmail !== undefined) setContactEmail(data.contactEmail);
        if (data.addressText !== undefined) setAddressText(data.addressText);
        if (data.googleMapsUrl !== undefined) setGoogleMapsUrl(data.googleMapsUrl);
        if (data.instagramUrl !== undefined) setInstagramUrl(data.instagramUrl);
        if (data.facebookUrl !== undefined) setFacebookUrl(data.facebookUrl);
      }
    });

    return () => {
      unsubscribe();
      unsubContact();
    };
  }, []);

  // Helper to prevent infinite hanging when offline
  const withTimeout = <T,>(promise: Promise<T>, ms = 5000) => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);
  };

  const toggleStatus = async () => {
    setIsSaving(true);
    const newStatus = !isOpen;
    try {
      const docRef = doc(db, "settings", "shopStatus");
      await withTimeout(setDoc(docRef, { isOpen: newStatus }, { merge: true }));
      // Only update UI if Firebase successfully saves it
      setIsOpen(newStatus);
    } catch (error) {
      console.error("Firebase save failed:", error);
      alert("Failed to save to Firebase. Please check your internet connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveContact = async () => {
    setIsSavingContact(true);
    try {
      const contactRef = doc(db, "settings", "contact");
      await withTimeout(setDoc(contactRef, { 
        whatsappNumber: whatsappNumber.trim(),
        openingDays: openingDays.trim(),
        openingHours: openingHours.trim(),
        contactEmail: contactEmail.trim(),
        addressText: addressText.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
      }, { merge: true }));
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Firebase save failed:", error);
      alert("Failed to save. Please check your connection.");
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-8 px-4 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Shop Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your shop's status and contact information.</p>
        </div>
      </div>

      {/* Shop Status Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
            isOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{isOpen ? "Shop is Open" : "Shop is Closed"}</h2>
            <p className="text-sm text-muted-foreground">
              {isOpen ? "Customers can place orders." : "Ordering is disabled."}
            </p>
          </div>
        </div>
        
        {/* Sleek Toggle */}
        <button
          onClick={toggleStatus}
          disabled={isSaving}
          className={`relative h-8 w-14 rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
            isOpen ? 'bg-green-500' : 'bg-secondary border border-border'
          }`}
        >
          <motion.div
            animate={{ x: isOpen ? 24 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`absolute top-1 h-6 w-6 rounded-full shadow-sm ${
              isOpen ? 'bg-white' : 'bg-muted-foreground'
            }`}
          />
        </button>
      </div>

      {/* Contact & Details Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Contact & Location Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">WhatsApp Number</label>
            <input 
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Contact Email</label>
            <input 
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@brosbitez.com"
              className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Opening Days</label>
            <input 
              type="text"
              value={openingDays}
              onChange={(e) => setOpeningDays(e.target.value)}
              placeholder="Mon - Sun"
              className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Opening Hours</label>
            <input 
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="11:00 AM - 11:00 PM"
              className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Shop Address</label>
            <textarea 
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="123 Food Street..."
              rows={2}
              className="w-full bg-background border border-border rounded-xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Google Maps Link</label>
            <input 
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-bold mb-4">Social Media Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Instagram URL</label>
              <input 
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Facebook URL</label>
              <input 
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={saveContact}
            disabled={isSavingContact}
            className="w-full md:w-auto px-8 h-12 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSavingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
