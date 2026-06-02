import type {Metadata, Viewport} from "next";
import '../styles/index.scss';
import {getMainMenu} from "@/services/Settings";
import AppShell from "@/theme/layouts/AppShell";
import {createMetadata} from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    path: "/",
    image: "/img/hero/hero-product-1.webp",
  }),
  icons: {
    icon: [
      {url: "/img/favicon.svg", type: "image/svg+xml"},
    ],
    shortcut: "/img/favicon.svg",
    apple: "/img/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  const menu = await getMainMenu();

  return (
      <html lang="ru">
      <body>
      <AppShell menu={menu}>
        {children}
      </AppShell>
      </body>
      </html>
  );
}
