import siteMetadata from "@/utils/siteMetaData"
import { Montserrat } from 'next/font/google'
import './globals.css'
import { cx } from "@/utils"
import Header from "@/components/Header"
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', variable: "--font-ms" })

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
    images: [siteMetadata.socialBanner],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA}`}></script>
        <script dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.GA}');`
        }}></script>
      </head>
      <body
        className={cx(montserrat.variable, "font-ms bg-light dark:bg-dark")}
      >
        <Header />
        {children}</body>
    </html>
  )
}
