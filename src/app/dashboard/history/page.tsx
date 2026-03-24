"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { fetchUserHistory } from "@/lib/firebase/api"
import { Booking } from "@/types"
import { Card } from "@/components/ui/Card"
import { History, ReceiptText } from "lucide-react"

export default function HistoryPage() {
  const { user } = useAppStore()
  const [history, setHistory] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadHistory = async () => {
      try {
        const data = await fetchUserHistory(user.id)
        setHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <History className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
          <p className="text-muted-foreground mt-1">Review your past parking sessions and receipts.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="glass border-dashed">
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <ReceiptText className="h-12 w-12 mb-4 opacity-50" />
            <p>No past sessions found.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((booking) => (
            <Card key={booking.id} className="glass overflow-hidden hover:border-primary/50 transition-colors">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-muted h-12 px-3 min-w-[3rem] shrink-0 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm text-primary max-w-[150px] truncate">
                    {booking.slotId}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg uppercase">{booking.vehicleNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.entryTime?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end text-sm">
                  <div className="grid grid-cols-[80px_1fr] md:grid-cols-[60px_1fr] gap-x-2 text-muted-foreground">
                    <span>Entry:</span>
                    <span className="text-foreground font-medium">{booking.entryTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Exit:</span>
                    <span className="text-foreground font-medium">{booking.exitTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex flex-col items-start md:items-end min-w-[100px]">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fee Paid</span>
                  <span className="text-2xl font-bold">${booking.fee?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
