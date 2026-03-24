"use client"
import React, { useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { useAppStore } from "@/lib/store"
import { Menu } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, setSidebarOpen } = useAppStore()

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header for Admin */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold">Admin Panel</span>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
