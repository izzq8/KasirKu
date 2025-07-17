"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react"
import * as XLSX from "xlsx"
import { supabase } from "@/lib/supabase"

interface ExcelProduct {
  nama: string
  berat_ukuran: string
  harga: number
  stok: number
  status?: "valid" | "invalid" | "duplicate"
  error?: string
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

interface ExcelImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

export function ExcelImportDialog({ open, onOpenChange, onImportComplete }: ExcelImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "result">("upload")
  const [excelData, setExcelData] = useState<ExcelProduct[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importCancelled, setImportCancelled] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const downloadTemplate = () => {
    const templateData = [
      ["Nama Produk", "Berat/Ukuran", "Harga", "Stok"],
      ["Beras Premium", "5kg", 75000, 50],
      ["Minyak Goreng", "1L", 15000, 30],
      ["Gula Pasir", "1kg", 12000, 25],
      ["Telur Ayam", "1kg", 28000, 40],
      ["Susu UHT", "1L", 18000, 35],
      ["Tepung Terigu", "1kg", 8000, 60],
      ["Kopi Bubuk", "200g", 25000, 20],
      ["Teh Celup", "25 sachet", 12000, 45],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)

    // Set column widths
    ws["!cols"] = [{ width: 20 }, { width: 15 }, { width: 12 }, { width: 10 }]

    // Style header row
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" },
    }

    // Apply header styling
    for (let col = 0; col < 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!ws[cellRef]) ws[cellRef] = {}
      ws[cellRef].s = headerStyle
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template Produk")
    XLSX.writeFile(wb, "template-produk.xlsx")

    toast({
      title: "Berhasil",
      description: "Template Excel berhasil didownload",
    })
  }

  const validateExcelData = async (data: ExcelProduct[]) => {
    setIsValidating(true)

    try {
      if (!supabase) {
        toast({
          title: "Error",
          description: "Database tidak tersedia",
          variant: "destructive",
        })
        return
      }

      // Get existing products from database
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: existingProducts, error } = await supabase
        .from("products")
        .select("name, weight")
        .eq("user_id", user.id)

      if (error) throw error

      // Create a set of existing product combinations for faster lookup
      const existingProductSet = new Set(
        (existingProducts || []).map((p) => `${p.name.toLowerCase().trim()}|${p.weight.toLowerCase().trim()}`),
      )

      // Track duplicates within the Excel file itself
      const excelProductSet = new Set<string>()

      // Validate each product
      const validatedData = data.map((product, index) => {
        const productKey = `${product.nama.toLowerCase().trim()}|${product.berat_ukuran.toLowerCase().trim()}`

        // Basic validation
        if (!product.nama.trim()) {
          return { ...product, status: "invalid" as const, error: "Nama produk tidak boleh kosong" }
        }

        if (!product.berat_ukuran.trim()) {
          return { ...product, status: "invalid" as const, error: "Berat/ukuran tidak boleh kosong" }
        }

        if (isNaN(product.harga) || product.harga <= 0) {
          return { ...product, status: "invalid" as const, error: "Harga harus berupa angka lebih dari 0" }
        }

        if (isNaN(product.stok) || product.stok < 0) {
          return { ...product, status: "invalid" as const, error: "Stok harus berupa angka tidak negatif" }
        }

        // Check for duplicates in database
        if (existingProductSet.has(productKey)) {
          return {
            ...product,
            status: "duplicate" as const,
            error: "Produk dengan nama dan berat/ukuran yang sama sudah ada di database",
          }
        }

        // Check for duplicates within Excel file
        if (excelProductSet.has(productKey)) {
          return {
            ...product,
            status: "duplicate" as const,
            error: "Produk duplikat ditemukan dalam file Excel",
          }
        }

        excelProductSet.add(productKey)
        return { ...product, status: "valid" as const }
      })

      setExcelData(validatedData)
    } catch (error) {
      console.error("Error validating data:", error)
      toast({
        title: "Error",
        description: "Gagal memvalidasi data Excel",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Error",
        description: "File harus berformat .xlsx atau .xls",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          toast({
            title: "Error",
            description: "File Excel harus memiliki minimal 1 baris data (selain header)",
            variant: "destructive",
          })
          return
        }

        // Process data starting from row 2 (skip header)
        const processedData: ExcelProduct[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]

          // Skip empty rows
          if (!row || row.length === 0 || row.every((cell) => !cell)) continue

          // Ensure we have at least 4 columns
          if (row.length < 4) {
            console.warn(`Row ${i + 1} has insufficient columns, skipping`)
            continue
          }

          const product: ExcelProduct = {
            nama: String(row[0] || "").trim(),
            berat_ukuran: String(row[1] || "").trim(),
            harga: Number(row[2]) || 0,
            stok: Number(row[3]) || 0,
          }

          processedData.push(product)
        }

        if (processedData.length === 0) {
          toast({
            title: "Error",
            description: "Tidak ada data valid yang ditemukan dalam file Excel",
            variant: "destructive",
          })
          return
        }

        // Validate the processed data
        await validateExcelData(processedData)
        setCurrentStep("preview")

        toast({
          title: "Berhasil",
          description: `${processedData.length} baris data berhasil dibaca dari Excel`,
        })
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        toast({
          title: "Error",
          description: "Gagal membaca file Excel. Pastikan format file benar.",
          variant: "destructive",
        })
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    const validData = excelData.filter((item) => item.status === "valid")

    if (validData.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data valid untuk diimport",
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

    setIsImporting(true)
    setImportCancelled(false)
    setImportProgress(0)
    setCurrentStep("result")

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const batchSize = 10
      const totalBatches = Math.ceil(validData.length / batchSize)

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Check if import was cancelled
        if (importCancelled) {
          result.errors.push("Import dibatalkan oleh pengguna")
          break
        }

        const startIndex = batchIndex * batchSize
        const endIndex = Math.min(startIndex + batchSize, validData.length)
        const batch = validData.slice(startIndex, endIndex)

        const insertData = batch.map((item) => ({
          name: item.nama,
          weight: item.berat_ukuran,
          price: item.harga,
          stock: item.stok,
          user_id: user.id,
        }))

        try {
          const { error } = await supabase.from("products").insert(insertData)

          if (error) {
            console.error("Batch import error:", error)
            result.failed += batch.length
            result.errors.push(`Batch ${batchIndex + 1}: ${error.message}`)
          } else {
            result.success += batch.length
          }
        } catch (batchError) {
          console.error("Batch error:", batchError)
          result.failed += batch.length
          result.errors.push(`Batch ${batchIndex + 1}: ${batchError}`)
        }

        // Update progress
        const progress = ((batchIndex + 1) / totalBatches) * 100
        setImportProgress(progress)

        // Small delay to show progress and allow cancellation
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setImportResult(result)

      if (importCancelled) {
        toast({
          title: "Import Dibatalkan",
          description: `Import dibatalkan. ${result.success} produk berhasil diimport sebelum dibatalkan.`,
          variant: "destructive",
        })
      } else if (result.success > 0) {
        toast({
          title: "Import Selesai",
          description: `${result.success} produk berhasil diimport${result.failed > 0 ? `, ${result.failed} gagal` : ""}`,
        })
        onImportComplete()
      } else {
        toast({
          title: "Import Gagal",
          description: "Tidak ada produk yang berhasil diimport",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      result.failed = validData.length
      result.errors.push(`Error umum: ${error}`)
      setImportResult(result)

      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengimport data",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      setImportCancelled(false)
    }
  }

  const handleCancelImport = () => {
    setImportCancelled(true)
    toast({
      title: "Membatalkan Import",
      description: "Sedang membatalkan proses import...",
    })
  }

  const handleCancelPreview = () => {
    setCurrentStep("upload")
    setExcelData([])
    setIsValidating(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast({
      title: "Data Dibatalkan",
      description: "Data Excel telah dibatalkan dan dihapus",
    })
  }

  const handleClose = () => {
    setCurrentStep("upload")
    setExcelData([])
    setImportResult(null)
    setImportProgress(0)
    setIsImporting(false)
    setIsValidating(false)
    setImportCancelled(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onOpenChange(false)
  }

  const validCount = excelData.filter((item) => item.status === "valid").length
  const duplicateCount = excelData.filter((item) => item.status === "duplicate").length
  const invalidCount = excelData.filter((item) => item.status === "invalid").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Import Produk dari Excel</DialogTitle>
          <p className="text-sm text-muted-foreground">Upload file Excel untuk menambahkan produk secara massal</p>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex-shrink-0 border-b">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentStep === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => currentStep !== "result" && setCurrentStep("upload")}
              disabled={isImporting}
            >
              Upload File
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentStep === "preview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => excelData.length > 0 && currentStep !== "result" && setCurrentStep("preview")}
              disabled={excelData.length === 0 || isImporting}
            >
              Preview Data
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentStep === "result"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              disabled
            >
              Hasil Import
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Upload Step */}
              {currentStep === "upload" && (
                <div className="space-y-6">
                  {/* Download Template */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Download className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-900">Download Template Excel</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Download template Excel dengan format yang benar untuk memudahkan input data produk
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadTemplate}
                          className="mt-3 border-blue-200 text-blue-700 hover:bg-blue-100 bg-transparent"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Format Information */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Format Excel yang Diperlukan:</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-medium">Kolom A</TableHead>
                            <TableHead className="font-medium">Kolom B</TableHead>
                            <TableHead className="font-medium">Kolom C</TableHead>
                            <TableHead className="font-medium">Kolom D</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Nama Produk</TableCell>
                            <TableCell className="font-medium">Berat/Ukuran</TableCell>
                            <TableCell className="font-medium">Harga</TableCell>
                            <TableCell className="font-medium">Stok</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Beras Premium</TableCell>
                            <TableCell>5kg</TableCell>
                            <TableCell>75000</TableCell>
                            <TableCell>50</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Minyak Goreng</TableCell>
                            <TableCell>1L</TableCell>
                            <TableCell>15000</TableCell>
                            <TableCell>30</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div>
                      <Label htmlFor="excel-file" className="cursor-pointer">
                        <span className="text-lg font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                          Upload File Excel
                        </span>
                        <p className="text-sm text-gray-500 mt-1">Pilih file .xlsx atau .xls dari komputer Anda</p>
                      </Label>
                      <Input
                        id="excel-file"
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Pilih File Excel
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Format yang didukung: .xlsx, .xls (maksimal 5MB)</p>
                  </div>

                  {/* Important Notes */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Catatan Penting:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>Pastikan file Excel menggunakan format template yang disediakan</li>
                        <li>Nama produk dan berat/ukuran tidak boleh kosong</li>
                        <li>Harga harus berupa angka dan lebih dari 0</li>
                        <li>Stok harus berupa angka dan tidak boleh negatif</li>
                        <li>Baris pertama akan diabaikan (header)</li>
                        <li>Sistem akan mendeteksi produk duplikat secara otomatis</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Preview Step */}
              {currentStep === "preview" && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {validCount} produk valid
                      </Badge>
                      {duplicateCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-200"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {duplicateCount} produk duplikat
                        </Badge>
                      )}
                      {invalidCount > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {invalidCount} produk invalid
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelPreview}
                        disabled={isValidating}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <X className="h-4 w-4" />
                        Batal
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={validCount === 0 || isValidating}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Import {validCount} Produk
                      </Button>
                    </div>
                  </div>

                  {/* Validation Loading */}
                  {isValidating && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Memvalidasi data...</p>
                    </div>
                  )}

                  {/* Data Preview Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50 z-10">
                          <TableRow>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-[200px]">Nama Produk</TableHead>
                            <TableHead className="min-w-[120px]">Berat/Ukuran</TableHead>
                            <TableHead className="min-w-[100px]">Harga</TableHead>
                            <TableHead className="min-w-[80px]">Stok</TableHead>
                            <TableHead className="min-w-[250px]">Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {excelData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {item.status === "valid" && (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Valid
                                  </Badge>
                                )}
                                {item.status === "duplicate" && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                  >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Duplikat
                                  </Badge>
                                )}
                                {item.status === "invalid" && (
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Invalid
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{item.nama}</TableCell>
                              <TableCell>{item.berat_ukuran}</TableCell>
                              <TableCell>Rp {item.harga.toLocaleString("id-ID")}</TableCell>
                              <TableCell>{item.stok}</TableCell>
                              <TableCell className="text-red-600 text-sm">{item.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {excelData.length > 50 && (
                      <div className="p-3 text-center text-sm text-muted-foreground bg-gray-50 border-t">
                        Menampilkan semua {excelData.length} data
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {(duplicateCount > 0 || invalidCount > 0) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {duplicateCount > 0 && <p>Terdapat {duplicateCount} produk duplikat yang akan dilewati.</p>}
                        {invalidCount > 0 && (
                          <p>Terdapat {invalidCount} produk dengan data tidak valid yang akan dilewati.</p>
                        )}
                        <p className="mt-1">Hanya {validCount} produk valid yang akan diimport.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Result Step */}
              {currentStep === "result" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      {isImporting ? "Sedang Mengimport..." : "Hasil Import"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isImporting ? "Proses import sedang berlangsung" : "Ringkasan proses import produk"}
                    </p>
                  </div>

                  {/* Progress */}
                  {isImporting && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Mengimport data...</span>
                          <span>{Math.round(importProgress)}%</span>
                        </div>
                        <Progress value={importProgress} className="w-full" />
                      </div>
                      <div className="text-center">
                        <Button
                          variant="destructive"
                          onClick={handleCancelImport}
                          disabled={importCancelled}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          {importCancelled ? "Membatalkan..." : "Batalkan Import"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {importResult && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-6 text-center bg-green-50 border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-2">{importResult.success}</div>
                        <p className="text-green-800 font-medium">Produk berhasil diimport</p>
                      </div>
                      <div className="border rounded-lg p-6 text-center bg-red-50 border-red-200">
                        <div className="text-3xl font-bold text-red-600 mb-2">{importResult.failed}</div>
                        <p className="text-red-800 font-medium">Produk gagal diimport</p>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {importResult && importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Error yang terjadi:
                      </h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-auto">
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                          {importResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {importResult.errors.length > 10 && (
                            <li className="text-red-600">... dan {importResult.errors.length - 10} error lainnya</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!isImporting && (
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" onClick={handleClose}>
                        Selesai
                      </Button>
                      {importResult && importResult.success > 0 && (
                        <Button
                          onClick={() => {
                            handleClose()
                            onImportComplete()
                          }}
                        >
                          Lihat Produk
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
