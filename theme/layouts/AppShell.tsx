'use client'

import {usePathname} from "next/navigation";
import {ReactNode, useEffect} from "react";
import ThemeLayout from "@/theme/layouts/ThemeLayout";
import {MenuItem} from "@/types";

const AUTH_PATHS = new Set(["/register"]);

export default function AppShell({children, menu}: { children: ReactNode, menu: MenuItem[] }) {
  const pathname = usePathname();
  const isAuth = pathname ? AUTH_PATHS.has(pathname) : false;

  // Скроллим вверх при каждой смене маршрута
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isAuth) {
    return (
      <main className="auth-bg flex min-h-screen min-h-[100svh] items-start justify-center sm:items-center">
        {children}
      </main>
    );
  }

  return <ThemeLayout menu={menu}>{children}</ThemeLayout>;
}
