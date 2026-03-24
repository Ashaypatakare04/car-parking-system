"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase/config"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Car } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"user" | "admin">("user")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login Flow
        const userCred = await signInWithEmailAndPassword(auth, email, password)
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, "users", userCred.user.uid))
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            id: userCred.user.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt?.toDate() || new Date(),
          })
          
          if (userData.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        } else {
          setError("User data not found in database.")
        }
      } else {
        // Registration Flow
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCred.user, { displayName: name })
        
        const timestamp = new Date()
        
        // Save to Firestore
        await setDoc(doc(db, "users", userCred.user.uid), {
          id: userCred.user.uid,
          name: name,
          email: email,
          role: role,
          createdAt: timestamp,
        })

        setUser({
          id: userCred.user.uid,
          name: name,
          email: email,
          role: role,
          createdAt: timestamp,
        })

        if (role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred during authentication.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="hidden lg:flex relative w-1/2 items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[url('/auth.png')] bg-cover bg-center opacity-80 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent mix-blend-overlay z-0" />
        <div className="relative z-10 w-full max-w-md p-10 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-white text-black rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">ParkFlow</h2>
          </div>
          <p className="text-lg text-white/70 leading-relaxed">
            Intelligent serverless parking solutions. Real-time slot management, live Heatmaps, and automated fee processing.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 pattern-grid-lg sm:p-12 relative">
        <Card className="relative z-10 w-full max-w-md border-border glass shadow-2xl">
          <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to start managing your parking experience"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {!isLogin && (
              <div className="flex gap-2 p-1 bg-muted rounded-lg border border-border mt-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    role === "user" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Regular User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    role === "admin" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admin
                </button>
              </div>
            )}

            {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
