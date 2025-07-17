import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Blog KasirKu - Tips dan Panduan Bisnis UMKM',
  description: 'Dapatkan tips bisnis, panduan menggunakan sistem kasir, dan strategi meningkatkan penjualan untuk UMKM Indonesia',
  keywords: [
    'blog bisnis',
    'tips UMKM',
    'panduan kasir',
    'strategi penjualan',
    'manajemen toko',
    'bisnis retail',
  ],
  canonical: 'https://kasirku.vercel.app/blog',
})

const blogPosts = [
  {
    id: 1,
    title: '10 Tips Meningkatkan Penjualan Toko dengan Sistem Kasir Modern',
    excerpt: 'Pelajari cara mengoptimalkan penjualan toko Anda dengan menggunakan sistem kasir modern yang tepat.',
    content: 'Dalam era digital ini, sistem kasir modern bukan hanya alat untuk mencatat transaksi...',
    author: 'Tim KasirKu',
    date: '2024-01-15',
    readTime: '5 menit',
    category: 'Tips Bisnis',
    tags: ['penjualan', 'sistem kasir', 'tips bisnis'],
    image: '/blog/tips-penjualan.jpg',
  },
  {
    id: 2,
    title: 'Panduan Lengkap Manajemen Inventori untuk UMKM',
    excerpt: 'Kelola stok barang dengan efisien menggunakan sistem inventori yang tepat untuk bisnis kecil.',
    content: 'Manajemen inventori yang baik adalah kunci sukses bisnis retail...',
    author: 'Sari Dewi',
    date: '2024-01-10',
    readTime: '8 menit',
    category: 'Panduan',
    tags: ['inventori', 'manajemen', 'stok'],
    image: '/blog/manajemen-inventori.jpg',
  },
  {
    id: 3,
    title: 'Cara Membaca Laporan Penjualan untuk Mengembangkan Bisnis',
    excerpt: 'Analisis laporan penjualan dengan benar untuk membuat keputusan bisnis yang lebih baik.',
    content: 'Laporan penjualan adalah salah satu aset terpenting untuk mengembangkan bisnis...',
    author: 'Budi Santoso',
    date: '2024-01-05',
    readTime: '6 menit',
    category: 'Analisis',
    tags: ['laporan', 'analisis', 'bisnis'],
    image: '/blog/laporan-penjualan.jpg',
  },
  {
    id: 4,
    title: 'Strategi Promosi Efektif untuk Toko Online dan Offline',
    excerpt: 'Tingkatkan awareness brand dan penjualan dengan strategi promosi yang tepat sasaran.',
    content: 'Promosi yang efektif membutuhkan pemahaman mendalam tentang target market...',
    author: 'Rina Fitria',
    date: '2024-01-01',
    readTime: '7 menit',
    category: 'Marketing',
    tags: ['promosi', 'marketing', 'strategi'],
    image: '/blog/strategi-promosi.jpg',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog KasirKu
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tips, panduan, dan strategi bisnis untuk mengembangkan UMKM Anda
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Artikel Unggulan</h2>
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="h-48 md:h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-xl font-semibold mb-2">Featured Article</h3>
                    <p className="text-sm opacity-90">Coming Soon</p>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{blogPosts[0].category}</Badge>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(blogPosts[0].date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{blogPosts[0].author}</span>
                  </div>
                  <Link href={`/blog/${blogPosts[0].id}`}>
                    <Button>
                      Baca Selengkapnya
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Artikel Terbaru</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-lg font-semibold mb-2">{post.category}</h3>
                    <p className="text-sm opacity-90">Article Image</p>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('id-ID', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`} className="mt-4 block">
                    <Button variant="outline" size="sm" className="w-full">
                      Baca Artikel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Kategori</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Tips Bisnis', 'Panduan', 'Analisis', 'Marketing'].map((category) => (
              <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {blogPosts.filter(post => post.category === category).length} artikel
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Dapatkan Tips Bisnis Terbaru
          </h3>
          <p className="text-blue-100 mb-6">
            Berlangganan newsletter kami untuk mendapatkan artikel terbaru langsung di inbox Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <Button variant="secondary">
              Berlangganan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
