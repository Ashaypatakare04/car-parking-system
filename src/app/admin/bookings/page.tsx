"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Booking } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Activity, Clock } from "lucide-react"

export default function AdminBookings() {
  const { user } = useAppStore()
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "bookings"),
      where("status", "==", "active"),
      orderBy("entryTime", "desc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setActiveBookings(snap.docs.map(d => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          entryTime: data.entryTime?.toDate(),
          exitTime: data.exitTime?.toDate() || null
        } as Booking
      }))
      setLoading(false)
    })
    return () => unsub()
  }, [user])

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
        <Activity className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Active Bookings</h1>
          <p className="text-muted-foreground mt-1">Monitor currently parked vehicles across the facility.</p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Occupied Slots Overview</CardTitle>
          <CardDescription>Filtering strictly by sessions currently in progress.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeBookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No active sessions. The parking facility is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.map(b => (
                <div key={b.id} className="flex flex-col md:flex-row md:items-center justify-between border border-border rounded-xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 min-w-[2.5rem] px-2 bg-primary/10 text-primary font-bold rounded-lg flex items-center justify-center shrink-0 max-w-[150px] truncate text-xs sm:text-sm">
                      {b.slotId}
                    </div>
                    <div>
                      <h3 className="font-semibold uppercase tracking-wider">{b.vehicleNumber}</h3>
                      <p className="text-xs text-muted-foreground font-mono">User ID: {b.userId}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Entered at: {b.entryTime?.toLocaleTimeString()} - {b.entryTime?.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
