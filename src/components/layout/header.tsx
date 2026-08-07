"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-20 max-w-md items-center justify-center px-4 md:max-w-3xl">
        <Link href="/" className="relative h-16 w-48 flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="Bros & Bitez Logo" 
            fill 
            sizes="192px"
            className="object-contain scale-110"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
