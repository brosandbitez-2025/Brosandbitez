"use client";

import * as React from "react";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Upload, Loader2 } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import Image from "next/image";

import imageCompression from "browser-image-compression";

interface Banner {
  id: string;
  imageUrl: string;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newImageFile, setNewImageFile] = React.useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [newIsActive, setNewIsActive] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);

  const fetchBanners = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "banners"));
      const fetchedBanners: Banner[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBanners.push({ id: doc.id, ...doc.data() } as Banner);
      });
      setBanners(fetchedBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Helper to prevent infinite hanging when offline or API is disabled
  const withTimeout = <T,>(promise: Promise<T>, ms = 8000) => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageFile && !imageUrlInput) {
      alert("Please select an image to upload or paste a URL");
      return;
    }
    
    setIsUploading(true);
    try {
      let finalImageUrl = imageUrlInput;

      // Only upload to Firebase Storage if they actually selected a file
      if (newImageFile && !imageUrlInput) {
        let fileToUpload: File | Blob = newImageFile;
        let fileName = newImageFile.name;

        // Skip compression for GIFs to preserve animation
        if (newImageFile.type !== "image/gif") {
          fileToUpload = await imageCompression(newImageFile, {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1200,
            useWebWorker: false,
          });
          fileName = (fileToUpload as File).name || newImageFile.name;
        }

        const storageRef = ref(storage, `banners/${Date.now()}_${fileName}`);
        await uploadBytes(storageRef, fileToUpload);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "banners"), {
        imageUrl: finalImageUrl,
        isActive: newIsActive
      });
      
      setNewImageFile(null);
      setImageUrlInput("");
      setImagePreview(null);
      setNewIsActive(true);
      setIsAdding(false);
      fetchBanners();
    } catch (error) {
      console.error("Error uploading banner:", error);
      alert("Failed to save. Make sure your internet is working or your Firebase rules are correct.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "banners", id));
        
        // Try to delete from Storage (might fail if it's an external Unsplash URL, which is fine)
        if (imageUrl.includes("firebasestorage.googleapis.com")) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (storageError) {
            console.log("Could not delete image from storage (might have been removed already):", storageError);
          }
        }
        
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "banners", id), {
        isActive: !currentStatus
      });
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-black">Banners</h1>
          <p className="text-muted-foreground mt-1">Manage the hero slideshow offers.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
        >
          <Plus className="h-5 w-5 shrink-0" />
          Add Banner
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card p-6 rounded-3xl"
        >
          <form onSubmit={handleAddBanner} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold">Upload Banner Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-2xl cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors relative overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, or GIF (Max 5MB)</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e);
                      setImageUrlInput("");
                    }}
                  />
                </label>
              </div>
              <div className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest my-4">OR</div>
              <input 
                type="url" 
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setNewImageFile(null);
                  setImagePreview(e.target.value);
                }}
                placeholder="Paste Image URL directly (bypasses Firebase Storage)"
                className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
              />
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={newIsActive}
                onChange={(e) => setNewIsActive(e.target.checked)}
                className="h-5 w-5 rounded-md border-border text-primary focus:ring-primary bg-background"
              />
              <span className="font-bold">Active in Slideshow</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => {
                  setIsAdding(false);
                  setImagePreview(null);
                  setNewImageFile(null);
                }} 
                className="h-12 px-6 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isUploading || (!newImageFile && !imageUrlInput)}
                className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Uploading
                  </>
                ) : (
                  "Upload Banner"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          Loading banners...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="glass-card rounded-2xl overflow-hidden shadow-sm group">
              <div className="relative h-48 w-full bg-secondary">
                <Image
                  src={banner.imageUrl}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  {banner.isActive ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                      <XCircle className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <button 
                  onClick={() => toggleActiveStatus(banner.id, banner.isActive)}
                  className={`text-sm font-bold ${banner.isActive ? "text-orange-500 hover:text-orange-600" : "text-green-500 hover:text-green-600"}`}
                >
                  {banner.isActive ? "Deactivate" : "Activate"}
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(banner.id, banner.imageUrl)}
                    className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
              No banners found. Upload one to show on the customer homepage!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
