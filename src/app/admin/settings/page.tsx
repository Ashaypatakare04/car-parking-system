"use client"
import React, { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Settings, Save, Zap } from "lucide-react"

export default function AdminSettings() {
  const { user } = useAppStore()
  const [baseFee, setBaseFee] = useState<number>(10)
  const [hourlyRate, setHourlyRate] = useState<number>(5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    const loadSettings = async () => {
      try {
        const d = await getDoc(doc(db, "settings", "global"))
        if (d.exists()) {
          setBaseFee(d.data().baseFee || 10)
          setHourlyRate(d.data().hourlyRate || 5)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      await setDoc(doc(db, "settings", "global"), {
        baseFee,
        hourlyRate,
        updatedAt: new Date()
      }, { merge: true })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert("Failed to save settings.")
    } finally {
      setSaving(false)
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
    <div className="animate-in fade-in space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global application parameters and pricing logic.</p>
        </div>
      </div>

      <Card className="glass border-primary/20 shadow-2xl">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500 fill-current" />
            <CardTitle>Pricing Engine Configurations</CardTitle>
          </div>
          <CardDescription>
            These values govern the automated mathematics evaluated when a user attempts to exit the facility. Updates are immediate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="grid sm:grid-cols-[1fr_200px] gap-6 items-center">
              <div>
                <h3 className="font-semibold text-foreground">Base Entry Fee</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The flat minimum rate charged automatically just for entering a slot.
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                <Input 
                  type="number" 
                  className="pl-8 text-lg font-mono font-bold"
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>

            <div className="w-full h-px bg-border my-2" />

            <div className="grid sm:grid-cols-[1fr_200px] gap-6 items-center">
              <div>
                <h3 className="font-semibold text-foreground">Hourly Rate Variable</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The dynamic fee layered on top of the base fee multiplied out by time elapsed.
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                <Input 
                  type="number" 
                  className="pl-8 text-lg font-mono font-bold"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted px-6 py-4 flex justify-between items-center border-t border-border">
          <div className="text-sm">
            {success ? (
              <span className="text-green-500 font-bold flex items-center gap-1">✓ Settings applied securely</span>
            ) : (
              <span className="text-muted-foreground tracking-wide">Ready to save modifications.</span>
            )}
          </div>
          <Button onClick={handleSave} isLoading={saving} className="gap-2 bg-foreground text-background shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
