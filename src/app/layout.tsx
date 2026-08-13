import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Bros & Bitez",
    default: "Bros & Bitez | Premium Digital Menu",
  },
  description: "Explore the delicious menu at Bros & Bitez. Discover our premium burgers, fast food, and more.",
  keywords: ["Bros & Bitez", "restaurant", "menu", "fast food", "burgers", "order online", "digital menu"],
  authors: [{ name: "Bros & Bitez" }],
  openGraph: {
    title: "Bros & Bitez | Premium Digital Menu",
    description: "Explore the delicious menu at Bros & Bitez. Discover our premium burgers, fast food, and more.",
    url: "https://brosandbitez.vercel.app", // Updated to your Vercel domain
    siteName: "Bros & Bitez",
    images: [
      {
        url: "/og-image.jpg", // Ensure you add an og-image.jpg to your public folder
        width: 1200,
        height: 630,
        alt: "Bros & Bitez",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bros & Bitez | Premium Digital Menu",
    description: "Explore the delicious menu at Bros & Bitez. Discover our premium burgers, fast food, and more.",
    images: ["/og-image.jpg"], // Ensure you add an og-image.jpg to your public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
