import type {Metadata, Viewport} from "next";
import '../styles/index.scss';
import {getMainMenu} from "@/services/Settings";
import AppShell from "@/theme/layouts/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spra.by";
const siteDescription = "spraby — маркетплейс изделий ручной работы от мастеров и ремесленников.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "spraby",
  title: "spraby",
  description: siteDescription,
  icons: {
    icon: [
      {url: "/img/favicon.svg", type: "image/svg+xml", sizes: "any"},
    ],
    shortcut: "/img/favicon.svg",
    apple: "/img/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ru_BY",
    url: "/",
    siteName: "spraby",
    title: "spraby",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "spraby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "spraby",
    description: siteDescription,
    images: ["/opengraph-image"],
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
