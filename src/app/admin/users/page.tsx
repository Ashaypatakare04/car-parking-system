"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Users, Shield, User as UserIcon, AlertCircle } from "lucide-react"

export default function AdminUsers() {
  const { user: currentUser } = useAppStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate() || new Date()
        } as User
      }))
      setLoading(false)
    })
    return () => unsub()
  }, [currentUser])

  const toggleRole = async (targetUser: User) => {
    // Prevent an admin from demoting themselves by accident to keep from getting locked out
    if (targetUser.id === currentUser?.id) {
      alert("You cannot modify your own absolute admin privileges here.")
      return
    }

    try {
      const newRole = targetUser.role === "admin" ? "user" : "admin"
      await updateDoc(doc(db, "users", targetUser.id), { role: newRole })
    } catch (err: any) {
      alert(err.message || "Failed to update user role")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Review registered accounts and manage administrative access.</p>
        </div>
      </div>

      <Card className="glass shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>System Accounts</CardTitle>
              <CardDescription>Total platform presence: {users.length}</CardDescription>
            </div>
            <div className="flex gap-2 text-xs font-semibold text-muted-foreground bg-muted p-1 px-3 rounded-full">
              <span className="text-primary">{users.filter(u => u.role === "admin").length} Admins</span>
              <span>•</span>
              <span>{users.filter(u => u.role === "user").length} Users</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_1fr_120px] items-center p-4 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Account</span>
              <span>Email & ID</span>
              <span>Joined</span>
              <span className="text-right">Access</span>
            </div>
            
            <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
              {users.map((targetUser) => {
                const isAdmin = targetUser.role === "admin"
                const isSelf = targetUser.id === currentUser?.id
                
                return (
                  <div key={targetUser.id} className="grid grid-cols-[1fr_2fr_1fr_120px] items-center p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full ${isAdmin ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isAdmin ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                      </div>
                      <div className="font-semibold">{targetUser.name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">{targetUser.email}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{targetUser.id}</div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {targetUser.createdAt.toLocaleDateString()}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant={isAdmin ? "default" : "outline"}
                        size="sm"
                        disabled={isSelf}
                        onClick={() => toggleRole(targetUser)}
                        className={`w-28 text-xs font-bold ${isAdmin ? 'bg-primary hover:bg-destructive shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-dashed hover:border-primary hover:text-primary'} ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isAdmin ? "Admin" : "Promote"}
                      </Button>
                    </div>
                  </div>
                )
              })}
              
              {users.length === 0 && (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <AlertCircle className="h-8 w-8 mb-4 opacity-30" />
                  <p>No user accounts have been registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
