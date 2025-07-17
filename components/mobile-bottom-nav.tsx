import { Button } from "@/components/ui/button"
import { Home, Package, ShoppingCart, History, BarChart3 } from "lucide-react"

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const menuItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "pos", label: "Kasir", icon: ShoppingCart },
    { id: "products", label: "Produk", icon: Package },
    { id: "history", label: "Riwayat", icon: History },
    { id: "reports", label: "Laporan", icon: BarChart3 },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-30">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center h-16 text-xs p-1 touch-target ${
                isActive 
                  ? "bg-blue-50 text-blue-600 border-t-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
              <span className={`${isActive ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                {item.label}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
