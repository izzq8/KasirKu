"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { DashboardHome } from "@/components/dashboard-home"
import { ProductManagement } from "@/components/product-management"
import { POSInterface } from "@/components/pos-interface"
import { TransactionHistory } from "@/components/transaction-history"
import { Reports } from "@/components/reports"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load data from localStorage (fallback for offline mode)
    const savedProducts = localStorage.getItem("pos_products")
    const savedTransactions = localStorage.getItem("pos_transactions")

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts)
        setProducts(Array.isArray(parsedProducts) ? parsedProducts : [])
      } catch (error) {
        console.error("Error parsing saved products:", error)
        setProducts([])
      }
    }

    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions)
        setTransactions(Array.isArray(parsedTransactions) ? parsedTransactions : [])
      } catch (error) {
        console.error("Error parsing saved transactions:", error)
        setTransactions([])
      }
    }
  }, [])

  const updateProducts = (newProducts: any[]) => {
    const safeProducts = Array.isArray(newProducts) ? newProducts : []
    setProducts(safeProducts)
    localStorage.setItem("pos_products", JSON.stringify(safeProducts))
  }

  const addTransaction = (transaction: any) => {
    if (!transaction) return

    const newTransactions = [...transactions, transaction]
    setTransactions(newTransactions)
    localStorage.setItem("pos_transactions", JSON.stringify(newTransactions))
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      })

      onLogout()
    } catch (error: any) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Gagal logout: " + error.message,
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome user={user} transactions={transactions} products={products} onNavigate={setActiveTab} />
      case "products":
        return <ProductManagement />
      case "pos":
        return (
          <POSInterface
            user={user}
            products={products}
            onAddTransaction={addTransaction}
            onUpdateProducts={updateProducts}
          />
        )
      case "history":
        return <TransactionHistory user={user} transactions={transactions} />
      case "reports":
        return <Reports user={user} transactions={transactions} products={products} />
      default:
        return <DashboardHome user={user} transactions={transactions} products={products} onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onLogout={handleLogout} 
          isMobile={false}
        />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onLogout={handleLogout} 
          isMobile={true}
        />
      </div>
      
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-3 sm:p-4 lg:p-6">{renderContent()}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
    </div>
  )
}
