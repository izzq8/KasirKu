"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Package, ShoppingCart, History, BarChart3, LogOut, Menu, X } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface SidebarProps {
  user: SupabaseUser
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  isMobile?: boolean
}

export function Sidebar({ user, activeTab, onTabChange, onLogout, isMobile = false }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "pos", label: "Transaksi", icon: ShoppingCart },
    { id: "products", label: "Produk", icon: Package },
    { id: "history", label: "Riwayat", icon: History },
    { id: "reports", label: "Laporan", icon: BarChart3 },
  ]

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "User"
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">KasirKu</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100"
                    } ${isCollapsed ? "px-2" : "px-3"}`}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Avatar className="w-10 h-10 mx-auto">
                <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 px-2 bg-transparent"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
