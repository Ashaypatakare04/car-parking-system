export type Role = "admin" | "user";
export type SlotStatus = "available" | "occupied";
export type BookingStatus = "active" | "completed" | "cancelled";

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string; // e.g. "A1", "B2"
  status: SlotStatus;
  currentVehicleId: string | null; // vehicleNumber of parked vehicle
  lastUpdated: Date;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleNumber: string;
  slotId: string;
  entryTime: Date;
  exitTime: Date | null;
  status: BookingStatus;
  fee?: number; // Calculated on exit (10 + 5*hr)
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  timestamp: Date;
}
