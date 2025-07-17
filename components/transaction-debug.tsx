"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, ensureUserExists } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, User, Database } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface TransactionDebugProps {
  user: SupabaseUser
}

export function TransactionDebug({ user }: TransactionDebugProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [userStatus, setUserStatus] = useState<"checking" | "exists" | "missing" | "error">("checking")
  const [lastError, setLastError] = useState<string | null>(null)
  const [publicUser, setPublicUser] = useState<any>(null)
  const { toast } = useToast()

  const checkDatabaseConnection = async () => {
    setIsChecking(true)
    setConnectionStatus("checking")

    try {
      // Test database connection
      const { data, error } = await supabase.from("transactions").select("count").eq("user_id", user.id).limit(1)

      if (error) {
        throw error
      }

      setConnectionStatus("connected")
      setLastError(null)

      toast({
        title: "Koneksi Database OK",
        description: "Database dapat diakses dengan normal",
      })
    } catch (error: any) {
      console.error("Database connection error:", error)
      setConnectionStatus("error")
      setLastError(error.message)

      toast({
        title: "Koneksi Database Bermasalah",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const checkUserExists = async () => {
    setIsChecking(true)
    setUserStatus("checking")

    try {
      // Check if user exists in public.users
      const { data: existingUser, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (existingUser) {
        setUserStatus("exists")
        setPublicUser(existingUser)
        toast({
          title: "User Ditemukan",
          description: `User ${existingUser.email} ada di database`,
        })
      } else {
        setUserStatus("missing")
        setPublicUser(null)
        toast({
          title: "User Tidak Ditemukan",
          description: "User belum ada di tabel public.users",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("User check error:", error)
      setUserStatus("error")
      setLastError(error.message)

      toast({
        title: "Error Cek User",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const createUser = async () => {
    setIsChecking(true)

    try {
      await ensureUserExists(user)
      await checkUserExists() // Refresh user status

      toast({
        title: "User Berhasil Dibuat",
        description: "User telah ditambahkan ke database",
      })
    } catch (error: any) {
      console.error("Create user error:", error)
      toast({
        title: "Gagal Membuat User",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const testTransaction = async () => {
    setIsChecking(true)

    try {
      // Ensure user exists first
      await ensureUserExists(user)

      // Test creating a dummy transaction
      const testTransactionNumber = `TEST-${Date.now()}`

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            transaction_number: testTransactionNumber,
            total_amount: 1000,
            customer_money: 1000,
            change_amount: 0,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Clean up test transaction
      await supabase.from("transactions").delete().eq("id", data.id)

      toast({
        title: "Test Transaksi Berhasil",
        description: "Sistem transaksi berfungsi normal",
      })
    } catch (error: any) {
      console.error("Transaction test error:", error)
      toast({
        title: "Test Transaksi Gagal",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "exists":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
      case "missing":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string, type: "connection" | "user") => {
    switch (status) {
      case "connected":
      case "exists":
        return (
          <Badge variant="default" className="bg-green-500">
            {type === "connection" ? "Terhubung" : "Ada"}
          </Badge>
        )
      case "error":
      case "missing":
        return <Badge variant="destructive">{type === "connection" ? "Error" : "Tidak Ada"}</Badge>
      default:
        return <Badge variant="secondary">Memeriksa...</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnostic System
        </CardTitle>
        <CardDescription>Monitoring koneksi database dan status user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                {getStatusIcon(connectionStatus)}
                Database:
              </span>
              {getStatusBadge(connectionStatus, "connection")}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                {getStatusIcon(userStatus)}
                User Status:
              </span>
              {getStatusBadge(userStatus, "user")}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <strong>Auth User ID:</strong>
              <br />
              <code className="bg-gray-100 px-1 rounded">{user.id}</code>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Email:</strong>
              <br />
              {user.email}
            </div>
          </div>
        </div>

        {publicUser && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">✅ User Data di Database:</p>
            <div className="text-xs text-green-600 mt-1 space-y-1">
              <div>
                <strong>Username:</strong> {publicUser.username}
              </div>
              <div>
                <strong>Full Name:</strong> {publicUser.full_name || "Tidak ada"}
              </div>
              <div>
                <strong>Role:</strong> {publicUser.role}
              </div>
            </div>
          </div>
        )}

        {lastError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">❌ Error Terakhir:</p>
            <p className="text-xs text-red-600 mt-1">{lastError}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={checkDatabaseConnection} disabled={isChecking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            Cek DB
          </Button>

          <Button variant="outline" size="sm" onClick={checkUserExists} disabled={isChecking}>
            <User className="mr-2 h-4 w-4" />
            Cek User
          </Button>

          {userStatus === "missing" && (
            <Button variant="default" size="sm" onClick={createUser} disabled={isChecking} className="col-span-2">
              Buat User
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={testTransaction} disabled={isChecking} className="col-span-2">
            Test Transaksi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
