import type {Metadata, Viewport} from "next";
import '../styles/index.scss';
import {getMainMenu} from "@/services/Settings";
import AppShell from "@/theme/layouts/AppShell";
import {SITE_DESCRIPTION, SITE_URL} from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "spraby",
  title: "spraby",
  description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "spraby",
    description: SITE_DESCRIPTION,
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
