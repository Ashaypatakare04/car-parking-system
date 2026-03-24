"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { listenToUserActiveBooking } from "@/lib/firebase/api"
import { Booking } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Car, Clock, MapPin, ReceiptText } from "lucide-react"

export default function UserDashboard() {
  const { user } = useAppStore()
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToUserActiveBooking(user.id, (booking) => {
      setActiveBooking(booking)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Manage your parking reservations and view your history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeBooking ? "Parked" : "No Active Booking"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeBooking ? (
                <>Slot <span className="text-foreground font-semibold px-1 py-0.5 rounded bg-muted">{activeBooking.slotId}</span></>
              ) : (
                "You are ready to find a slot"
              )}
            </p>
          </CardContent>
        </Card>

        {activeBooking && (
          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Session</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeBooking.entryTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Entered</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        {!activeBooking ? (
          <Card className="glass border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex flex-col items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Find a Parking Slot</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Check real-time availability and reserve a parking slot now. Base fee applies.
              </p>
              <Link href="/dashboard/slots">
                <Button>Browse Available Slots</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Manage Your Parking</CardTitle>
              <CardDescription>You can end your session and calculate the fee below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/booking">
                <Button variant="outline" className="gap-2">
                  <ReceiptText className="h-4 w-4" />
                  View Booking Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
