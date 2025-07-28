import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { StructuredData } from "@/components/structured-data"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export const metadata: Metadata = {
  metadataBase: new URL('https://kasirku.vercel.app'),
  title: {
    default: "KasirKu - Sistem Kasir Modern & POS Terbaik Indonesia",
    template: "%s | KasirKu"
  },
  description: "Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia. Kelola inventori, laporan penjualan, dan transaksi dengan mudah. Gratis dan mudah digunakan!",
  keywords: [
    "sistem kasir",
    "POS system",
    "kasir online",
    "aplikasi kasir",
    "sistem point of sale",
    "kasir UMKM",
    "software kasir",
    "aplikasi toko",
    "manajemen inventori",
    "laporan penjualan",
    "kasir modern",
    "POS Indonesia",
    "sistem kasir gratis",
    "software toko",
    "aplikasi retail"
  ],
  authors: [{ name: "KasirKu Team" }],
  creator: "KasirKu Team",
  publisher: "KasirKu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://kasirku.vercel.app",
    title: "KasirKu - Sistem Kasir Modern & POS Terbaik Indonesia",
    description: "Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia. Kelola inventori, laporan penjualan, dan transaksi dengan mudah.",
    siteName: "KasirKu",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KasirKu - Sistem Kasir Modern",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KasirKu - Sistem Kasir Modern & POS Terbaik Indonesia",
    description: "Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia. Kelola inventori, laporan penjualan, dan transaksi dengan mudah.",
    images: ["/og-image.jpg"],
    creator: "@kasirku_id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://kasirku.vercel.app",
  },
  category: "Business Software",
  classification: "Point of Sale System",
  verification: {
    google: "RKxExUFleKxlkxcbzflJeBQnutyED5euDy_fX4xtirE",
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
