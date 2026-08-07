"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, ArrowRight, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  
  const [whatsappNumber, setWhatsappNumber] = React.useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [addressHouse, setAddressHouse] = React.useState("");
  const [addressStreet, setAddressStreet] = React.useState("");
  const [addressArea, setAddressArea] = React.useState("");

  const isFormValid = customerName.trim() !== "" && customerPhone.trim() !== "" && addressHouse.trim() !== "" && addressStreet.trim() !== "" && addressArea.trim() !== "";

  React.useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const contactRef = doc(db, "settings", "contact");
        const docSnap = await getDoc(contactRef);
        if (docSnap.exists() && docSnap.data().whatsappNumber) {
          setWhatsappNumber(docSnap.data().whatsappNumber);
        }
      } catch (error) {
        console.error("Failed to fetch WhatsApp number", error);
      }
    };
    fetchWhatsAppNumber();
  }, []);

  const handleWhatsAppCheckout = async () => {
    if (!whatsappNumber) {
      alert("Restaurant hasn't configured a WhatsApp number yet. Please contact them directly.");
      return;
    }

    // Open tab immediately to bypass async popup blockers
    const checkoutTab = window.open("about:blank", "_blank");
    if (!checkoutTab) {
      alert("Please allow popups for this site to continue to WhatsApp.");
      return;
    }

    setIsCheckingOut(true);
    let orderText = `*New Order - Bros & Bitez* 🍔\n\n`;
    
    orderText += `*Customer Details:*\n`;
    orderText += `Name: ${customerName}\n`;
    orderText += `Phone: ${customerPhone}\n`;
    orderText += `Address:\n${addressHouse}\n${addressStreet}\n${addressArea}\n\n`;

    orderText += `*Order Items:*\n`;
    items.forEach((item) => {
      orderText += `${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    orderText += `\n*Total: ₹${totalPrice.toFixed(2)}*`;
    
    // Clean up the number by removing spaces, plus signs, etc for the wa.me link
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    
    // Redirect the newly opened tab to WhatsApp and clear cart
    checkoutTab.location.href = whatsappUrl;
    clearCart();
    setIsCheckingOut(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any delicious items yet!</p>
        <Link 
          href="/"
          className="h-14 px-8 bg-primary text-black font-bold text-lg rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2"
        >
          Browse Menu <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Your Order</h1>
          <p className="text-muted-foreground text-sm">Review your selected items.</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 rounded-3xl flex gap-4 items-center"
          >
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 bg-secondary">
              <Image 
                src={item.imageUrl} 
                alt={item.name} 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between h-full py-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold leading-tight line-clamp-2">{item.name}</h3>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 bg-red-500/10 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="font-black text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                
                <div className="flex items-center gap-3 bg-secondary rounded-full px-1 py-1 h-9">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-7 w-7 rounded-full bg-background flex items-center justify-center shadow-sm font-bold hover:bg-primary hover:text-black transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold min-w-[12px] text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 rounded-full bg-background flex items-center justify-center shadow-sm font-bold hover:bg-primary hover:text-black transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 glass-card p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-lg mb-2">Delivery Details</h3>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Your Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input 
            type="tel" 
            placeholder="Phone Number *"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input 
            type="text" 
            placeholder="House / Flat / Floor *"
            value={addressHouse}
            onChange={(e) => setAddressHouse(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input 
            type="text" 
            placeholder="Building / Street *"
            value={addressStreet}
            onChange={(e) => setAddressStreet(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input 
            type="text" 
            placeholder="Area / Locality *"
            value={addressArea}
            onChange={(e) => setAddressArea(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="mt-8 glass-card p-6 rounded-3xl space-y-4 mb-[4.5rem]">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">₹{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Taxes</span>
          <span className="font-medium text-foreground">Calculated by restaurant</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground border-b border-border/50 pb-4 pt-4">
          <span>Delivery Fee</span>
          <span className="font-medium text-foreground text-right text-sm">Added extra based on distance</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold">Total</span>
            <span className="text-xs text-muted-foreground font-medium">+ Delivery fee will be added extra</span>
          </div>
          <span className="text-2xl font-black text-primary">₹{totalPrice.toFixed(2)}</span>
        </div>
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
          <p className="text-sm font-medium text-foreground text-center">
            <span className="text-primary font-bold">Important Note:</span> For lightning-fast preparation, please give us a quick call to confirm after sending your order via WhatsApp!
          </p>
          <p className="text-sm font-medium text-muted-foreground text-center mt-2">
            *Please note: The total shown above does not include delivery charges. Your final grand total will be provided upon confirmation.
          </p>
        </div>
      </div>

      {/* Checkout Button - Fixed Bottom */}
      <div className="fixed bottom-[4.5rem] md:bottom-6 left-0 right-0 px-4 z-40">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleWhatsAppCheckout}
            disabled={isCheckingOut || !isFormValid}
            className="w-full h-14 bg-[#25D366] text-white font-bold text-lg rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <MessageCircle className="h-6 w-6" />
            {isCheckingOut ? "Connecting..." : !isFormValid ? "Fill Details to Order" : "Send Order to WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
