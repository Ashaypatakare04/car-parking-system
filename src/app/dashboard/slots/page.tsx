"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { listenToSlots, listenToUserActiveBooking, createBooking } from "@/lib/firebase/api"
import { ParkingSlot } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { useRouter } from "next/navigation"

export default function ParkingSlots() {
  const { user } = useAppStore()
  const router = useRouter()
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [hasActive, setHasActive] = useState(false)
  
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsubSlots = listenToSlots(setSlots)
    let unsubBooking = () => {}
    
    if (user) {
      unsubBooking = listenToUserActiveBooking(user.id, (booking) => {
        setHasActive(!!booking)
      })
    }

    return () => {
      unsubSlots()
      unsubBooking()
    }
  }, [user])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedSlot) return
    if (!vehicleNumber.trim()) {
      setError("Please enter a valid vehicle number.")
      return
    }
    
    setIsSubmitting(true)
    setError("")
    
    try {
      await createBooking(user.id, vehicleNumber.toUpperCase(), selectedSlot)
      setSelectedSlot(null)
      router.push("/dashboard/booking")
    } catch (err: any) {
      setError(err.message || "Failed to book the slot.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Available Slots</h1>
        <p className="text-muted-foreground mt-1">Select a green slot below to book your parking session instantly.</p>
        
        {hasActive && (
          <div className="mt-4 p-4 border border-blue-500/20 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-lg text-sm">
            Note: You already have an active booking. You cannot reserve another slot.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {slots.length === 0 && (
          <div className="col-span-full h-32 flex items-center justify-center border border-dashed rounded-xl">
            <span className="text-muted-foreground text-sm">No slots configured by admin yet.</span>
          </div>
        )}
        
        {slots.map((slot) => {
          const isAvailable = slot.status === "available"
          return (
            <button
              key={slot.id}
              disabled={hasActive || !isAvailable}
              onClick={() => setSelectedSlot(slot)}
              className={`
                relative h-24 rounded-xl border flex flex-col items-center justify-center transition-all overflow-hidden
                ${isAvailable && !hasActive ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20 active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : ""}
                ${!isAvailable ? "border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60" : ""}
                ${hasActive && isAvailable ? "border-border bg-card cursor-not-allowed opacity-50" : ""}
              `}
            >
              <span className="text-xl font-bold mb-1">{slot.slotNumber}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isAvailable ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
                {slot.status}
              </span>
            </button>
          )
        })}
      </div>

      <Modal isOpen={!!selectedSlot} onClose={() => { setSelectedSlot(null); setError(""); setVehicleNumber(""); }} title="Confirm Booking">
        <form onSubmit={handleBooking} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            You are about to reserve slot <strong className="text-foreground">{selectedSlot?.slotNumber}</strong>. 
            Base fee is $10 plus $5 for every hour.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Plate Number</label>
            <Input 
              placeholder="e.g. ABC 1234" 
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
              error={error}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" type="button" onClick={() => setSelectedSlot(null)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Confirm Reservation</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
