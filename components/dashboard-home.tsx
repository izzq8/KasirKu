"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, TrendingUp, DollarSign, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface DashboardHomeProps {
  user: User
  transactions?: any[]
  products?: any[]
  onNavigate?: (tab: string) => void
}

export function DashboardHome({ user, transactions = [], products = [], onNavigate }: DashboardHomeProps) {
  const [dbTransactions, setDbTransactions] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [user.id])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Mengambil data dashboard untuk user:", user.id)

      // Fetch recent transactions for current user only
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          *,
          transaction_items (
            id,
            product_name,
            quantity,
            subtotal
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError)
      } else if (transactionsData) {
        const formattedTransactions = transactionsData.map((transaction) => ({
          id: transaction.id,
          transaction_number: transaction.transaction_number,
          date: transaction.created_at,
          user_id: transaction.user_id,
          items: transaction.transaction_items || [],
          total: transaction.total_amount,
        }))
        setDbTransactions(formattedTransactions)
        console.log("✅ Berhasil mengambil transaksi:", formattedTransactions.length)
      }

      // Fetch products count for current user only
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, stock, price")
        .eq("user_id", user.id)

      if (productsError) {
        console.error("Error fetching products:", productsError)
      } else if (productsData) {
        setDbProducts(productsData)
        console.log("✅ Berhasil mengambil produk:", productsData.length)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Safely handle transactions and products arrays - prioritize database data
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const safeProducts = Array.isArray(products) ? products : []

  // Use database data if available, otherwise use props data filtered by user_id
  const displayTransactions =
    dbTransactions.length > 0 ? dbTransactions : safeTransactions.filter((t) => t.user_id === user.id)

  const displayProducts = dbProducts.length > 0 ? dbProducts : safeProducts.filter((p) => p.user_id === user.id)

  const today = new Date().toDateString()
  const allUserTransactions = displayTransactions // Semua transaksi user
  const todayTransactions = displayTransactions.filter((t) => new Date(t.date).toDateString() === today) // Tetap simpan untuk referensi hari ini
  const todayRevenue = allUserTransactions.reduce((sum, t) => sum + (t.total || 0), 0) // Gunakan semua transaksi
  const todayItemsSold = allUserTransactions.reduce(
    (sum, t) =>
      sum +
      (Array.isArray(t.items) ? t.items.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0) : 0),
    0,
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Selamat datang, {user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Penjualan</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">Rp {todayRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-gray-500">
              {allUserTransactions.length} transaksi Anda
              {dbTransactions.length > 0 && " (database)"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Item Terjual</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{todayItemsSold}</div>
            <p className="text-xs text-gray-500">Semua waktu</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Produk</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{displayProducts.length}</div>
            <p className="text-xs text-gray-500">Produk aktif {dbProducts.length > 0 && "(database)"}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Transaksi Anda</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{displayTransactions.length}</div>
            <p className="text-xs text-gray-500">Semua waktu</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">Akses fitur utama dengan cepat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={() => onNavigate?.("pos")}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Mulai Transaksi
            </Button>
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
              size="lg"
              onClick={() => onNavigate?.("reports")}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Lihat Laporan
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Transaksi Terakhir</CardTitle>
            <CardDescription className="text-gray-600">
              Transaksi terbaru {dbTransactions.length > 0 && "(dari database)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayTransactions.slice(0, 5).map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{transaction.transaction_number || `#${transaction.id}`}</p>
                  <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString("id-ID")}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">Rp {(transaction.total || 0).toLocaleString("id-ID")}</p>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(transaction.items) ? transaction.items.length : 0} item
                  </p>
                </div>
              </div>
            ))}
            {displayTransactions.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {isLoading ? "Memuat transaksi..." : "Belum ada transaksi untuk akun Anda"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
