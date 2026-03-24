"use client"
import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useAppStore } from "@/lib/store"
import { Car } from "lucide-react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser } = useAppStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Only fetch if not already in global state to prevent unnecessary reads
        if (!user || user.id !== firebaseUser.uid) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              setUser({
                id: firebaseUser.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                createdAt: userData.createdAt?.toDate() || new Date(),
              })
            }
          } catch (e) {
            console.error("Failed to fetch user role", e)
          }
        }
      } else {
        setUser(null)
      }
      setIsInitializing(false)
    })

    return () => unsubscribe()
  }, [setUser, user])

  useEffect(() => {
    if (isInitializing) return

    const isAuthRoute = pathname.startsWith("/auth")
    const isDashboard = pathname.startsWith("/dashboard")
    const isAdmin = pathname.startsWith("/admin")

    if (!user && (isDashboard || isAdmin)) {
      router.replace("/auth")
    } else if (user) {
      if (isAuthRoute) {
        // Redirect authenticated users away from auth
        router.replace(user.role === "admin" ? "/admin" : "/dashboard")
      } else if (isAdmin && user.role !== "admin") {
        // Restrict regular users from admin
        router.replace("/dashboard")
      } else if (isDashboard && user.role === "admin") {
        // Optional: admins could access dashboard, but let's push them to admin naturally
        // Or keep it allowing admins to see dashboard too.
        // For strict routing: router.replace("/admin")
      }
    }
  }, [user, isInitializing, pathname, router])

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Car className="h-12 w-12 text-primary animate-bounce delay-100" />
          <p className="text-muted-foreground font-medium">Loading ParkFlow...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
