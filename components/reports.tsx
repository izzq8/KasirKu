"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText, Plus, Edit, Trash2, Save, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface ReportsProps {
  user: User
  transactions: any[]
  products: any[]
}

export function Reports({ user, transactions, products }: ReportsProps) {
  const [reportTitle, setReportTitle] = useState("Laporan Penjualan")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { toast } = useToast()

  // Database states
  const [dbTransactions, setDbTransactions] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [editingReportItem, setEditingReportItem] = useState<any>(null)
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false)
  const [itemForm, setItemForm] = useState({
    name: "",
    weight: "",
    price: "",
    quantitySold: "",
  })

  const [dateError, setDateError] = useState("")

  useEffect(() => {
    fetchReportData()
  }, [user.id])

  const fetchReportData = async () => {
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

      // Fetch products (all products, not user-specific)
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true })

      if (productsError) {
        throw productsError
      }

      // Transform transactions data
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
      setDbProducts(productsData)

      toast({
        title: "Berhasil",
        description: "Data laporan berhasil dimuat dari database",
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data laporan dari database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredTransactions = () => {
    const dataSource = dbTransactions.length > 0 ? dbTransactions : transactions.filter((t) => t.user_id === user.id)

    if (!startDate && !endDate) return dataSource

    return dataSource.filter((transaction) => {
      // Parse transaction date - handle both ISO string and regular date
      const transactionDate = new Date(transaction.date)

      // Normalize to just the date part (remove time)
      const transactionDateOnly = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate(),
      )

      let isInRange = true

      // Check start date
      if (startDate) {
        const startDateObj = new Date(startDate)
        const startDateOnly = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate())
        isInRange = isInRange && transactionDateOnly >= startDateOnly
      }

      // Check end date
      if (endDate) {
        const endDateObj = new Date(endDate)
        const endDateOnly = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate())
        isInRange = isInRange && transactionDateOnly <= endDateOnly
      }

      return isInRange
    })
  }

  const generateReportData = () => {
    const filteredTransactions = getFilteredTransactions()
    const productSales: { [key: string]: any } = {}

    // Debug: Log filtered transactions
    console.log("Filtered transactions:", filteredTransactions.length)
    console.log("Date range:", { startDate, endDate })

    filteredTransactions.forEach((transaction) => {
      transaction.items.forEach((item: any) => {
        const itemId = item.id || item.name // fallback to name if no id
        if (productSales[itemId]) {
          productSales[itemId].quantitySold += item.quantity
          productSales[itemId].totalRevenue += item.subtotal
        } else {
          productSales[itemId] = {
            id: itemId,
            name: item.name,
            weight: item.weight,
            price: item.price,
            quantitySold: item.quantity,
            totalRevenue: item.subtotal,
          }
        }
      })
    })

    const result = Object.values(productSales)
    console.log("Generated report data:", result.length, "products")
    return result
  }

  const exportToCSV = () => {
    const reportData = generateReportData()
    const headers = ["Nama Produk", "Berat/Ukuran", "Harga Satuan", "Qty Terjual", "Total"]

    let csvContent = `${reportTitle}\n`
    csvContent += `User: ${user.user_metadata?.full_name || user.email}\n`
    if (startDate || endDate) {
      csvContent += `Periode: ${startDate || "Awal"} - ${endDate || "Sekarang"}\n`
    }
    csvContent += `Tanggal Export: ${new Date().toLocaleString("id-ID")}\n`
    csvContent += `Sumber Data: ${dbTransactions.length > 0 ? "Database" : "Local Storage"}\n\n`

    csvContent += headers.join(",") + "\n"

    reportData.forEach((item: any) => {
      csvContent +=
        [`"${item.name}"`, `"${item.weight}"`, item.price, item.quantitySold, item.totalRevenue].join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportTitle.replace(/\s+/g, "_")}_${user.id}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Berhasil",
      description: "Laporan berhasil diexport ke CSV",
    })
  }

  const exportToPDF = () => {
    const reportData = generateReportData()

    // Debug: Check if we have data
    if (reportData.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada data untuk periode yang dipilih. Silakan periksa filter tanggal.",
        variant: "destructive",
      })
      return
    }

    const printWindow = window.open("", "_blank")

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              .info { text-align: center; margin-bottom: 20px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>${reportTitle}</h1>
            <div class="info">
              <p>User: ${user.user_metadata?.full_name || user.email}</p>
              ${startDate || endDate ? `<p>Periode: ${startDate || "Awal"} - ${endDate || "Sekarang"}</p>` : ""}
              <p>Tanggal Export: ${new Date().toLocaleString("id-ID")}</p>
              <p>Sumber Data: ${dbTransactions.length > 0 ? "Database" : "Local Storage"}</p>
              <p>Jumlah Produk: ${reportData.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nama Produk</th>
                  <th>Berat/Ukuran</th>
                  <th>Harga Satuan</th>
                  <th>Qty Terjual</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${reportData
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.weight}</td>
                    <td>Rp ${item.price.toLocaleString("id-ID")}</td>
                    <td>${item.quantitySold}</td>
                    <td>Rp ${item.totalRevenue.toLocaleString("id-ID")}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="total">
                  <td colspan="4"><strong>Total Keseluruhan</strong></td>
                  <td><strong>Rp ${reportData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0).toLocaleString("id-ID")}</strong></td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }

    toast({
      title: "Export PDF",
      description: `Laporan berhasil digenerate dengan ${reportData.length} produk`,
    })
  }

  const reportData = generateReportData()
  const totalRevenue = reportData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0)
  const totalItemsSold = reportData.reduce((sum: number, item: any) => sum + item.quantitySold, 0)

  const sortReportData = (data: any[]) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? "↑" : "↓"
  }

  const editReportItem = (item: any, index: number) => {
    setEditingReportItem({ ...item, index })
    setItemForm({
      name: item.name,
      weight: item.weight,
      price: item.price.toString(),
      quantitySold: item.quantitySold.toString(),
    })
    setIsEditItemDialogOpen(true)
  }

  const saveReportItem = async () => {
    if (!itemForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama produk harus diisi",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const price = Number.parseInt(itemForm.price) || 0
      const quantity = Number.parseInt(itemForm.quantitySold) || 0
      const subtotal = price * quantity

      if (editingReportItem) {
        // Update existing transaction items for current user
        const { data: existingItems, error: fetchError } = await supabase
          .from("transaction_items")
          .select("*, transactions!inner(user_id)")
          .eq("product_name", editingReportItem.name)
          .eq("transactions.user_id", user.id)

        if (fetchError) throw fetchError

        if (existingItems && existingItems.length > 0) {
          // Update the first item and delete others (consolidate)
          const firstItem = existingItems[0]

          const { error: updateError } = await supabase
            .from("transaction_items")
            .update({
              product_name: itemForm.name,
              product_weight: itemForm.weight,
              price: price,
              quantity: quantity,
              subtotal: subtotal,
            })
            .eq("id", firstItem.id)

          if (updateError) throw updateError

          // Delete other items with same product name (if any)
          if (existingItems.length > 1) {
            const otherIds = existingItems.slice(1).map((item) => item.id)
            const { error: deleteError } = await supabase.from("transaction_items").delete().in("id", otherIds)

            if (deleteError) throw deleteError
          }
        }
      } else {
        // Add new transaction item (create a manual adjustment transaction)
        const { data: adjustmentTransaction, error: transactionError } = await supabase
          .from("transactions")
          .insert([
            {
              transaction_number: `ADJ-${Date.now()}`,
              total_amount: subtotal,
              customer_money: subtotal,
              change_amount: 0,
              user_id: user.id, // Use current user's ID
            },
          ])
          .select()
          .single()

        if (transactionError) throw transactionError

        // Then create the transaction item
        const { error: itemError } = await supabase.from("transaction_items").insert([
          {
            transaction_id: adjustmentTransaction.id,
            product_id: null,
            product_name: itemForm.name,
            product_weight: itemForm.weight,
            price: price,
            quantity: quantity,
            subtotal: subtotal,
          },
        ])

        if (itemError) throw itemError
      }

      toast({
        title: "Berhasil",
        description: editingReportItem ? "Item laporan berhasil diperbarui" : "Item laporan berhasil ditambahkan",
      })

      setIsEditItemDialogOpen(false)
      resetItemForm()

      // Refresh report data
      await fetchReportData()
    } catch (error) {
      console.error("Error saving report item:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan perubahan item laporan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReportItem = async (item: any, index: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua transaksi produk ini dari laporan?")) {
      return
    }

    setIsLoading(true)

    try {
      // Delete all transaction items with this product name for current user only
      const { error } = await supabase
        .from("transaction_items")
        .delete()
        .eq("product_name", item.name)
        .in(
          "transaction_id",
          dbTransactions.map((t) => t.id),
        )

      if (error) throw error

      toast({
        title: "Berhasil",
        description: "Item berhasil dihapus dari laporan",
      })

      // Refresh report data
      await fetchReportData()
    } catch (error) {
      console.error("Error deleting report item:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus item laporan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetItemForm = () => {
    setItemForm({
      name: "",
      weight: "",
      price: "",
      quantitySold: "",
    })
    setEditingReportItem(null)
  }

  const addNewReportItem = () => {
    setEditingReportItem(null)
    resetItemForm()
    setIsEditItemDialogOpen(true)
  }

  const validateDateRange = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)

      if (startDate > endDate) {
        setDateError("Tanggal akhir tidak boleh lebih awal dari tanggal mulai")
        return false
      }
    }
    setDateError("")
    return true
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)

    // If end date exists and is before start date, clear it
    if (endDate && value && new Date(value) > new Date(endDate)) {
      setEndDate("")
      setDateError("Tanggal akhir direset karena lebih awal dari tanggal mulai")
      setTimeout(() => setDateError(""), 3000)
    } else {
      validateDateRange(value, endDate)
    }
  }

  const handleEndDateChange = (value: string) => {
    if (startDate && value && new Date(startDate) > new Date(value)) {
      setDateError("Tanggal akhir tidak boleh lebih awal dari tanggal mulai")
      return
    }

    setEndDate(value)
    validateDateRange(startDate, value)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
          <p className="text-muted-foreground">
            Export dan analisis data penjualan - {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <Button variant="outline" onClick={fetchReportData} disabled={isLoading} className="border-blue-500 text-blue-700 hover:bg-blue-100 bg-transparent">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className={`lg:col-span-2 ${(startDate || endDate) ? 'border-blue-500 shadow-lg' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>⚙️ Pengaturan Laporan</CardTitle>
                {(startDate || endDate) && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Filter Aktif
                  </span>
                )}
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ↻ Reset Filter
                </Button>
              )}
            </div>
            <CardDescription>
              Atur parameter laporan yang akan diexport
              {dbTransactions.length > 0 && " (menggunakan data database)"}
              {(startDate || endDate) && (
                <span className="ml-2 text-blue-600 font-medium">
                  • Filter: {startDate || "Awal"} → {endDate || "Sekarang"}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="reportTitle">Judul Laporan</Label>
              <Input
                id="reportTitle"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Masukkan judul laporan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="flex items-center space-x-2">
                  <span>📅 Tanggal Mulai</span>
                  {startDate && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Set
                    </span>
                  )}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  max={endDate || undefined}
                  className={`${startDate ? 'border-green-500 bg-green-50' : ''}`}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="flex items-center space-x-2">
                  <span>📅 Tanggal Akhir</span>
                  {endDate && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Set
                    </span>
                  )}
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={startDate || undefined}
                  className={`${endDate ? 'border-green-500 bg-green-50' : ''}`}
                />
              </div>
            </div>

            {/* Date validation error */}
            {dateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">⚠️ {dateError}</p>
              </div>
            )}

            {/* Enhanced filter status with real-time preview */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900">📊 Preview Filter</h4>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {dbTransactions.length > 0 ? "Database" : "Local"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-blue-600">{getFilteredTransactions().length}</div>
                  <div className="text-xs text-gray-600">Transaksi</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-green-600">{reportData.length}</div>
                  <div className="text-xs text-gray-600">Produk</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-purple-600">{totalItemsSold}</div>
                  <div className="text-xs text-gray-600">Item Terjual</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-orange-600">
                    {(totalRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-gray-600">Total (Juta)</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-blue-700">
                <strong>Periode:</strong> {startDate || endDate ? `${startDate || "Awal"} - ${endDate || "Sekarang"}` : "Semua waktu"}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={exportToCSV} className="flex-1" disabled={isLoading || reportData.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel/CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="flex-1" disabled={isLoading || reportData.length === 0}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {reportData.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Tidak ada data untuk periode yang dipilih. Silakan ubah filter tanggal atau hapus filter untuk melihat semua data.
                </p>
              </div>
            )}

            {dbTransactions.length === 0 && transactions.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Menggunakan data lokal. Klik "Refresh Data" untuk memuat dari database.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ringkasan Laporan</span>
              <div className="flex items-center space-x-2">
                {(startDate || endDate) && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Terfilter</span>
                )}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {dbTransactions.length > 0 ? "DB" : "Local"}
                </span>
              </div>
            </CardTitle>
            <CardDescription>
              {startDate || endDate 
                ? `Periode: ${startDate || "Awal"} - ${endDate || "Sekarang"}`
                : "Semua waktu"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced metrics with better visual hierarchy */}
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">💰 Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-900">Rp {totalRevenue.toLocaleString("id-ID")}</p>
                <p className="text-xs text-green-600">
                  {reportData.length > 0 ? `Rata-rata: Rp ${(totalRevenue / reportData.length).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : "Tidak ada data"}
                </p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">📦 Total Item Terjual</p>
                <p className="text-2xl font-bold text-blue-900">{totalItemsSold}</p>
                <p className="text-xs text-blue-600">
                  {reportData.length > 0 ? `Rata-rata: ${(totalItemsSold / reportData.length).toFixed(1)} per produk` : "Tidak ada data"}
                </p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-800">🏷️ Jumlah Produk</p>
                <p className="text-2xl font-bold text-purple-900">{reportData.length}</p>
                <p className="text-xs text-purple-600">
                  {getFilteredTransactions().length > 0 ? `Dari ${getFilteredTransactions().length} transaksi` : "Tidak ada transaksi"}
                </p>
              </div>
            </div>

            {/* Filter status indicator */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status Filter:</span>
                <span className={`font-medium ${(startDate || endDate) ? 'text-blue-600' : 'text-gray-600'}`}>
                  {(startDate || endDate) ? 'Aktif' : 'Semua Data'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Sumber Data:</span>
                <span className={`font-medium ${isLoading ? 'text-yellow-600' : dbTransactions.length > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {isLoading ? "Memuat..." : dbTransactions.length > 0 ? "Database" : "Local Storage"}
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="pt-3 border-t space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                disabled={!startDate && !endDate}
              >
                🔄 Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl">📋 Preview Laporan</CardTitle>
                {(startDate || endDate) && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    📅 Terfilter
                  </span>
                )}
              </div>
              <CardDescription className="mt-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span>Menampilkan {sortReportData(reportData).length} produk</span>
                  {dbTransactions.length > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Database</span>
                  )}
                  {(startDate || endDate) && (
                    <span className="text-blue-600">
                      • {startDate || "Awal"} → {endDate || "Sekarang"}
                    </span>
                  )}
                </div>
              </CardDescription>
            </div>
            <Button onClick={addNewReportItem} size="sm" className="ml-4">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </div>
          
          {/* Enhanced preview header with live stats */}
          {reportData.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{reportData.length}</div>
                  <div className="text-xs text-gray-600">Jenis Produk</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{totalItemsSold}</div>
                  <div className="text-xs text-gray-600">Total Terjual</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    Rp {(totalRevenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {reportData.length > 0 ? (totalRevenue / reportData.length / 1000).toFixed(1) : 0}K
                  </div>
                  <div className="text-xs text-gray-600">Rata-rata/Produk</div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Table filter status indicator */}
          {(startDate || endDate) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800">
                    📊 Data difilter berdasarkan tanggal
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {startDate || "Awal"} → {endDate || "Sekarang"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ↻ Tampilkan Semua
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center font-semibold">
                    📦 Nama Produk {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => handleSort("weight")}>
                  <div className="flex items-center font-semibold">
                    ⚖️ Berat/Ukuran {getSortIcon("weight")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100 select-none transition-colors" onClick={() => handleSort("price")}>
                  <div className="flex items-center font-semibold">
                    💰 Harga Satuan {getSortIcon("price")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  onClick={() => handleSort("quantitySold")}
                >
                  <div className="flex items-center font-semibold">
                    📊 Qty Terjual {getSortIcon("quantitySold")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  onClick={() => handleSort("totalRevenue")}
                >
                  <div className="flex items-center font-semibold">
                    💵 Total {getSortIcon("totalRevenue")}
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">🔧 Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortReportData(reportData).map((item: any, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {item.weight}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-blue-600">
                      {item.quantitySold}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-purple-600">
                      Rp {item.totalRevenue.toLocaleString("id-ID")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editReportItem(item, index)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteReportItem(item, index)}
                        className="hover:bg-red-50 hover:border-red-300 text-red-600"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortReportData(reportData).length > 0 && (
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell colSpan={5}>Total Keseluruhan</TableCell>
                  <TableCell>Rp {totalRevenue.toLocaleString("id-ID")}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {reportData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isLoading ? "Memuat data laporan..." : "Tidak ada data untuk periode yang dipilih"}
              </p>
              {(startDate || endDate) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Coba ubah filter tanggal atau hapus filter untuk melihat semua data
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Report Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReportItem ? "Edit Item Laporan" : "Tambah Item Laporan"}</DialogTitle>
            <DialogDescription>
              {editingReportItem ? "Perbarui informasi item laporan" : "Tambah item baru ke laporan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="itemName">Nama Produk</Label>
              <Input
                id="itemName"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Masukkan nama produk"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemWeight">Berat/Ukuran</Label>
              <Input
                id="itemWeight"
                value={itemForm.weight}
                onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })}
                placeholder="Contoh: 1kg, 500ml"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemPrice">Harga Satuan</Label>
              <Input
                id="itemPrice"
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="Masukkan harga"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemQuantity">Qty Terjual</Label>
              <Input
                id="itemQuantity"
                type="number"
                value={itemForm.quantitySold}
                onChange={(e) => setItemForm({ ...itemForm, quantitySold: e.target.value })}
                placeholder="Masukkan jumlah terjual"
              />
            </div>
            <div className="grid gap-2">
              <Label>Total</Label>
              <div className="p-2 bg-gray-50 rounded border">
                Rp{" "}
                {(
                  (Number.parseInt(itemForm.price) || 0) * (Number.parseInt(itemForm.quantitySold) || 0)
                ).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={saveReportItem} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Menyimpan..." : editingReportItem ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
