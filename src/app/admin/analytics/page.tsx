"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Booking, Transaction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { BarChart3, Clock, TrendingUp, DollarSign } from "lucide-react"

export default function AdminAnalytics() {
  const { user } = useAppStore()

  const [totalBookings, setTotalBookings] = useState(0)
  const [avgDuration, setAvgDuration] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  // Quick pseudo-chart data distribution (e.g. Activity over last 7 days)
  const [chartBars, setChartBars] = useState<number[]>([10, 24, 45, 12, 67, 34, 89])

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const trxsShot = await getDocs(collection(db, "transactions"))
        let rev = 0
        trxsShot.forEach(d => { rev += (d.data() as Transaction).amount })
        setRevenue(rev)

        const bkShot = await getDocs(query(collection(db, "bookings"), orderBy("entryTime", "asc")))
        const bks = bkShot.docs.map(t => {
          const data = t.data()
          return {
            ...data,
            id: t.id,
            entryTime: data.entryTime?.toDate(),
            exitTime: data.exitTime?.toDate() || null
          } as Booking
        })
        setTotalBookings(bks.length)

        // Calc Avg Duration for completed bookings
        let totalHrs = 0
        let completedCount = 0

        // Count trailing 7 days activity
        const recent7 = [0, 0, 0, 0, 0, 0, 0]
        const now = new Date()

        bks.forEach(b => {
          const entry = b.entryTime

          if (b.status === "completed" && entry && b.exitTime) {
            const exit = b.exitTime
            const hrs = (exit.getTime() - entry.getTime()) / (1000 * 60 * 60)
            totalHrs += hrs > 0 ? hrs : 1
            completedCount++
          }

          if (entry) {
            const diffDays = Math.floor((now.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays >= 0 && diffDays < 7) {
              recent7[6 - diffDays]++
            }
          }
        })

        setAvgDuration(completedCount > 0 ? (totalHrs / completedCount) : 0)

        // Normalize Chart Bars
        const maxActivity = Math.max(...recent7) || 1
        setChartBars(recent7.map(count => (count / maxActivity) * 100))

        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    loadData()
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
        <div className="p-3 bg-primary/10 rounded-xl">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into revenue trends and system metrics.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-blue-500/20 shadow-lg shadow-blue-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Operations</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalBookings}</div>
            <p className="text-sm text-muted-foreground mt-1">Lifetime parking sessions</p>
          </CardContent>
        </Card>

        <Card className="glass border-orange-500/20 shadow-lg shadow-orange-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Avg. Duration</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{avgDuration.toFixed(1)}<span className="text-xl text-muted-foreground ml-1 font-semibold">hrs</span></div>
            <p className="text-sm text-muted-foreground mt-1">Per completed session</p>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20 shadow-lg shadow-green-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Gross Volume</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-green-500">${revenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">All processed transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass mt-8 border-primary/20">
        <CardHeader>
          <CardTitle>7-Day Activity Trend</CardTitle>
          <CardDescription>Relative frequency of vehicle entries over the last week.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 mt-6">
            {chartBars.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-muted rounded-t-md overflow-hidden flex items-end h-48 border-b border-border">
                  <div
                    className="w-full bg-primary/40 group-hover:bg-primary transition-all duration-500 rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
