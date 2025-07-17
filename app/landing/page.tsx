import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Users, 
  CreditCard, 
  Smartphone,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'KasirKu - Sistem Kasir Modern & POS Terbaik Indonesia',
  description: 'Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia. Kelola inventori, laporan penjualan, dan transaksi dengan mudah. Gratis dan mudah digunakan!',
  alternates: {
    canonical: 'https://kasirku.vercel.app/landing',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">KasirKu</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Masuk</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Daftar Gratis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            🚀 Sistem Kasir #1 di Indonesia
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistem Kasir Modern untuk <span className="text-blue-600">UMKM Indonesia</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Kelola toko, warung, dan bisnis retail Anda dengan mudah. Sistem POS lengkap dengan 
            manajemen inventori, laporan penjualan, dan transaksi real-time. 100% gratis untuk memulai!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Lihat Fitur Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Fitur Lengkap untuk Bisnis Anda
          </h3>
          <p className="text-xl text-gray-600">
            Semua yang Anda butuhkan untuk mengelola bisnis retail modern
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <CardTitle>Transaksi Cepat</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Proses transaksi penjualan dengan cepat dan mudah. Interface yang intuitif 
                untuk kasir yang efisien.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-green-600" />
                <CardTitle>Manajemen Inventori</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kelola stok barang, kategori produk, dan pantau ketersediaan secara real-time. 
                Tidak ada lagi kehabisan stok mendadak.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <CardTitle>Laporan Penjualan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analisis penjualan mendalam dengan grafik dan laporan yang mudah dipahami. 
                Buat keputusan bisnis yang lebih baik.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-8 w-8 text-orange-600" />
                <CardTitle>Responsive Mobile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Akses dari mana saja dengan smartphone atau tablet. Desain responsive 
                untuk pengalaman optimal di semua perangkat.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-red-600" />
                <CardTitle>Multi Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Terima pembayaran tunai, kartu, transfer, dan e-wallet. Fleksibilitas 
                pembayaran untuk kepuasan pelanggan.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-teal-600" />
                <CardTitle>Manajemen Pelanggan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simpan data pelanggan, riwayat pembelian, dan program loyalitas. 
                Tingkatkan retensi pelanggan dengan mudah.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Memilih KasirKu?
            </h3>
            <p className="text-xl text-gray-600">
              Trusted by 1000+ UMKM di seluruh Indonesia
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">100% Gratis</h4>
              <p className="text-gray-600">Mulai tanpa biaya setup atau langganan bulanan</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Mobile First</h4>
              <p className="text-gray-600">Optimized untuk smartphone dan tablet</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Real-time Analytics</h4>
              <p className="text-gray-600">Laporan penjualan dan inventori secara real-time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Support 24/7</h4>
              <p className="text-gray-600">Tim support siap membantu kapan saja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Apa Kata Pengguna Kami?
          </h3>
          <div className="flex items-center justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-lg font-semibold">4.8/5 dari 150+ review</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "KasirKu sangat membantu mengelola warung saya. Sekarang saya bisa pantau 
                penjualan dan stok dengan mudah dari HP!"
              </blockquote>
              <cite className="font-semibold">- Ibu Sari, Warung Nasi Gudeg</cite>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "Interface yang simple dan mudah dipahami. Karyawan baru bisa langsung 
                menggunakan tanpa training lama."
              </blockquote>
              <cite className="font-semibold">- Pak Budi, Toko Kelontong</cite>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "Laporan penjualan yang detail membantu saya membuat keputusan bisnis 
                yang lebih baik. Recommended!"
              </blockquote>
              <cite className="font-semibold">- Rina, Butik Fashion</cite>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Siap Mengembangkan Bisnis Anda?
          </h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan UMKM yang sudah merasakan kemudahan KasirKu. 
            Daftar gratis dan mulai kelola bisnis Anda hari ini juga!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="h-8 w-8 text-blue-400" />
                <h4 className="text-xl font-bold">KasirKu</h4>
              </div>
              <p className="text-gray-400">
                Sistem kasir modern untuk UMKM Indonesia. Kelola bisnis Anda dengan mudah dan efisien.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Produk</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Harga</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrasi</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Dukungan</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Bantuan</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontak</Link></li>
                <li><Link href="/docs" className="hover:text-white">Dokumentasi</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Perusahaan</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">Tentang Kami</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KasirKu. All rights reserved. Made with ❤️ for Indonesian SMEs.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
