"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, RefreshCw, FileSpreadsheet, Upload, X, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ExcelImportDialog } from "./excel-import-dialog"
import { 
  validateImageFile, 
  handleProductImageUpload, 
  removeProductImage 
} from "@/lib/imageUtils"

interface Product {
  id: string
  name: string
  weight: string
  price: number
  stock: number
  image_url?: string
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
  
  // Image handling states
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate image file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive",
      })
      e.target.value = '' // Reset input
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImageSelection = () => {
    setSelectedImage(null)
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveExistingImage = async (productId: string, imageUrl: string) => {
    if (!currentUserId) return

    try {
      const result = await removeProductImage(productId, currentUserId, imageUrl)
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Gambar produk berhasil dihapus",
        })
        // Refresh products to update UI
        await fetchProducts()
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal hapus gambar",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat hapus gambar",
        variant: "destructive",
      })
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
        const { data: updatedProduct, error } = await supabase
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
          .select()
          .single()

        if (error) {
          console.error("Error updating product:", error)
          toast({
            title: "Error",
            description: "Gagal mengupdate produk",
            variant: "destructive",
          })
          return
        }

        // Handle image upload if new image selected
        if (selectedImage) {
          setIsUploadingImage(true)
          const imageResult = await handleProductImageUpload(
            selectedImage, 
            editingProduct.id, 
            currentUserId,
            editingProduct.image_url // Pass old image URL for deletion
          )
          setIsUploadingImage(false)

          if (imageResult.error) {
            toast({
              title: "Error Upload Gambar",
              description: imageResult.error,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Berhasil",
              description: "Produk dan gambar berhasil diupdate",
            })
          }
        } else {
          toast({
            title: "Berhasil",
            description: "Produk berhasil diupdate",
          })
        }
      } else {
        // Create new product - always assign to current user
        const { data: newProduct, error } = await supabase.from("products").insert([
          {
            name: formData.name.trim(),
            weight: formData.weight.trim(),
            price: price,
            stock: stock,
            user_id: currentUserId, // Critical: always assign to current user
          },
        ])
        .select()
        .single()

        if (error) {
          console.error("Error creating product:", error)
          toast({
            title: "Error",
            description: "Gagal menambahkan produk",
            variant: "destructive",
          })
          return
        }

        // Handle image upload if image selected
        if (selectedImage && newProduct) {
          setIsUploadingImage(true)
          const imageResult = await handleProductImageUpload(
            selectedImage, 
            newProduct.id, 
            currentUserId
          )
          setIsUploadingImage(false)

          if (imageResult.error) {
            toast({
              title: "Error Upload Gambar",
              description: imageResult.error,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Berhasil",
              description: "Produk dan gambar berhasil ditambahkan",
            })
          }
        } else {
          toast({
            title: "Berhasil",
            description: "Produk berhasil ditambahkan",
          })
        }
      }

      // Reset form and close dialog
      setFormData({ name: "", weight: "", price: "", stock: "" })
      clearImageSelection() // Clear image selection
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
    
    // Set existing image preview if product has image
    if (product.image_url) {
      setImagePreview(product.image_url)
    } else {
      clearImageSelection()
    }
    
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
    clearImageSelection() // Clear image selection
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
    clearImageSelection() // Clear image selection
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
                        <div className="flex gap-3 mb-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.image_url ? (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => handleRemoveExistingImage(product.id, product.image_url!)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
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
                        <TableHead>Gambar</TableHead>
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
                          <TableCell>
                            {product.image_url ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => handleRemoveExistingImage(product.id, product.image_url!)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
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
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Gambar Produk (Opsional)</Label>
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* File Input */}
                <div className="flex flex-col items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedImage ? 'Ganti Gambar' : 'Pilih Gambar'}
                  </label>
                  <p className="text-xs text-muted-foreground text-center">
                    Format: JPG, PNG, WebP (max 2MB)
                  </p>
                </div>
              </div>
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
              <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isUploadingImage}>
                Batal
              </Button>
              <Button type="submit" disabled={isUploadingImage}>
                {isUploadingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  editingProduct ? "Update" : "Tambah"
                )}
              </Button>
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
