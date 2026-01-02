'use client'

import {ReactNode} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";
import LayoutFooter from "@/theme/sections/LayoutFooter";
import {MenuItem} from "@/types";
import {FavoritesProvider} from "@/theme/hooks/useFavorites";
import {CartProvider} from "@/theme/hooks/useCart";

export default function ({children, menu}: { children: ReactNode, menu: MenuItem[] }) {
  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <LayoutHeader menu={menu}/>
          <main className="flex-1">
            {children}
          </main>
          <LayoutFooter menu={menu}/>
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
}
