"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, RefreshCw, FileSpreadsheet } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ExcelImportDialog } from "./excel-import-dialog"

interface Product {
  id: string
  name: string
  weight: string
  price: number
  stock: number
  user_id: string
  created_at: string
  updated_at: string
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    price: "",
    stock: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      if (!supabase) {
        toast({
          title: "Error",
          description: "Database tidak tersedia",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error getting user:", error)
        toast({
          title: "Error",
          description: "Gagal mengautentikasi pengguna",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      setCurrentUserId(user.id)
      await fetchProducts(user.id)
    } catch (error) {
      console.error("Error initializing user:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat inisialisasi",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const fetchProducts = async (userId?: string) => {
    try {
      setLoading(true)

      if (!supabase) {
        toast({
          title: "Error",
          description: "Database tidak tersedia",
          variant: "destructive",
        })
        return
      }

      // Use provided userId or current user
      const userIdToUse = userId || currentUserId

      if (!userIdToUse) {
        console.error("No user ID available")
        toast({
          title: "Error",
          description: "User ID tidak tersedia",
          variant: "destructive",
        })
        return
      }

      // Fetch products ONLY for the current user
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userIdToUse)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Gagal mengambil data produk",
          variant: "destructive",
        })
        return
      }

      // Double check: filter again on client side for extra security
      const userProducts = (data || []).filter((product) => product.user_id === userIdToUse)
      setProducts(userProducts)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data produk",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUserId) {
      toast({
        title: "Error",
        description: "User tidak terautentikasi",
        variant: "destructive",
      })
      return
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database tidak tersedia",
        variant: "destructive",
      })
      return
    }

    if (!formData.name.trim() || !formData.weight.trim() || !formData.price || !formData.stock) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(formData.price)
    const stock = Number.parseInt(formData.stock)

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Harga harus berupa angka yang valid dan lebih dari 0",
        variant: "destructive",
      })
      return
    }

    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Error",
        description: "Stok harus berupa angka yang valid dan tidak negatif",
        variant: "destructive",
      })
      return
    }

    try {
      // Check for duplicates ONLY within current user's products
      const { data: existingProducts, error: checkError } = await supabase
        .from("products")
        .select("id, name, weight")
        .eq("user_id", currentUserId)
        .eq("name", formData.name.trim())
        .eq("weight", formData.weight.trim())

      if (checkError) {
        console.error("Error checking duplicates:", checkError)
        toast({
          title: "Error",
          description: "Gagal memeriksa duplikat produk",
          variant: "destructive",
        })
        return
      }

      // Filter out current product if editing
      const duplicates = existingProducts?.filter((p) => p.id !== editingProduct?.id) || []

      if (duplicates.length > 0) {
        toast({
          title: "Error",
          description: "Produk dengan nama dan berat/ukuran yang sama sudah ada",
          variant: "destructive",
        })
        return
      }

      if (editingProduct) {
        // Update existing product - ensure it belongs to current user
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name.trim(),
            weight: formData.weight.trim(),
            price: price,
            stock: stock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id)
          .eq("user_id", currentUserId) // Critical: ensure user can only update their own products

        if (error) {
          console.error("Error updating product:", error)
          toast({
            title: "Error",
            description: "Gagal mengupdate produk",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Berhasil",
          description: "Produk berhasil diupdate",
        })
      } else {
        // Create new product - always assign to current user
        const { error } = await supabase.from("products").insert([
          {
            name: formData.name.trim(),
            weight: formData.weight.trim(),
            price: price,
            stock: stock,
            user_id: currentUserId, // Critical: always assign to current user
          },
        ])

        if (error) {
          console.error("Error creating product:", error)
          toast({
            title: "Error",
            description: "Gagal menambahkan produk",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Berhasil",
          description: "Produk berhasil ditambahkan",
        })
      }

      // Reset form and close dialog
      setFormData({ name: "", weight: "", price: "", stock: "" })
      setEditingProduct(null)
      setIsDialogOpen(false)
      await fetchProducts()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan produk",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    // Security check: ensure user can only edit their own products
    if (product.user_id !== currentUserId) {
      toast({
        title: "Error",
        description: "Anda tidak memiliki akses untuk mengedit produk ini",
        variant: "destructive",
      })
      return
    }

    setEditingProduct(product)
    setFormData({
      name: product.name,
      weight: product.weight,
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    // Security check: ensure user can only delete their own products
    if (product.user_id !== currentUserId) {
      toast({
        title: "Error",
        description: "Anda tidak memiliki akses untuk menghapus produk ini",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      return
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database tidak tersedia",
        variant: "destructive",
      })
      return
    }

    try {
      // Delete product - ensure it belongs to current user
      const { error } = await supabase.from("products").delete().eq("id", product.id).eq("user_id", currentUserId) // Critical: ensure user can only delete their own products

      if (error) {
        console.error("Error deleting product:", error)
        toast({
          title: "Error",
          description: "Gagal menghapus produk",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      })
      await fetchProducts()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus produk",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({ name: "", weight: "", price: "", stock: "" })
  }

  const handleAddProduct = () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setEditingProduct(null)
    setFormData({ name: "", weight: "", price: "", stock: "" })
    setIsDialogOpen(true)
  }

  const handleExcelImportComplete = () => {
    fetchProducts()
  }

  const handleRefresh = () => {
    if (currentUserId) {
      fetchProducts()
    } else {
      initializeUser()
    }
  }

  // Don't render anything if user is not authenticated
  if (!currentUserId && !loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                Anda harus login terlebih dahulu untuk mengakses master data produk
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Produk</CardTitle>
              <CardDescription className="text-sm sm:text-base">Kelola produk yang dijual</CardDescription>
            </div>
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}      // ✅ Fungsi yang benar
                  disabled={loading}           // ✅ Variable yang benar
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent w-full sm:w-auto">
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button onClick={handleAddProduct} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Produk
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsExcelDialogOpen(true)} className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import dari Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Daftar Produk</h3>
              <p className="text-sm text-muted-foreground">Total {products.length} produk terdaftar untuk akun Anda</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Memuat data produk...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Belum ada produk yang ditambahkan untuk akun Anda</p>
                <Button className="mt-4 w-full sm:w-auto" onClick={handleAddProduct}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Produk Pertama
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {/* Mobile Card View - Hidden on larger screens */}
                <div className="lg:hidden space-y-3 p-4">
                  {products.map((product) => (
                    <Card key={product.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                            {product.weight && (
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.weight}</p>
                            )}
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(product)} className="h-8 w-8 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Harga:</span>
                            <div className="font-medium">Rp {product.price.toLocaleString("id-ID")}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stok:</span>
                            <div className="font-medium">{product.stock}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Produk</TableHead>
                        <TableHead>Berat/Ukuran</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.weight}</TableCell>
                          <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(product)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama produk"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Berat/Ukuran</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Contoh: 1kg, 500ml, 1 pcs"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Masukkan harga"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="Masukkan jumlah stok"
                min="0"
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Batal
              </Button>
              <Button type="submit">{editingProduct ? "Update" : "Tambah"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ExcelImportDialog
        open={isExcelDialogOpen}
        onOpenChange={setIsExcelDialogOpen}
        onImportComplete={handleExcelImportComplete}
      />
    </div>
  )
}
