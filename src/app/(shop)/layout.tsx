import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ShopStatusGuard } from "@/components/shop/shop-status-guard";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopStatusGuard>
      <div className="relative min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="mx-auto max-w-md md:max-w-3xl flex-1 w-full">
          {children}
        </main>
        <BottomNav />
      </div>
    </ShopStatusGuard>
  );
}
