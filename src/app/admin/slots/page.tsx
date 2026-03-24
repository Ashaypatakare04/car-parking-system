"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { collection, onSnapshot, orderBy, query, doc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { ParkingSlot } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Plus, Trash2, ShieldAlert } from "lucide-react"

export default function AdminSlots() {
  const { user } = useAppStore()
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  
  const [isAdding, setIsAdding] = useState(false)
  const [newSlotNumber, setNewSlotNumber] = useState("")
  const [error, setError] = useState("")
  
  const [slotToDelete, setSlotToDelete] = useState<ParkingSlot | null>(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "parkingSlots"), orderBy("slotNumber"))
    const unsub = onSnapshot(q, (snap) => {
      setSlots(snap.docs.map(d => ({ id: d.id, ...d.data() } as ParkingSlot)))
    })
    return () => unsub()
  }, [user])

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!newSlotNumber.trim()) {
      setError("Slot number is required")
      return
    }
    
    // Check if slot name already exists locally
    if (slots.some(s => s.slotNumber.toUpperCase() === newSlotNumber.trim().toUpperCase())) {
      setError("Slot number already exists")
      return
    }

    try {
      const id = `SLOT-${Date.now()}`
      await setDoc(doc(db, "parkingSlots", id), {
        id,
        slotNumber: newSlotNumber.toUpperCase(),
        status: "available",
        currentVehicleId: null,
        lastUpdated: new Date()
      })
      setIsAdding(false)
      setNewSlotNumber("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return
    if (slotToDelete.status === "occupied") {
      alert("Cannot delete an occupied slot.")
      setSlotToDelete(null)
      return
    }

    try {
      await deleteDoc(doc(db, "parkingSlots", slotToDelete.id))
      setSlotToDelete(null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slot Management</h1>
          <p className="text-muted-foreground mt-1">Configure and monitor physical parking slots.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Slot
        </Button>
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {slots.length === 0 && (
              <div className="col-span-full h-32 flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
                No slots available. Add one above.
              </div>
            )}
            {slots.map((slot) => {
              const isAvailable = slot.status === "available"
              return (
                <div
                  key={slot.id}
                  className={`relative group h-24 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isAvailable ? "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-500" : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-500"
                  }`}
                >
                  <span className="text-xl font-bold mb-1 text-foreground">{slot.slotNumber}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                    isAvailable ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    {slot.status}
                  </span>
                  
                  {isAvailable && (
                    <button
                      onClick={() => setSlotToDelete(slot)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Delete Slot"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  {!isAvailable && (
                    <div className="absolute top-2 left-2 right-2 text-center text-xs font-semibold px-1 py-0.5 bg-background border border-border rounded truncate shadow-sm">
                      {slot.currentVehicleId}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isAdding} onClose={() => { setIsAdding(false); setError(""); setNewSlotNumber(""); }} title="Add New Slot">
        <form onSubmit={handleAddSlot} className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter a unique identifier for the new physical parking space.</p>
          <Input 
            placeholder="e.g. VIP-1, A42"
            value={newSlotNumber}
            onChange={(e) => setNewSlotNumber(e.target.value)}
            error={error}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button type="submit">Create Slot</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!slotToDelete} onClose={() => setSlotToDelete(null)} title="Confirm Deletion">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-500/20">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Are you absolute sure you want to permanently delete slot <strong>{slotToDelete?.slotNumber}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" type="button" onClick={() => setSlotToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteSlot}>Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
