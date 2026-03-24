// src/lib/store.ts
import { create } from "zustand";
import { User } from "@/types";

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;

  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  theme: "dark", // Default to dark for landing storytelling
  setTheme: (theme) => set({ theme }),

  sidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
}));
