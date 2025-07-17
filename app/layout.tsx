import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { StructuredData } from "@/components/structured-data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://kasirku.vercel.app'), // Ganti dengan URL sebenarnya
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
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='8' cy='21' r='1'/><circle cx='19' cy='21' r='1'/><path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'/></svg>",
        type: "image/svg+xml",
      },
    ],
    apple: {
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='8' cy='21' r='1'/><circle cx='19' cy='21' r='1'/><path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'/></svg>",
      type: "image/svg+xml",
    },
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
  viewport: "width=device-width, initial-scale=1",
  verification: {
    google: "your-google-site-verification-code", // Ganti dengan kode verifikasi Google
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
