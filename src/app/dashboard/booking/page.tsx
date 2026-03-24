"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { listenToUserActiveBooking, processExit } from "@/lib/firebase/api"
import { Booking } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { CarFront, Clock, Receipt, AlertTriangle } from "lucide-react"

export default function MyBooking() {
  const { user } = useAppStore()
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [isConfirmingExit, setIsConfirmingExit] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [receipt, setReceipt] = useState<{ fee: number; transactionId: string } | null>(null)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToUserActiveBooking(user.id, (booking) => {
      setActiveBooking(booking)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  // Real-time live fee counter (Optional visual feature)
  const [liveHours, setLiveHours] = useState(1)
  
  useEffect(() => {
    if (!activeBooking?.entryTime) return
    const updateTime = () => {
      const now = new Date()
      const diffHrs = Math.ceil((now.getTime() - activeBooking.entryTime!.getTime()) / (1000 * 60 * 60))
      setLiveHours(diffHrs > 0 ? diffHrs : 1)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [activeBooking])

  const handleExit = async () => {
    if (!activeBooking) return
    setIsExiting(true)
    try {
      const result = await processExit(activeBooking)
      setReceipt(result)
      setIsConfirmingExit(false)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to process exit.")
    } finally {
      setIsExiting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If receipt exists, show Exit Summary Page
  if (receipt) {
    return (
      <div className="animate-in fade-in duration-500 max-w-lg mx-auto mt-10">
        <Card className="glass border-green-500/50 shadow-xl shadow-green-500/10">
          <CardHeader className="text-center pb-2">
            <div className="bg-green-500/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Exit Successful</CardTitle>
            <CardDescription>Your parking session has ended.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-sm">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-xl font-medium">Total Paid</span>
              <span className="text-3xl font-bold">${receipt.fee.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setReceipt(null)}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!activeBooking) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
        <CarFront className="h-16 w-16 text-muted mb-4 opacity-50" />
        <h2 className="text-2xl font-bold tracking-tight">No Active Session</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          You don't have any vehicle currently parked in the facility. 
          Head over to the slots map to find an available spot.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Active Session</h1>
      
      <Card className="glass overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Slot {activeBooking.slotId}</CardTitle>
              <CardDescription className="mt-1">
                Vehicle Plate: <strong className="text-foreground uppercase">{activeBooking.vehicleNumber}</strong>
              </CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              IN PROGRESS
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Entry Time</span>
              </div>
              <p className="text-xl font-semibold">
                {activeBooking.entryTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeBooking.entryTime?.toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Receipt className="h-4 w-4" />
                <span className="text-sm font-medium">Current Estimate</span>
              </div>
              <p className="text-xl font-semibold">${(10 + liveHours * 5).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Based on {liveHours} hr(s)</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted px-6 py-4 flex justify-between items-center border-t border-border mt-4">
          <span className="text-sm text-muted-foreground">Ready to leave?</span>
          <Button variant="danger" onClick={() => setIsConfirmingExit(true)}>End Session & Exit</Button>
        </CardFooter>
      </Card>

      <Modal isOpen={isConfirmingExit} onClose={() => setIsConfirmingExit(false)} title="Confirm Exit">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-500/20">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Are you sure you want to end your parking session? The calculated fee will be charged and the slot will be released instantly.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsConfirmingExit(false)} disabled={isExiting}>Cancel</Button>
            <Button variant="danger" onClick={handleExit} isLoading={isExiting}>Confirm Exit</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
