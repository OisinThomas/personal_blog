import siteMetadata from "@/lib/siteMetaData";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import Header from "@/components/Header";
import { ThemeProvider } from "@/lib/ThemeContext";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    template: `%s | ${siteMetadata.title}`,
    default: siteMetadata.title, // a default is required when creating a template
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    locale: "en_IE",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    images: [siteMetadata.socialBanner],
  },
  alternates: {
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>{/* PostHog analytics is handled via the PostHogProvider */}</head>
      <body
        className={clsx(
          inter.className,
          "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 h-full overflow-hidden flex flex-col"
        )}
      >
        <ThemeProvider>
          <div className="flex flex-col h-full overflow-y-auto overscroll-none">
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <CookieConsent />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
