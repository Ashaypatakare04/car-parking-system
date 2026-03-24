"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { auth } from "@/lib/firebase/config"
import { signOut } from "firebase/auth"
import { Moon, Sun, LogOut, Menu, Car } from "lucide-react"
import { Button } from "../ui/Button"

export const Topbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, user, setUser, setSidebarOpen } = useAppStore()

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
    router.push("/auth")
  }

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    document.documentElement.classList.remove(theme)
    document.documentElement.classList.add(nextTheme)
  }

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Find Slot", href: "/dashboard/slots" },
    { name: "My Booking", href: "/dashboard/booking" },
    { name: "History", href: "/dashboard/history" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Sidebar Toggle & Logo */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight">
            <Car className="h-6 w-6 text-primary" />
            <span>Park<span className="opacity-70">Flow</span></span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-10 px-0">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user && (
            <div className="hidden md:flex items-center gap-4 ml-2">
              <span className="text-sm font-medium">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
