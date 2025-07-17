"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SetupResult {
  step: string
  success: boolean
  error?: string
}

export function DatabaseSetup() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<SetupResult[]>([])
  const [currentStep, setCurrentStep] = useState("")

  const setupSteps = [
    { name: "Membuat tabel database", sql: "create-tables" },
    { name: "Mengatur keamanan (RLS)", sql: "setup-rls" },
    { name: "Menambah data sample", sql: "seed-data" },
  ]

  const runSetup = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults([])

    try {
      const newResults: SetupResult[] = []

      // Step 1: Create tables
      setCurrentStep("Membuat tabel database...")
      setProgress(20)

      const createTablesSQL = `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID REFERENCES auth.users(id) PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create products table
        CREATE TABLE IF NOT EXISTS public.products (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          stock INTEGER DEFAULT 0,
          category TEXT,
          barcode TEXT UNIQUE,
          image_url TEXT,
          is_active BOOLEAN DEFAULT true,
          created_by UUID REFERENCES public.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create transactions table
        CREATE TABLE IF NOT EXISTS public.transactions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          transaction_number TEXT UNIQUE NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          payment_method TEXT DEFAULT 'cash',
          payment_amount DECIMAL(10,2),
          change_amount DECIMAL(10,2) DEFAULT 0,
          status TEXT DEFAULT 'completed',
          notes TEXT,
          cashier_id UUID REFERENCES public.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create transaction_items table
        CREATE TABLE IF NOT EXISTS public.transaction_items (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
          product_id UUID REFERENCES public.products(id),
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      const { error: createError } = await supabase.rpc("exec_sql", {
        sql_query: createTablesSQL,
      })

      if (createError) {
        newResults.push({ step: "Membuat tabel", success: false, error: createError.message })
      } else {
        newResults.push({ step: "Membuat tabel", success: true })
      }

      // Step 2: Setup RLS
      setCurrentStep("Mengatur keamanan...")
      setProgress(50)

      const rlsSQL = `
        -- Enable Row Level Security
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
      `

      const { error: rlsError } = await supabase.rpc("exec_sql", {
        sql_query: rlsSQL,
      })

      if (rlsError) {
        newResults.push({ step: "Setup RLS", success: false, error: rlsError.message })
      } else {
        newResults.push({ step: "Setup RLS", success: true })
      }

      // Step 3: Seed data
      setCurrentStep("Menambah data sample...")
      setProgress(80)

      const { error: seedError } = await supabase.from("products").upsert(
        [
          { name: "Nasi Putih", price: 5000, stock: 100, category: "Makanan", barcode: "1001" },
          { name: "Ayam Goreng", price: 15000, stock: 50, category: "Makanan", barcode: "1002" },
          { name: "Es Teh Manis", price: 3000, stock: 200, category: "Minuman", barcode: "2001" },
          { name: "Es Jeruk", price: 4000, stock: 150, category: "Minuman", barcode: "2002" },
          { name: "Kerupuk", price: 2000, stock: 300, category: "Snack", barcode: "3001" },
        ],
        { onConflict: "barcode" },
      )

      if (seedError) {
        newResults.push({ step: "Seed data", success: false, error: seedError.message })
      } else {
        newResults.push({ step: "Seed data", success: true })
      }

      setProgress(100)
      setCurrentStep("Setup selesai!")
      setResults(newResults)
    } catch (error: any) {
      console.error("Setup error:", error)
      setResults([{ step: "Setup", success: false, error: error.message }])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Setup Database</CardTitle>
          <CardDescription>Inisialisasi database untuk sistem POS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isRunning && results.length === 0 && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Klik tombol di bawah untuk memulai setup database</p>
              <Button onClick={runSetup} className="bg-blue-600 hover:bg-blue-700">
                Mulai Setup Database
              </Button>
            </div>
          )}

          {isRunning && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{currentStep}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex items-center justify-center text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memproses...
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Hasil Setup:</h3>
              {results.map((result, index) => (
                <Alert
                  key={index}
                  className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                      <strong>{result.step}:</strong> {result.success ? "Berhasil" : `Gagal - ${result.error}`}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}

              {results.every((r) => r.success) && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Setup berhasil!</strong> Database siap digunakan.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
