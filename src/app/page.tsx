"use client"
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { motion } from "framer-motion"
import { Car, Zap, ShieldCheck, MapPin } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const carsRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Basic GSAP storytelling timeline
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-text",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
      )
      
      gsap.to(".flying-car", {
        x: "100%",
        opacity: 0,
        repeat: -1,
        duration: 20,
        ease: "linear"
      })
    }, heroRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <div className="relative min-h-screen bg-[#000000] text-white selection:bg-white/30 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center opacity-70 mix-blend-luminosity portrait:bg-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0a0a0a] z-0" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/40 rounded-full blur-[150px] mix-blend-screen opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black pointer-events-none" />
        
        {/* Animated Flying Car */}
        <div className="absolute top-1/4 -left-32 z-[1] flying-car pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 blur-[25px] rounded-full w-20 h-10 animate-pulse" />
            <Car className="relative z-10 h-10 w-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-80" />
            <div className="absolute top-1/2 -right-8 w-16 h-[2px] bg-gradient-to-l from-transparent to-primary/80 blur-[1px]" />
          </div>
        </div>
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-white" />
          <span className="font-bold text-xl tracking-tight">Park<span className="text-white/60">Flow</span></span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">Log in</Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main ref={heroRef} className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
        <h1 className="hero-text text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          Parking, <br/> reimagined.
        </h1>
        <p className="hero-text text-xl md:text-2xl text-white/60 max-w-2xl mb-12 font-medium">
          Experience seamless, serverless parking management. Real-time availability, effortless booking, and zero friction.
        </p>
        
        <div className="hero-text flex gap-4">
          <Link href="/auth">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg w-48 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Start Booking
            </Button>
          </Link>
        </div>

        {/* Storytelling Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl w-full hero-text">
          {[
            { icon: Zap, title: "Real-time Sync", desc: "Instantly see what slots are available via Firestore listeners." },
            { icon: MapPin, title: "Heatmap Insights", desc: "Visualize parking utilization efficiently." },
            { icon: ShieldCheck, title: "Secure Transactions", desc: "Automated fee logic based on exact exit times." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left transition-colors hover:bg-white/10"
            >
              <feature.icon className="h-8 w-8 mb-4 text-white/80" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/50">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 mt-20 p-8 text-center text-white/40">
        <p>© 2026 ParkFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
