// ================= FIREBASE INIT =================
firebase.initializeApp({
  apiKey: "AIzaSyBnkyA0pzhjubkvrmgr52UAULvP7zGh2T4",
  authDomain: "driveon-da2f6.firebaseapp.com",
  projectId: "driveon-da2f6"
});

const auth = firebase.auth();
const db = firebase.firestore();

// ================= DOM ELEMENTS =================
const logoutBtn = document.getElementById("logoutBtn");
const carNumber = document.getElementById("carNumber");
const alertBox = document.getElementById("alertBox");
const slotsEl = document.getElementById("slots");

const availableCount = document.getElementById("availableCount");
const occupiedCount = document.getElementById("occupiedCount");
const totalCount = document.getElementById("totalCount");

// Admin Slot Controls
const addSlotBtn = document.getElementById("addSlotBtn");
const removeSlotBtn = document.getElementById("removeSlotBtn");

// ================= CONFIG =================
const RATE_PER_HOUR = 20;

let TOTAL_SLOTS = 0;
let slots = [];

// ================= AUTH PROTECTION =================
 auth.onAuthStateChanged(async user => {
   if (!user) return (location.href = "login.html");

   const doc = await db.collection("users").doc(user.uid).get();

   if (!doc.exists || doc.data().role !== "admin") {     alert("Admins only!");
     auth.signOut();
    return (location.href = "login.html");
  }

 initSystem();
 });

// ================= LOGOUT =================
logoutBtn.onclick = () => auth.signOut();

// ================= ALERT =================
function showAlert(msg, type = "success") {
  alertBox.className = `
    mb-10 px-6 py-4 rounded-xl border font-semibold
    ${type === "error"
      ? "border-red-500/40 text-red-400"
      : "border-green-500/40 text-green-400"}
  `;
  alertBox.innerText = msg;
  alertBox.classList.remove("hidden");

  setTimeout(() => alertBox.classList.add("hidden"), 3000);
}

// ================= BILLING =================
function calculateBill(entryTime) {
  const entry = new Date(entryTime);
  const now = new Date();

  const hours = Math.ceil((now - entry) / (1000 * 60 * 60));
  return hours * RATE_PER_HOUR;
}

// ================= RENDER =================
function render() {
  slotsEl.innerHTML = "";

  slots.forEach(slot => {
    const busy = slot.status === "occupied";

    slotsEl.innerHTML += `
      <div class="card slot-card ${
        busy ? "occupied" : "free"
      }">

        <p class="label">Slot ${slot.id}</p>

        <h2 class="value ${busy ? "text-red" : "text-green"}">
          ${busy ? "🚘 Busy" : "🅿 Free"}
        </h2>

        <p class="text-sm mt-2 text-muted">
          ${busy ? slot.vehicle : "No Vehicle"}
        </p>

        <span class="badge ${busy ? "occupied" : "free"}">
          ${busy ? "Occupied" : "Available"}
        </span>
      </div>
    `;
  });

  // Stats
  const occupied = slots.filter(s => s.status === "occupied").length;
  const available = TOTAL_SLOTS - occupied;

  totalCount.innerText = TOTAL_SLOTS;
  availableCount.innerText = available;
  occupiedCount.innerText = occupied;
}

// ================= REALTIME SLOT LISTENER =================
function loadSlotsRealtime() {
  db.collection("slots").onSnapshot(snapshot => {
    slots = [];

    snapshot.forEach(doc => {
      slots.push({
        id: Number(doc.id.replace("slot", "")),
        ...doc.data()
      });
    });

    // Sort properly
    slots.sort((a, b) => a.id - b.id);

    render();
  });
}

// ================= LOAD CONFIG =================
async function loadConfig() {
  const configRef = db.collection("config").doc("parking");
  const snap = await configRef.get();

  if (!snap.exists) {
    await configRef.set({ totalSlots: 10 });
    TOTAL_SLOTS = 10;
  } else {
    TOTAL_SLOTS = snap.data().totalSlots;
  }
}

// ================= AUTO CREATE SLOTS =================
async function ensureSlotsExist() {
  const slotRef = db.collection("slots");

  // Get current slots
  const snap = await slotRef.get();

  let existingCount = snap.size;

  console.log("Existing Slots:", existingCount);

  // If less than required → create missing
  if (existingCount < TOTAL_SLOTS) {
    console.log("⚡ Creating missing slots...");

    const batch = db.batch();

    for (let i = existingCount + 1; i <= TOTAL_SLOTS; i++) {
      batch.set(slotRef.doc("slot" + i), {
        status: "available",
        vehicle: "",
        entryTime: null
      });
    }

    await batch.commit();
    console.log("✅ Missing slots created!");
  }
}
// ================= PARK VEHICLE =================
async function parkCar() {
  const car = carNumber.value.trim().toUpperCase();
  if (!car) return showAlert("Enter vehicle number", "error");

  const freeSlot = slots.find(s => s.status === "available");
  if (!freeSlot) return showAlert("Parking Full!", "error");

  await db.collection("slots")
    .doc("slot" + freeSlot.id)
    .update({
      status: "occupied",
      vehicle: car,
      entryTime: new Date().toISOString()
    });

  carNumber.value = "";
  showAlert(`🚗 ${car} parked in Slot ${freeSlot.id}`);
}

// ================= REMOVE VEHICLE =================
async function removeCar() {
  const car = carNumber.value.trim().toUpperCase();
  if (!car) return showAlert("Enter vehicle number", "error");

  const slot = slots.find(s => s.vehicle === car);
  if (!slot) return showAlert("Vehicle not found!", "error");

  const bill = calculateBill(slot.entryTime);

  // Save History
  await db.collection("history").add({
    vehicle: car,
    slot: slot.id,
    entryTime: slot.entryTime,
    exitTime: new Date().toISOString(),
    amount: bill
  });

  // Reset Slot
  await db.collection("slots")
    .doc("slot" + slot.id)
    .update({
      status: "available",
      vehicle: "",
      entryTime: null
    });

  carNumber.value = "";
  showAlert(`✅ Removed ${car} | Bill ₹${bill}`);
}

// ================= ADMIN ADD SLOT =================
async function addSlot() {
  TOTAL_SLOTS++;

  await db.collection("slots")
    .doc("slot" + TOTAL_SLOTS)
    .set({
      status: "available",
      vehicle: "",
      entryTime: null
    });

  await db.collection("config")
    .doc("parking")
    .update({ totalSlots: TOTAL_SLOTS });

  showAlert(`➕ Slot ${TOTAL_SLOTS} Added`);
}

// ================= ADMIN REMOVE SLOT =================
async function removeSlot() {
  if (TOTAL_SLOTS <= 1)
    return showAlert("Cannot remove all slots!", "error");

  const lastSlot = slots.find(s => s.id === TOTAL_SLOTS);

  if (lastSlot.status === "occupied") {
    return showAlert("Last slot is occupied!", "error");
  }

  await db.collection("slots").doc("slot" + TOTAL_SLOTS).delete();

  TOTAL_SLOTS--;

  await db.collection("config")
    .doc("parking")
    .update({ totalSlots: TOTAL_SLOTS });

  showAlert(`➖ Slot Removed. Total = ${TOTAL_SLOTS}`);
}

// ================= HISTORY TABLE =================
function loadHistory() {
  db.collection("history")
    .orderBy("exitTime", "desc")
    .limit(5)
    .onSnapshot(snapshot => {
      const table = document.getElementById("historyTable");
      table.innerHTML = "";

      snapshot.forEach(doc => {
        const h = doc.data();

        table.innerHTML += `
          <tr class="border-t border-white/10">
            <td class="py-3">${h.vehicle}</td>
            <td>${h.slot}</td>
            <td class="text-green">₹${h.amount}</td>
            <td>${new Date(h.exitTime).toLocaleString()}</td>
          </tr>
        `;
      });
    });
}

// ================= INIT SYSTEM =================
async function initSystem() {
  await loadConfig();
  await ensureSlotsExist();

  loadSlotsRealtime();
  loadHistory();
}

// ================= BUTTON EVENTS =================
addSlotBtn.onclick = addSlot;
removeSlotBtn.onclick = removeSlot;