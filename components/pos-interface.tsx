"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus, ShoppingCart, Trash2, Receipt, RefreshCw } from "lucide-react"
import { supabase, ensureUserExists, type Product } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Helper untuk cek apakah string adalah UUID valid
const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

// Helper functions untuk format angka
const formatCurrency = (value: string | number): string => {
  if (!value) return ""

  // Remove non-numeric characters except digits
  const numericValue = value.toString().replace(/[^\d]/g, "")

  if (!numericValue) return ""

  // Convert to number and format with dots
  return Number.parseInt(numericValue).toLocaleString("id-ID")
}

const parseCurrency = (formattedValue: string): string => {
  // Remove dots and return plain number string
  return formattedValue.replace(/\./g, "")
}

// Tambahkan setelah import statements
const validateTransaction = (cart: CartItem[], customerMoneyFormatted: string, user: any) => {
  const errors: string[] = []

  if (!cart || cart.length === 0) {
    errors.push("Keranjang belanja kosong")
  }

  if (!user || !user.id) {
    errors.push("User tidak valid")
  }

  const money = Number.parseInt(parseCurrency(customerMoneyFormatted)) || 0
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (money < total) {
    errors.push(`Uang tidak cukup. Dibutuhkan: Rp ${total.toLocaleString("id-ID")}`)
  }

  // Check stock availability
  cart.forEach((item) => {
    if (item.quantity > item.stock) {
      errors.push(`Stok ${item.name} tidak mencukupi (tersedia: ${item.stock})`)
    }
  })

  return errors
}

interface CartItem extends Product {
  quantity: number
}

interface POSInterfaceProps {
  user: User
  products?: Product[]
  onAddTransaction?: (transaction: any) => void
  onUpdateProducts?: (products: Product[]) => void
}

export function POSInterface({
  user,
  products: initialProducts = [],
  onAddTransaction,
  onUpdateProducts,
}: POSInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerMoney, setCustomerMoney] = useState("")
  const [customerMoneyFormatted, setCustomerMoneyFormatted] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const { toast } = useToast()

  // Fetch products from Supabase berdasarkan user ID
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      console.log("🔄 Mengambil data produk dari Supabase untuk user:", user.id)

      // Pastikan user ada di database terlebih dahulu
      await ensureUserExists(user)

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id) // Filter berdasarkan user_id
        .order("name", { ascending: true })

      if (error) {
        console.error("❌ Error fetching products:", error)
        toast({
          title: "Error",
          description: `Gagal mengambil data produk: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log("✅ Berhasil mengambil produk untuk user:", data?.length || 0)
      setProducts(data || [])

      if (onUpdateProducts) {
        onUpdateProducts(data || [])
      }
    } catch (error: any) {
      console.error("💥 Error dalam fetchProducts:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data produk",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Load products on component mount - always fetch from database
  useEffect(() => {
    // Always fetch from database to ensure user-specific data
    fetchProducts()
  }, [user.id])

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Stok Habis",
        description: "Produk ini sudah habis",
        variant: "destructive",
      })
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stok Tidak Cukup",
          description: `Stok tersisa: ${product.stock}`,
          variant: "destructive",
        })
        return
      }
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
      return
    }

    const product = products.find((p) => p.id === id)
    if (product && quantity > product.stock) {
      toast({
        title: "Stok Tidak Cukup",
        description: `Stok tersisa: ${product.stock}`,
        variant: "destructive",
      })
      return
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getChange = () => {
    const money = Number.parseInt(parseCurrency(customerMoneyFormatted)) || 0
    return money - getTotalPrice()
  }

  const processTransaction = async () => {
    // Validate transaction before processing
    const validationErrors = validateTransaction(cart, customerMoneyFormatted, user)

    if (validationErrors.length > 0) {
      toast({
        title: "Validasi Gagal",
        description: validationErrors[0], // Show first error
        variant: "destructive",
      })
      console.error("Validation errors:", validationErrors)
      return
    }

    setIsProcessing(true)

    try {
      console.log("🔄 Memulai proses transaksi...")
      console.log("Cart items:", cart.length)
      console.log("Total amount:", getTotalPrice())
      console.log("User ID:", user.id)

      // Step 0: Ensure user exists in public.users table
      console.log("👤 Memastikan user ada di database...")
      await ensureUserExists(user)

      // Generate transaction number
      const transactionNumber = `TRX-${Date.now()}`
      console.log("Transaction number:", transactionNumber)

      // Step 1: Create transaction in database
      console.log("📝 Membuat transaksi di database...")
      const transactionData = {
        transaction_number: transactionNumber,
        total_amount: getTotalPrice(),
        customer_money: Number.parseInt(customerMoney) || 0,
        change_amount: (Number.parseInt(customerMoney) || 0) - getTotalPrice(),
        user_id: user.id,
      }

      console.log("Transaction data to insert:", transactionData)

      const { data: insertedTransaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single()

      if (transactionError) {
        console.error("❌ Error creating transaction:", transactionError)
        throw new Error(`Gagal membuat transaksi: ${transactionError.message}`)
      }

      console.log("✅ Transaksi berhasil dibuat:", insertedTransaction.id)

      // Step 2: Create transaction items
      console.log("📦 Membuat item transaksi...")
      const transactionItems = cart.map((item) => ({
        transaction_id: insertedTransaction.id,
        product_id: isUuid(item.id as string) ? (item.id as string) : null,
        product_name: item.name,
        product_weight: item.weight || null,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))

      console.log("Transaction items to insert:", transactionItems.length)

      const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems)

      if (itemsError) {
        console.error("❌ Error creating transaction items:", itemsError)

        // Rollback: Delete the transaction
        await supabase.from("transactions").delete().eq("id", insertedTransaction.id)

        throw new Error(`Gagal menyimpan item transaksi: ${itemsError.message}`)
      }

      console.log("✅ Item transaksi berhasil disimpan")

      // Step 3: Update product stock (only for valid UUIDs)
      console.log("📊 Mengupdate stok produk...")
      const stockUpdatePromises = cart
        .filter((item) => isUuid(item.id as string)) // Only update products with valid UUID
        .map(async (item) => {
          const newStock = item.stock - item.quantity
          console.log(`Updating stock for ${item.name}: ${item.stock} -> ${newStock}`)

          const { error: stockError } = await supabase
            .from("products")
            .update({
              stock: newStock,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id)
            .eq("user_id", user.id) // Pastikan hanya update produk milik user

          if (stockError) {
            console.error(`❌ Error updating stock for ${item.name}:`, stockError)
            throw new Error(`Gagal update stok ${item.name}: ${stockError.message}`)
          }

          return { id: item.id, newStock }
        })

      // Wait for all stock updates to complete
      try {
        const stockResults = await Promise.all(stockUpdatePromises)
        console.log("✅ Semua stok berhasil diupdate:", stockResults.length)
      } catch (stockError) {
        console.error("❌ Error in stock updates:", stockError)

        // Rollback: Delete transaction and items
        await supabase.from("transaction_items").delete().eq("transaction_id", insertedTransaction.id)
        await supabase.from("transactions").delete().eq("id", insertedTransaction.id)

        throw stockError
      }

      // Step 4: Update local products state
      console.log("🔄 Mengupdate state lokal...")
      const updatedProducts = products.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id)
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity }
        }
        return product
      })

      setProducts(updatedProducts)
      if (onUpdateProducts) {
        onUpdateProducts(updatedProducts)
      }

      // Step 5: Create transaction object for local use
      const transaction = {
        id: insertedTransaction.id,
        transaction_number: transactionNumber,
        date: insertedTransaction.created_at,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          weight: item.weight || null,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        total: getTotalPrice(),
        customerMoney: Number.parseInt(customerMoney) || 0,
        change: (Number.parseInt(customerMoney) || 0) - getTotalPrice(),
      }

      if (onAddTransaction) {
        onAddTransaction(transaction)
      }
      setLastTransaction(transaction)
      setShowReceipt(true)

      // Reset form
      setCart([])
      setCustomerMoney("")
      setCustomerMoneyFormatted("")

      console.log("🎉 Transaksi berhasil diselesaikan!")

      toast({
        title: "Transaksi Berhasil",
        description: `Total: Rp ${getTotalPrice().toLocaleString("id-ID")} | No: ${transactionNumber}`,
      })
    } catch (error: any) {
      console.error("💥 Error dalam proses transaksi:", error)

      // Show detailed error message
      const errorMessage = error.message || "Terjadi kesalahan tidak diketahui"

      toast({
        title: "Transaksi Gagal",
        description: errorMessage,
        variant: "destructive",
      })

      // Additional error details for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("Full error details:", {
          error,
          cart: cart.length,
          total: getTotalPrice(),
          userId: user.id,
          customerMoney: Number.parseInt(customerMoney) || 0,
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transaksi</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Proses transaksi penjualan - {user.user_metadata?.full_name || user.email?.split("@")[0]}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchProducts}
            disabled={isLoadingProducts}
            className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingProducts ? "animate-spin" : ""}`} />
            {isLoadingProducts ? "Memuat..." : "Refresh Produk"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Daftar Produk</CardTitle>
              <CardDescription className="text-sm">
                Klik produk untuk menambah ke keranjang
                {products.length > 0 && ` (${products.length} produk tersedia)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Memuat produk...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${product.stock <= 0 ? "opacity-50" : ""}`}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {/* Product Image */}
                        {product.image_url && (
                          <div className="w-full h-24 sm:h-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                        {product.weight && (
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.weight}</p>
                        )}
                        <p className="text-base sm:text-lg font-bold text-primary">Rp {product.price.toLocaleString("id-ID")}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Stok: {product.stock}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {!isLoadingProducts && products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Belum ada produk tersedia untuk akun Anda</p>
                  <Button onClick={fetchProducts} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Keranjang Belanja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                  <div className="flex-1 min-w-0 mr-2">
                    <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                    {item.weight && (
                      <p className="text-xs text-muted-foreground truncate">{item.weight}</p>
                    )}
                    <p className="text-xs sm:text-sm font-medium">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Keranjang kosong</p>
                </div>
              )}

              {cart.length > 0 && (
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total:</span>
                    <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Uang Pembeli</label>
                    <Input
                      type="text"
                      placeholder="Masukkan jumlah uang"
                      value={customerMoneyFormatted}
                      className="text-base"
                      onChange={(e) => {
                        const inputValue = e.target.value
                        // Allow only numbers and dots
                        const cleanValue = inputValue.replace(/[^\d]/g, "")

                        if (cleanValue) {
                          const formatted = formatCurrency(cleanValue)
                          setCustomerMoneyFormatted(formatted)
                          setCustomerMoney(cleanValue)
                        } else {
                          setCustomerMoneyFormatted("")
                          setCustomerMoney("")
                        }
                      }}
                      onKeyDown={(e) => {
                        // Allow: backspace, delete, tab, escape, enter
                        if (
                          [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                          (e.keyCode === 65 && e.ctrlKey === true) ||
                          (e.keyCode === 67 && e.ctrlKey === true) ||
                          (e.keyCode === 86 && e.ctrlKey === true) ||
                          (e.keyCode === 88 && e.ctrlKey === true)
                        ) {
                          return
                        }
                        // Ensure that it is a number and stop the keypress
                        if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>

                  {customerMoneyFormatted && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Kembalian:</span>
                      <span className={getChange() >= 0 ? "text-green-600" : "text-red-600"}>
                        Rp {getChange().toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <Button
                    className="w-full text-base sm:text-lg py-2 sm:py-3"
                    onClick={processTransaction}
                    disabled={!customerMoney || getChange() < 0 || isProcessing}
                  >
                    {isProcessing ? "Memproses..." : "Proses Transaksi"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <Receipt className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Struk Digital
            </DialogTitle>
            <DialogDescription className="text-sm">Transaksi berhasil diproses</DialogDescription>
          </DialogHeader>
          {lastTransaction && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold">TOKO KASIR POS</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(lastTransaction.date).toLocaleString("id-ID")}
                </p>
                <p className="text-sm">No: {lastTransaction.transaction_number}</p>
                <p className="text-xs text-muted-foreground">Kasir: {lastTransaction.user_name}</p>
              </div>

              <div className="space-y-2">
                {lastTransaction.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.weight && (
                        <p className="text-xs text-muted-foreground">{item.weight}</p>
                      )}
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
                  <span>Rp {lastTransaction.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar:</span>
                  <span>Rp {lastTransaction.customerMoney.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian:</span>
                  <span>Rp {lastTransaction.change.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>Terima kasih atas kunjungan Anda!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
