"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Tags, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  List,
  Menu,
  X
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Banners", href: "/dashboard/banners", icon: ImageIcon },
  { name: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Close sidebar on mobile when navigating
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-end px-4">
        {/* Centered Logo */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-32 flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="Bros & Bitez" 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            priority
          />
        </Link>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-foreground hover:bg-secondary rounded-lg transition-colors relative z-10"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <Link href="/" className="relative h-14 w-40 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="Bros & Bitez" 
              fill 
              sizes="160px"
              className="object-contain scale-110"
              priority
            />
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-muted-foreground hover:bg-secondary rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-primary text-black font-semibold" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
