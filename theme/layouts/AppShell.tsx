'use client'

import {usePathname} from "next/navigation";
import {ReactNode, useEffect} from "react";
import ThemeLayout from "@/theme/layouts/ThemeLayout";
import {MenuItem} from "@/types";

const AUTH_PATHS = new Set(["/login", "/register"]);

export default function AppShell({children, menu}: { children: ReactNode, menu: MenuItem[] }) {
  const pathname = usePathname();
  const isAuth = pathname ? AUTH_PATHS.has(pathname) : false;

  // Скроллим вверх при каждой смене маршрута
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">{children}</div>
      </div>
    );
  }

  return <ThemeLayout menu={menu}>{children}</ThemeLayout>;
}
