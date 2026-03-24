"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { collection, getDocs, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { ParkingSlot, Booking } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Map, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ParkingHeatmap() {
  const { user } = useAppStore()
  
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Load slots
    const qSlots = query(collection(db, "parkingSlots"), orderBy("slotNumber"))
    const unsubSlots = onSnapshot(qSlots, (snap) => {
      setSlots(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSlot)))
    })

    // Compute generic heatmap logic from historical bookings
    const computeHeatmap = async () => {
      try {
        const bookingsSnap = await getDocs(collection(db, "bookings"))
        const freq: Record<string, number> = {}
        let maxCount = 0

        bookingsSnap.forEach((doc) => {
          const b = doc.data() as Booking
          freq[b.slotId] = (freq[b.slotId] || 0) + 1
          if (freq[b.slotId] > maxCount) maxCount = freq[b.slotId]
        })

        // Normalize intensity 0.0 -> 1.0 based on relative max usage
        const intensityMap: Record<string, number> = {}
        for (const slotId in freq) {
          intensityMap[slotId] = maxCount > 0 ? freq[slotId] / maxCount : 0
        }
        setHeatmapData(intensityMap)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    computeHeatmap()

    return () => unsubSlots()
  }, [user])

  // Map intensity 0-1 to a color scale (blue -> red)
  const getBackgroundColor = (intensity: number) => {
    if (intensity === 0) return "rgba(100, 116, 139, 0.1)" // Slate-ish
    if (intensity < 0.3) return "rgba(59, 130, 246, 0.3)" // Blue
    if (intensity < 0.6) return "rgba(234, 179, 8, 0.5)"  // Yellow
    if (intensity < 0.8) return "rgba(249, 115, 22, 0.6)" // Orange
    return "rgba(239, 68, 68, 0.8)"                       // Red
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
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2 text-orange-500">
            <Zap className="h-5 w-5 fill-current" />
            <h3 className="font-bold text-sm tracking-widest uppercase">Wow Feature</h3>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities Heatmap</h1>
          <p className="text-muted-foreground mt-1">
            Visualizing slot utilization intensity based on historical booking frequency.
          </p>
        </div>
        <Map className="h-10 w-10 text-muted-foreground/30 hidden md:block" />
      </div>

      <Card className="glass overflow-hidden relative">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-muted/20 to-primary/5 pointer-events-none" />
        <CardHeader className="relative z-10 border-b border-border bg-card/50 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Usage Intensity Map</CardTitle>
            <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center"><div className="w-3 h-3 rounded bg-blue-500/30 mr-1" /> Low</span>
              <span className="flex items-center"><div className="w-3 h-3 rounded bg-yellow-500/50 mr-1" /> Medium</span>
              <span className="flex items-center"><div className="w-3 h-3 rounded bg-red-500/80 mr-1" /> High</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 p-6 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 w-full h-[60vh] max-h-[800px] bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-border shadow-inner">
            {slots.length === 0 && (
              <div className="col-span-full h-full flex items-center justify-center text-muted-foreground">
                Insufficient physical slot data to render Heatmap.
              </div>
            )}
            
            <AnimatePresence>
              {slots.map((slot, i) => {
                const intensity = heatmapData[slot.id] || 0
                const isOccupied = slot.status === "occupied"
                return (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    className="relative flex flex-col justify-between p-3 rounded-lg border border-border overflow-hidden cursor-crosshair group backdrop-blur-md transition-shadow hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/10"
                    style={{ backgroundColor: getBackgroundColor(intensity) }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-foreground drop-shadow-sm">{slot.slotNumber}</span>
                      {isOccupied && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgb(239,68,68)]" title="Currently Occupied" />
                      )}
                    </div>
                    
                    <div className="mt-4 text-[10px] font-mono text-foreground font-semibold bg-background/50 rounded px-1.5 py-0.5 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                      {(intensity * 100).toFixed(0)}% Utilized
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
