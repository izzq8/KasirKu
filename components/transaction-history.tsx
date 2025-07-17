"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface TransactionHistoryProps {
  user: User
  transactions: any[]
}

export function TransactionHistory({ user, transactions }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [dbTransactions, setDbTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [user.id])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      // Fetch transactions with their items for current user only
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          *,
          transaction_items (
            id,
            product_id,
            product_name,
            product_weight,
            price,
            quantity,
            subtotal
          )
        `)
        .eq("user_id", user.id) // Filter by current user
        .order("created_at", { ascending: false })

      if (transactionsError) {
        throw transactionsError
      }

      // Transform data to match expected format
      const formattedTransactions = transactionsData.map((transaction) => ({
        id: transaction.id,
        transaction_number: transaction.transaction_number,
        date: transaction.created_at,
        user_id: transaction.user_id,
        items: transaction.transaction_items.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          weight: item.product_weight,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        total: transaction.total_amount,
        customerMoney: transaction.customer_money,
        change: transaction.change_amount,
      }))

      setDbTransactions(formattedTransactions)
      toast({
        title: "Berhasil",
        description: "Data transaksi berhasil dimuat dari database",
      })
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi dari database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayTransactions =
    dbTransactions.length > 0 ? dbTransactions : transactions.filter((t) => t.user_id === user.id)

  const filteredTransactions = displayTransactions.filter(
    (transaction) =>
      transaction.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.items.some((item: any) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getTodayTransactions = () => {
    const today = new Date().toDateString()
    return displayTransactions.filter((t) => new Date(t.date).toDateString() === today)
  }

  const getTodayRevenue = () => {
    return getTodayTransactions().reduce((sum, t) => sum + t.total, 0)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
          <p className="text-muted-foreground">Transaksi Anda - {user.user_metadata?.full_name || user.email}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchTransactions} 
          disabled={isLoading}
          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Transaksi Anda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTransactions.length}</div>
            <p className="text-sm text-muted-foreground">
              {dbTransactions.length > 0 ? "Dari database" : "Semua waktu"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTodayTransactions().length}</div>
            <p className="text-sm text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendapatan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {getTodayRevenue().toLocaleString("id-ID")}</div>
            <p className="text-sm text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            Riwayat transaksi yang Anda lakukan
            {dbTransactions.length > 0 && " (dari database)"}
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jumlah Item</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.transaction_number || `#${transaction.id}`}
                  </TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{transaction.items.length} item</TableCell>
                  <TableCell>Rp {transaction.total.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Detail Transaksi {transaction.transaction_number || `#${transaction.id}`}
                          </DialogTitle>
                          <DialogDescription>{new Date(transaction.date).toLocaleString("id-ID")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Item yang dibeli:</h4>
                            {transaction.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-muted-foreground">
                                    {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                                  </p>
                                </div>
                                <p>Rp {item.subtotal.toLocaleString("id-ID")}</p>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>Rp {transaction.total.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bayar:</span>
                              <span>Rp {transaction.customerMoney.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Kembalian:</span>
                              <span>Rp {transaction.change.toLocaleString("id-ID")}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isLoading
                  ? "Memuat data transaksi..."
                  : searchTerm
                    ? "Tidak ada transaksi yang ditemukan"
                    : "Belum ada transaksi"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
