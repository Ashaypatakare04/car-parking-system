import { db } from "./config";
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, orderBy, limit, setDoc, updateDoc } from "firebase/firestore";
import { Booking, ParkingSlot, Transaction } from "@/types";

export const listenToSlots = (callback: (slots: ParkingSlot[]) => void) => {
  const q = query(collection(db, "parkingSlots"), orderBy("slotNumber"));
  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSlot));
    callback(slots);
  });
};

export const listenToUserActiveBooking = (userId: string, callback: (booking: Booking | null) => void) => {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    where("status", "==", "active"),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      const booking: Booking = {
        ...data,
        id: snapshot.docs[0].id,
        entryTime: data.entryTime?.toDate(),
        exitTime: data.exitTime?.toDate() || null,
      } as Booking;
      callback(booking);
    } else {
      callback(null);
    }
  });
};

export const fetchUserHistory = async (userId: string): Promise<Booking[]> => {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    where("status", "==", "completed"),
    orderBy("entryTime", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      entryTime: data.entryTime?.toDate(),
      exitTime: data.exitTime?.toDate() || null,
    } as Booking;
  });
};

export const createBooking = async (userId: string, vehicleNumber: string, slot: ParkingSlot) => {
  if (slot.status !== "available") throw new Error("Slot is no longer available.");
  
  // Verify user doesn't already have an active booking to prevent double booking
  const q = query(collection(db, "bookings"), where("userId", "==", userId), where("status", "==", "active"));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) throw new Error("You already have an active booking.");

  const bookingId = `BK-${Date.now()}`;
  
  // Create booking
  await setDoc(doc(db, "bookings", bookingId), {
    userId,
    vehicleNumber,
    slotId: slot.id,
    entryTime: new Date(),
    exitTime: null,
    status: "active"
  });

  // Update slot status
  await updateDoc(doc(db, "parkingSlots", slot.id), {
    status: "occupied",
    currentVehicleId: vehicleNumber,
    lastUpdated: new Date()
  });

  return bookingId;
};

export const processExit = async (booking: Booking) => {
  const settingsDoc = await getDoc(doc(db, "settings", "global"));
  const { baseFee = 10, hourlyRate = 5 } = settingsDoc.exists() ? settingsDoc.data() : {};

  const exitTime = new Date();
  const entryTime = booking.entryTime;
  const hours = Math.ceil((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60));
  const calculatedHours = hours > 0 ? hours : 1;
  const fee = baseFee + (calculatedHours * hourlyRate);

  const transactionId = `TRX-${Date.now()}`;

  // Close Booking
  await updateDoc(doc(db, "bookings", booking.id), {
    exitTime,
    status: "completed",
    fee
  });

  // Create Transaction
  await setDoc(doc(db, "transactions", transactionId), {
    bookingId: booking.id,
    amount: fee,
    timestamp: exitTime
  });

  // Free Slot
  await updateDoc(doc(db, "parkingSlots", booking.slotId), {
    status: "available",
    currentVehicleId: null,
    lastUpdated: new Date()
  });

  return { fee, transactionId };
};
