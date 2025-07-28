import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, ShoppingCart } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-16 w-16 text-gray-400" />
          </div>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription className="text-xl">Halaman Tidak Ditemukan</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Halaman yang Anda cari tidak ditemukan. Mungkin halaman tersebut telah dipindahkan atau dihapus.
          </p>
          <div className="space-y-2">
            <Link href="/" className="block">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buka Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
