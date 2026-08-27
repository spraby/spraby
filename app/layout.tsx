import type {Metadata, Viewport} from "next";
import '../styles/index.scss';
import {getMainMenu} from "@/services/Settings";
import AppShell from "@/theme/layouts/AppShell";
import {createMetadata} from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    path: "/",
    image: "/spraby-preview.png",
    imageAlt: "Логотип spraby",
    imageWidth: 512,
    imageHeight: 512,
    imageType: "image/png",
  }),
  icons: {
    icon: [
      {url: "/favicon-16x16.png", sizes: "16x16", type: "image/png"},
      {url: "/favicon-32x32.png", sizes: "32x32", type: "image/png"},
      {url: "/favicon-48x48.png", sizes: "48x48", type: "image/png"},
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
