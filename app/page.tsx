"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { getCurrentUser } from "@/lib/supabase"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")

  useEffect(() => {
    // Check Supabase availability
    if (!isSupabaseAvailable()) {
      setError("Konfigurasi Supabase tidak tersedia.")
      setConnectionStatus("error")
      setLoading(false)
      return
    }

    // Test connection and initialize auth
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Test basic connection
      await testConnection()

      // Check initial auth state
      await checkAuthStatus()

      // Set up auth listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email)

        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user)
          setError(null)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
        }

        setLoading(false)
      })

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe()
      }
    } catch (err: any) {
      console.error("App initialization failed:", err)
      setError(`Gagal menginisialisasi aplikasi: ${err.message}`)
      setConnectionStatus("error")
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      // Simple test to check if Supabase is reachable
      const { error } = await supabase.from("users").select("count").limit(1)

      if (error && !error.message.includes("relation") && !error.message.includes("does not exist")) {
        console.log("Connection test failed:", error.message)
        throw new Error(error.message)
      }

      setConnectionStatus("connected")
      console.log("Supabase connection successful")
    } catch (err: any) {
      console.error("Connection test failed:", err)
      setConnectionStatus("error")
      throw new Error(`Koneksi database gagal: ${err.message}`)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const { user: currentUser, error: authError } = await getCurrentUser()

      // Handle auth errors - but missing session is not an error
      if (authError) {
        // Only treat actual errors as errors, not missing sessions
        if (authError.message !== "Auth session missing!" && !authError.message.includes("session")) {
          console.error("Auth error:", authError)
          throw new Error(`Kesalahan autentikasi: ${authError.message}`)
        }
        // Missing session is normal - user just isn't logged in
        console.log("No active session - user not logged in")
      }

      setUser(currentUser)
      setError(null)
    } catch (error: any) {
      console.error("Auth check error:", error)
      setError(error.message || "Terjadi kesalahan saat memeriksa autentikasi.")
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (userData: User) => {
    console.log("Login success, setting user:", userData.email)
    setUser(userData)
    setError(null)
    setLoading(false)
  }

  const handleLogout = () => {
    console.log("Logging out user")
    setUser(null)
    setError(null)
  }

  // Show loading while checking connection
  if (loading && connectionStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Menghubungkan ke database...</p>
        </div>
      </div>
    )
  }

  // Show error if connection failed
  if (error || connectionStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Kesalahan Koneksi:</strong>
              <br />
              {error || "Tidak dapat terhubung ke database."}
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
            <p className="text-sm text-gray-600">Pastikan koneksi internet Anda stabil</p>
          </div>
        </div>
      </div>
    )
  }

  // Show app content when connected
  if (connectionStatus === "connected") {
    return (
      <div className="min-h-screen">
        {/* Connection Status Indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Terhubung</span>
          </div>
        </div>

        {loading ? (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat aplikasi...</p>
            </div>
          </div>
        ) : !user ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  )
}
