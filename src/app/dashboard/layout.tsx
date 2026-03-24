"use client"
import React, { useEffect } from "react"
import { Topbar } from "@/components/layout/Topbar"
import { useAppStore } from "@/lib/store"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore()

  useEffect(() => {
    // Ensure the light theme applies correctly to the dashboard
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center">
      <Topbar />
      <main className="flex-1 w-full max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
