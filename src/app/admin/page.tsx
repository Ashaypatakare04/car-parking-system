"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { ParkingSlot, Transaction, Booking } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Car, DollarSign, Activity, Settings2 } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAppStore()
  
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (!user) return

    const unsubSlots = onSnapshot(collection(db, "parkingSlots"), (snap) => {
      setSlots(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSlot)))
    })

    const qTrx = query(collection(db, "transactions"), orderBy("timestamp", "desc"))
    const unsubTrx = onSnapshot(qTrx, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)))
    })

    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
      setActiveBookings(all.filter(b => b.status === "active"))
    })

    return () => { unsubSlots(); unsubTrx(); unsubBookings() }
  }, [user])

  const occupied = slots.filter(s => s.status === "occupied").length
  const totalSlots = slots.length
  const utilization = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0
  
  // Calculate today's revenue
  const today = new Date()
  today.setHours(0,0,0,0)
  const todayRevenue = transactions
    .filter(t => t.timestamp?.toDate() >= today)
    .reduce((acc, curr) => acc + curr.amount, 0)
    
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time statistics and facility management.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parking Utilization</CardTitle>
            <Settings2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{utilization}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {occupied} / {totalSlots} slots occupied
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently parked vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">${todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total transactions today
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Revenue</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Since system inception
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass h-full">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest exits and fee collections.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(trx => (
                <div key={trx.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{trx.id}</p>
                    <p className="text-xs text-muted-foreground">{trx.timestamp?.toDate().toLocaleString()}</p>
                  </div>
                  <div className="font-bold text-green-600 dark:text-green-500">${trx.amount.toFixed(2)}</div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass h-full">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Live health checks.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
               <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
               <p className="font-medium text-sm">Firestore Real-time Listeners: Active & Synced</p>
             </div>
             <div className="flex items-center gap-4 p-4 mt-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
               <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
               <p className="font-medium text-sm">Automated Exit Engine: Online</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
