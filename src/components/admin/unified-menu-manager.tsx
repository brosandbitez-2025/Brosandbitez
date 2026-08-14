"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, Upload, Loader2, Image as ImageIcon, ChevronDown, MoreVertical, GripVertical, X } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import Image from "next/image";
import imageCompression from "browser-image-compression";

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  image?: string;
  isVeg?: boolean;
  isNonVeg?: boolean;
  isEgg?: boolean;
  isBestSeller?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
  addons?: { name: string, price: number }[];
}

const withTimeout = <T,>(promise: Promise<T>, ms = 8000) => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);
};

export function UnifiedMenuManager() {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // --- Category Form State ---
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [editingCatId, setEditingCatId] = React.useState<string | null>(null);
  const [catName, setCatName] = React.useState("");
  const [catImageFile, setCatImageFile] = React.useState<File | null>(null);
  const [catImageUrlInput, setCatImageUrlInput] = React.useState("");
  const [catImagePreview, setCatImagePreview] = React.useState<string | null>(null);
  const [catAvailable, setCatAvailable] = React.useState(true);
  const [isUploadingCat, setIsUploadingCat] = React.useState(false);

  // --- Menu Item Form State ---
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [itemName, setItemName] = React.useState("");
  const [itemCategoryId, setItemCategoryId] = React.useState("");
  const [itemDescription, setItemDescription] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("");
  const [itemImageUrlInput, setItemImageUrlInput] = React.useState("");
  const [itemImageFile, setItemImageFile] = React.useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = React.useState<string | null>(null);
  const [itemVeg, setItemVeg] = React.useState(false);
  const [itemNonVeg, setItemNonVeg] = React.useState(false);
  const [itemEgg, setItemEgg] = React.useState(false);
  const [itemBestSeller, setItemBestSeller] = React.useState(false);
  const [itemAvailable, setItemAvailable] = React.useState(true);
  const [isUploadingItem, setIsUploadingItem] = React.useState(false);
  const [itemAddons, setItemAddons] = React.useState<{name: string, price: number}[]>([]);
  const [newAddonName, setNewAddonName] = React.useState("");
  const [newAddonPrice, setNewAddonPrice] = React.useState("");
  
  // --- Accordion State ---
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});
  const [fullyExpanded, setFullyExpanded] = React.useState<Record<string, boolean>>({});

  const isFormOpen = !!isAddingCategory || !!isAddingItem || !!editingCatId || !!editingItemId;

  const handleReorderCategories = async (newOrder: Category[]) => {
    setCategories(newOrder);
    try {
      const batch = writeBatch(db);
      newOrder.forEach((cat, index) => {
        batch.update(doc(db, "categories", cat.id), { sortOrder: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering categories:", error);
    }
  };

  const handleReorderItems = async (newOrder: MenuItem[], categoryId: string) => {
    setItems((prevItems) => {
      const otherItems = prevItems.filter((i) => i.categoryId !== categoryId);
      return [...otherItems, ...newOrder];
    });

    try {
      const batch = writeBatch(db);
      newOrder.forEach((item, index) => {
        batch.update(doc(db, "menuItems", item.id), { sortOrder: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering items:", error);
    }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const isNowExpanded = !prev[id];
      if (!isNowExpanded) {
        setFullyExpanded(f => ({ ...f, [id]: false }));
      }
      return { ...prev, [id]: isNowExpanded };
    });
  };

  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    type: 'category' | 'item';
    id: string;
    imageUrl?: string;
    title: string;
    message: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      const cats: Category[] = [];
      catSnap.forEach((doc) => cats.push({ id: doc.id, ...doc.data() } as Category));
      cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setCategories(cats);

      const itemSnap = await getDocs(collection(db, "menuItems"));
      const fetchedItems: MenuItem[] = [];
      itemSnap.forEach((doc) => fetchedItems.push({ id: doc.id, ...doc.data() } as MenuItem));
      fetchedItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCatImageFile(file);
      setCatImagePreview(URL.createObjectURL(file));
      setCatImageUrlInput("");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || (!catImageFile && !catImageUrlInput)) {
      alert("Please provide a name and an image.");
      return;
    }
    
    setIsUploadingCat(true);
    try {
      let finalImageUrl = catImageUrlInput;

      if (catImageFile && !catImageUrlInput) {
        const compressedFile = await imageCompression(catImageFile, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 800,
          useWebWorker: false,
        });

        const storageRef = ref(storage, `categories/${Date.now()}_${compressedFile.name}`);
        await withTimeout(uploadBytes(storageRef, compressedFile));
        finalImageUrl = await getDownloadURL(storageRef);
      }

      if (editingCatId) {
        await withTimeout(updateDoc(doc(db, "categories", editingCatId), {
          name: catName,
          imageUrl: finalImageUrl,
          isAvailable: catAvailable
        }));
      } else {
        await withTimeout(addDoc(collection(db, "categories"), {
          name: catName,
          imageUrl: finalImageUrl,
          isAvailable: catAvailable,
          sortOrder: categories.length
        }));
      }
      
      setCatName("");
      setCatImageFile(null);
      setCatImageUrlInput("");
      setCatImagePreview(null);
      setCatAvailable(true);
      setIsAddingCategory(false);
      setEditingCatId(null);
      fetchData();
    } catch (error) {
      console.error("Error saving category: ", error);
      alert("Failed to save. Make sure your internet is working.");
    } finally {
      setIsUploadingCat(false);
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatImageUrlInput(cat.imageUrl || "");
    setCatImagePreview(cat.imageUrl || null);
    setCatImageFile(null);
    setCatAvailable(cat.isAvailable !== false);
    setIsAddingCategory(true);
    setIsAddingItem(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategoryAvailability = async (e: React.MouseEvent, categoryId: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "categories", categoryId), {
        isAvailable: !currentStatus
      });
      fetchData();
    } catch (error) {
      console.error("Error updating category availability", error);
    }
  };

  const toggleItemAvailability = async (e: React.MouseEvent, itemId: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "menuItems", itemId), {
        isAvailable: !currentStatus
      });
      fetchData();
    } catch (error) {
      console.error("Error updating item availability", error);
    }
  };

  const confirmDeleteCategory = (id: string, imageUrl?: string) => {
    setDeleteConfirm({
      type: 'category',
      id,
      imageUrl,
      title: "Delete Category?",
      message: "Are you sure you want to delete this category? Menu items inside it will lose their category association."
    });
  };

  const executeDeleteCategory = async (id: string, imageUrl?: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (e) {
          console.log("Could not delete image from storage:", e);
        }
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  const handleItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setItemImageFile(file);
      setItemImagePreview(URL.createObjectURL(file));
      setItemImageUrlInput("");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemCategoryId) {
      alert("Please fill all required fields.");
      return;
    }
    
    setIsUploadingItem(true);
    try {
      let finalImageUrl = itemImageUrlInput;

      if (itemImageFile && !itemImageUrlInput) {
        const compressedFile = await imageCompression(itemImageFile, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 800,
          useWebWorker: false,
        });

        const storageRef = ref(storage, `menu/${Date.now()}_${compressedFile.name}`);
        await withTimeout(uploadBytes(storageRef, compressedFile));
        finalImageUrl = await getDownloadURL(storageRef);
      }

      if (editingItemId) {
        await withTimeout(updateDoc(doc(db, "menuItems", editingItemId), {
          name: itemName,
          categoryId: itemCategoryId,
          description: itemDescription,
          price: parseFloat(itemPrice),
          image: finalImageUrl,
          isVeg: itemVeg,
          isNonVeg: itemNonVeg,
          isEgg: itemEgg,
          isBestSeller: itemBestSeller,
          isAvailable: itemAvailable,
          addons: itemAddons
        }));
      } else {
        await withTimeout(addDoc(collection(db, "menuItems"), {
          name: itemName,
          categoryId: itemCategoryId,
          description: itemDescription,
          price: parseFloat(itemPrice),
          image: finalImageUrl,
          isVeg: itemVeg,
          isNonVeg: itemNonVeg,
          isEgg: itemEgg,
          isBestSeller: itemBestSeller,
          isAvailable: itemAvailable,
          sortOrder: items.filter(i => i.categoryId === itemCategoryId).length,
          addons: itemAddons
        }));
      }
      
      setItemName("");
      setItemCategoryId("");
      setItemDescription("");
      setItemPrice("");
      setItemImageUrlInput("");
      setItemImageFile(null);
      setItemImagePreview(null);
      setItemVeg(false);
      setItemNonVeg(false);
      setItemEgg(false);
      setItemBestSeller(false);
      setItemAvailable(true);
      setItemAddons([]);
      setIsAddingItem(false);
      setEditingItemId(null);
      
      fetchData();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save.");
    } finally {
      setIsUploadingItem(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCategoryId(item.categoryId);
    setItemDescription(item.description || "");
    setItemPrice(item.price.toString());
    setItemImageUrlInput(item.image || "");
    setItemImagePreview(item.image || null);
    setItemImageFile(null);
    setItemVeg(item.isVeg || false);
    setItemNonVeg(item.isNonVeg || false);
    setItemEgg(item.isEgg || false);
    setItemBestSeller(item.isBestSeller || false);
    setItemAvailable(item.isAvailable !== false);
    setItemAddons(item.addons || []);
    setIsAddingItem(true);
    setIsAddingCategory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDeleteItem = (id: string, imageUrl?: string) => {
    setDeleteConfirm({
      type: 'item',
      id,
      imageUrl,
      title: "Delete Menu Item?",
      message: "Are you sure you want to permanently delete this menu item?"
    });
  };

  const executeDeleteItem = async (id: string, imageUrl?: string) => {
    try {
      await deleteDoc(doc(db, "menuItems", id));
      if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (e) {
          console.log("Could not delete image from storage:", e);
        }
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const uncategorizedItems = items.filter(item => !categories.find(c => c.id === item.categoryId));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 items-start bg-secondary/30 p-4 rounded-3xl border border-border/50">
        <div>
          <h2 className="text-xl font-bold">Manage Catalog</h2>
          <p className="text-sm text-muted-foreground mt-1">Add new categories or items to your menu.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              setIsAddingCategory(!isAddingCategory);
              setIsAddingItem(false);
              if (!isAddingCategory) {
                setEditingCatId(null);
                setCatName("");
                setCatImageUrlInput("");
                setCatImagePreview(null);
                setCatImageFile(null);
                setCatAvailable(true);
              }
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5 shrink-0" />
            Add Category
          </button>
          <button 
            onClick={() => {
              setIsAddingItem(!isAddingItem);
              setIsAddingCategory(false);
              if (!isAddingItem) {
                setEditingItemId(null);
                setItemName("");
                setItemCategoryId(categories.length > 0 ? categories[0].id : "");
                setItemDescription("");
                setItemPrice("");
                setItemImageUrlInput("");
                setItemImagePreview(null);
                setItemImageFile(null);
                setItemVeg(false);
                setItemBestSeller(false);
                setItemAvailable(true);
                setItemAddons([]);
                setNewAddonName("");
                setNewAddonPrice("");
              }
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
          >
            <Plus className="h-5 w-5 shrink-0" />
            Add Item
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingCategory && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="glass-card p-6 rounded-3xl overflow-hidden border-2 border-primary/20"
          >
            <h3 className="text-lg font-bold mb-4">{editingCatId ? "Edit Category" : "Add New Category"}</h3>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Category Image</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-2xl cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors relative overflow-hidden">
                    {catImagePreview ? (
                      <img src={catImagePreview} alt="Preview" className="object-contain w-full h-full p-2" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">Click to upload image</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleCatImageChange} />
                  </label>
                </div>
                <div className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest my-2">OR</div>
                <input 
                  type="url" 
                  value={catImageUrlInput}
                  onChange={(e) => {
                    setCatImageUrlInput(e.target.value);
                    setCatImageFile(null);
                    setCatImagePreview(e.target.value);
                  }}
                  placeholder="Paste Image URL directly"
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Category Name</label>
                <input 
                  type="text" 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Burgers, Drinks"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => { setIsAddingCategory(false); setEditingCatId(null); }} className="px-6 py-2 rounded-xl font-bold text-muted-foreground hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={isUploadingCat} className="px-6 py-2 rounded-xl font-bold bg-primary text-black flex items-center gap-2">
                  {isUploadingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingCatId ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isAddingItem && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="glass-card p-6 rounded-3xl overflow-hidden border-2 border-primary/20"
          >
            <h3 className="text-lg font-bold mb-4">{editingItemId ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 col-span-1">
                  <label className="text-sm font-bold">Item Image</label>
                  <div className="flex flex-col items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full aspect-square max-h-64 border-2 border-border border-dashed rounded-3xl cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors relative overflow-hidden mb-4 shadow-sm">
                      {itemImagePreview ? (
                        <img src={itemImagePreview} alt="Preview" className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground font-semibold">Upload Image</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleItemImageChange} />
                    </label>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">OR</div>
                    <input 
                      type="url" 
                      value={itemImageUrlInput}
                      onChange={(e) => {
                        setItemImageUrlInput(e.target.value);
                        setItemImageFile(null);
                        setItemImagePreview(e.target.value);
                      }}
                      placeholder="Paste Image URL"
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-5 col-span-1 md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Item Name</label>
                    <input 
                      type="text" 
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Classic Burger"
                      required
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Price (₹)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        placeholder="99.00"
                        required
                        className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Category</label>
                      <CustomSelect 
                        value={itemCategoryId}
                        onChange={(val) => setItemCategoryId(val)}
                        options={categories}
                        placeholder="Select Category"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold">Description</label>
                    <textarea 
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Describe the item..."
                      className="w-full h-24 p-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-sm font-bold block">Add-Ons</label>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAddonName}
                        onChange={(e) => setNewAddonName(e.target.value)}
                        placeholder="Add-on Name (e.g. Extra Cheese)"
                        className="flex-1 h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 outline-none text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newAddonPrice}
                        onChange={(e) => setNewAddonPrice(e.target.value)}
                        placeholder="Price (₹)"
                        className="w-24 h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAddonName.trim() && newAddonPrice) {
                            setItemAddons([...itemAddons, { name: newAddonName.trim(), price: parseFloat(newAddonPrice) }]);
                            setNewAddonName("");
                            setNewAddonPrice("");
                          }
                        }}
                        className="px-5 py-2 bg-primary text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    {itemAddons.length > 0 && (
                      <div className="space-y-2">
                        {itemAddons.map((addon, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-secondary/30 p-3 rounded-xl border border-border/50">
                            <span className="text-sm font-medium">{addon.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold">₹{addon.price.toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={() => setItemAddons(itemAddons.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => { 
                        if (itemVeg) setItemVeg(false); 
                        else { setItemVeg(true); setItemNonVeg(false); setItemEgg(false); }
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 ${itemVeg ? 'bg-green-100 text-green-700 border-green-500 shadow-sm' : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/80'}`}
                    >
                      <div className={`h-3.5 w-3.5 border flex items-center justify-center p-[2px] ${itemVeg ? 'border-green-600 bg-green-100' : 'border-muted-foreground bg-transparent'}`}>
                        <div className={`h-full w-full ${itemVeg ? 'bg-green-600' : 'bg-transparent'}`}></div>
                      </div>
                      Veg
                    </button>

                    <button
                      type="button"
                      onClick={() => { 
                        if (itemNonVeg) setItemNonVeg(false); 
                        else { setItemNonVeg(true); setItemVeg(false); setItemEgg(false); }
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 ${itemNonVeg ? 'bg-red-100 text-red-700 border-red-500 shadow-sm' : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/80'}`}
                    >
                      <div className={`h-3.5 w-3.5 border flex items-center justify-center p-[2px] ${itemNonVeg ? 'border-red-600 bg-red-100' : 'border-muted-foreground bg-transparent'}`}>
                        <div className={`h-full w-full ${itemNonVeg ? 'bg-red-600' : 'bg-transparent'}`}></div>
                      </div>
                      Non-Veg
                    </button>

                    <button
                      type="button"
                      onClick={() => { 
                        if (itemEgg) setItemEgg(false); 
                        else { setItemEgg(true); setItemVeg(false); setItemNonVeg(false); }
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 ${itemEgg ? 'bg-yellow-100 text-yellow-700 border-yellow-500 shadow-sm' : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/80'}`}
                    >
                      <div className={`h-3.5 w-3.5 border flex items-center justify-center p-[2px] ${itemEgg ? 'border-yellow-600 bg-yellow-100' : 'border-muted-foreground bg-transparent'}`}>
                        <div className={`h-full w-full ${itemEgg ? 'bg-yellow-600' : 'bg-transparent'}`}></div>
                      </div>
                      Egg
                    </button>

                    <div className="h-8 w-px bg-border hidden sm:block mx-1"></div>

                    <button
                      type="button"
                      onClick={() => setItemBestSeller(!itemBestSeller)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 ${itemBestSeller ? 'bg-primary/10 text-primary-foreground border-primary shadow-sm' : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/80'}`}
                    >
                      <span className="text-base leading-none">⭐</span> Best Seller
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => { setIsAddingItem(false); setEditingItemId(null); }} className="px-6 py-2 rounded-xl font-bold text-muted-foreground hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={isUploadingItem} className="px-6 py-2 rounded-xl font-bold bg-primary text-black flex items-center gap-2">
                  {isUploadingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingItemId ? "Update Item" : "Save Menu Item"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          Loading catalog...
        </div>
      ) : (
        <div className="space-y-12 pt-4">
          <Reorder.Group 
            axis="y" 
            values={categories} 
            onReorder={handleReorderCategories} 
            className="space-y-12"
          >
            {categories
              .filter((category) => category.id !== editingCatId)
              .map((category, index) => {
            const categoryItems = items.filter(item => item.categoryId === category.id && item.id !== editingItemId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const isExpanded = !!expandedCategories[category.id];
            
            return (
              <Reorder.Item 
                key={category.id} 
                value={category}
                className="space-y-4 bg-background border border-border rounded-3xl shadow-sm relative"
                dragListener={!isFormOpen}
                style={{ zIndex: categories.length - index }}
              >
                <div 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between bg-secondary/20 p-3 sm:p-4 transition-colors ${isExpanded ? 'rounded-t-3xl' : 'rounded-3xl'} gap-3 sm:gap-2`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 w-full">
                    <div className="cursor-grab hover:bg-secondary p-1 rounded transition-colors active:cursor-grabbing mt-1 sm:mt-0" style={{ pointerEvents: 'auto' }}>
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="relative h-12 w-12 bg-secondary rounded-xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                      {category.imageUrl ? (
                        <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                      <h3 className="text-lg sm:text-xl font-black break-words leading-tight">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{categoryItems.length} items</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0 ml-12 sm:ml-2">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleCategoryAvailability(e, category.id, category.isAvailable !== false)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${category.isAvailable !== false ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${category.isAvailable !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 bg-background/50 rounded-full p-1 border border-border/50">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDeleteCategory(category.id, category.imageUrl); }}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="h-6 w-px bg-border mx-1"></div>
                      <div className="pr-1 pl-0.5 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : ""}`} />
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onAnimationComplete={() => setFullyExpanded(prev => ({ ...prev, [category.id]: true }))}
                    >
                      <div className="p-4 pt-0">
                        {categoryItems.length > 0 ? (
                          <Reorder.Group 
                            axis="y" 
                            values={categoryItems} 
                            onReorder={(newOrder) => handleReorderItems(newOrder, category.id)}
                            className="grid grid-cols-1 gap-4"
                          >
                            {categoryItems.map((item, index) => (
                              <Reorder.Item 
                                key={item.id} 
                                value={item}
                                className="glass-card p-4 rounded-2xl flex gap-4 group border border-border/50 relative"
                                dragListener={!isFormOpen}
                                style={{ zIndex: categoryItems.length - index }}
                              >
                                <div className="cursor-grab self-center hover:bg-secondary p-1 rounded transition-colors active:cursor-grabbing mr-1">
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="relative h-20 w-20 bg-secondary rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                  {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                                  )}
                                  {item.isVeg && (
                                    <div className="absolute top-1 right-1 h-3 w-3 bg-green-500 rounded-full border border-white shadow-sm" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                  <div>
                                    <h3 className="font-bold text-base leading-tight break-words">{item.name}</h3>
                                    {item.isAvailable === false && (
                                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block">Sold Out</span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                                    <span className="font-black text-primary">₹{item.price}</span>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          onClick={(e) => toggleItemAvailability(e, item.id, item.isAvailable !== false)}
                                          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${item.isAvailable !== false ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        >
                                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.isAvailable !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-1 -mr-2">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors"
                                          title="Edit Item"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); confirmDeleteItem(item.id, item.image); }}
                                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                          title="Delete Item"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                            No items in this category.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
          </Reorder.Group>

          {categories.filter(c => c.id !== editingCatId).length === 0 && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
              No categories found. Click "Add Category" to create one.
            </div>
          )}

          {/* Uncategorized Items */}
          {uncategorizedItems.filter(item => item.id !== editingItemId).length > 0 && (
            <div className="space-y-4 pt-8 border-t border-border">
              <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <h3 className="text-xl font-black text-red-500">Uncategorized Items</h3>
                <p className="text-sm text-red-500">{uncategorizedItems.filter(item => item.id !== editingItemId).length} items</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-red-500/30 ml-4 relative z-0">
                {uncategorizedItems.filter(item => item.id !== editingItemId).map((item, index) => (
                  <div 
                    key={item.id} 
                    className="glass-card p-4 rounded-2xl flex gap-4 group border border-red-500/20 relative"
                    style={{ zIndex: uncategorizedItems.length - index }}
                  >
                    <div className="relative h-20 w-20 bg-secondary rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-base leading-tight break-words">{item.name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                        <span className="font-black text-primary">₹{item.price}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => toggleItemAvailability(e, item.id, item.isAvailable !== false)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${item.isAvailable !== false ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.isAvailable !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1 -mr-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors"
                              title="Edit Item"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); confirmDeleteItem(item.id, item.image); }}
                              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border"
            >
              <h3 className="text-xl font-black text-foreground mb-2">{deleteConfirm.title}</h3>
              <p className="text-muted-foreground mb-8 text-sm">{deleteConfirm.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'category') {
                      executeDeleteCategory(deleteConfirm.id, deleteConfirm.imageUrl);
                    } else {
                      executeDeleteItem(deleteConfirm.id, deleteConfirm.imageUrl);
                    }
                    setDeleteConfirm(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add a Check icon component if not imported from lucide-react above
function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CustomSelect({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: {id: string, name: string}[], placeholder: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 rounded-xl bg-background border ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-border'} hover:border-primary/50 outline-none flex items-center justify-between transition-all`}
      >
        <span className={selectedOption ? "text-foreground font-bold" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto hide-scrollbar origin-top"
          >
            {options.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-0 ${value === opt.id ? "bg-primary/10 text-primary font-bold" : "text-foreground font-medium"}`}
              >
                {opt.name}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-muted-foreground text-sm italic">No categories available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionMenu({ onEdit, onDelete, size = "default" }: { onEdit: () => void, onDelete: () => void, size?: "default" | "small" }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonClass = size === "small" 
    ? "h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    : "h-10 w-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors";
  
  const iconClass = size === "small" ? "h-4 w-4 text-muted-foreground" : "h-5 w-5 text-muted-foreground";

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={buttonClass}
      >
        <MoreVertical className={iconClass} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary transition-colors text-foreground font-medium border-b border-border/50"
            >
              <Edit2 className="h-4 w-4 text-blue-500" /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-500/10 transition-colors text-red-500 font-medium"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
