// ================= FIREBASE INIT =================
firebase.initializeApp({
  apiKey: "AIzaSyBnkyA0pzhjubkvrmgr52UAULvP7zGh2T4",
  authDomain: "driveon-da2f6.firebaseapp.com",
  projectId: "driveon-da2f6" // ✅ REQUIRED
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

// ================= AUTH PROTECTION =================
auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  db.collection("users")
    .doc(user.uid)
    .get()
    .then(doc => {
      if (!doc.exists) {
        alert("No role found!");
        auth.signOut();
        return;
      }

      const role = doc.data().role;

      if (role !== "admin") {
        alert("Access Denied! Admins only.");
        auth.signOut();
        location.href = "login.html";
      }
    });
});

// ================= LOGOUT =================
logoutBtn.onclick = () => auth.signOut();

// ================= APP STATE =================
const TOTAL_SLOTS = 10;

let slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
  id: i + 1,
  status: "available",
  car: ""
}));

// ================= ALERT =================
function showAlert(msg, type = "success") {
  alertBox.className = `
    mb-10 px-6 py-4 rounded-xl border text-sm font-semibold
    ${type === "error"
      ? "border-red-500/40 text-red-400"
      : "border-green-500/40 text-green-400"}
  `;

  alertBox.innerText = msg;
  alertBox.classList.remove("hidden");

  setTimeout(() => alertBox.classList.add("hidden"), 3000);
}

// ================= RENDER UI =================
function render() {
  slotsEl.innerHTML = "";

  slots.forEach((slot, index) => {
    slotsEl.innerHTML += `
      <div class="card slot-card ${
        slot.status === "occupied" ? "occupied" : "free"
      }">

        <p class="label">Slot ${slot.id}</p>

        <h2 class="value ${
          slot.status === "occupied" ? "text-red" : "text-green"
        }">
          ${slot.status === "occupied" ? "🚘 Busy" : "🅿 Free"}
        </h2>

        <p class="text-sm mt-2 text-muted">
          ${slot.status === "occupied" ? slot.car : "No Vehicle"}
        </p>

        <span class="badge ${
          slot.status === "occupied" ? "occupied" : "free"
        }">
          ${slot.status === "occupied" ? "Occupied" : "Available"}
        </span>
      </div>
    `;
  });

  // Update Counts
  const occupied = slots.filter(s => s.status === "occupied").length;
  const available = TOTAL_SLOTS - occupied;

  availableCount.innerText = available;
  occupiedCount.innerText = occupied;
}

// ================= ACTIONS =================
function parkCar() {
  const car = carNumber.value.trim().toUpperCase();

  if (!car) return showAlert("Enter vehicle number", "error");

  const slot = slots.find(s => s.status === "available");

  if (!slot) return showAlert("Parking Full!", "error");

  slot.status = "occupied";
  slot.car = car;

  carNumber.value = "";
  render();

  showAlert(`Vehicle ${car} parked successfully`);
}

function removeCar() {
  const car = carNumber.value.trim().toUpperCase();

  if (!car) return showAlert("Enter vehicle number", "error");

  const slot = slots.find(s => s.car === car);

  if (!slot) return showAlert("Vehicle not found!", "error");

  slot.status = "available";
  slot.car = "";

  carNumber.value = "";
  render();

  showAlert(`Vehicle ${car} removed successfully`);
}

// ================= INIT =================
render();