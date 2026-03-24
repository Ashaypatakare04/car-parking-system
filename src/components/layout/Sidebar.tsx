"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { auth } from "@/lib/firebase/config"
import { signOut } from "firebase/auth"
import { LayoutDashboard, CarFront, History, Users, BarChart3, Settings, LogOut, X, Map } from "lucide-react"
import { cn } from "@/lib/utils"

export const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen, setUser } = useAppStore()

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Slots Management", href: "/admin/slots", icon: CarFront },
    { name: "Active Bookings", href: "/admin/bookings", icon: History },
    { name: "Heatmap", href: "/admin/heatmap", icon: Map },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
    router.push("/auth")
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border bg-card transition-transform duration-300 md:static md:flex md:translate-x-0 h-screen",
          sidebarOpen ? "flex translate-x-0" : "-translate-x-full hidden"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">ParkFlow <span className="opacity-60 text-sm">ADMIN</span></span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
