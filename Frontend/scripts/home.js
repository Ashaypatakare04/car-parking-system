// ================= FIREBASE INIT =================
firebase.initializeApp({
  apiKey: "AIzaSyBEyRxlEO4JKzeRBqLTBqUQS-abtp58eaw",
  authDomain: "pulsevoice-1ef60.firebaseapp.com"
});
const auth = firebase.auth();

// ================= AUTH PROTECTION =================
//auth.onAuthStateChanged(user => {
//  if (!user) location.href = "home.html";
//});

// ================= LOGOUT =================
logoutBtn.onclick = () => auth.signOut();

// ================= APP STATE =================
const TOTAL_SLOTS = 10;
let slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
  id: i + 1,
  status: "available",
  car: null
}));

// ================= UI UPDATE =================
function render() {
  const available = slots.filter(s => s.status === "available").length;
  const occupied = TOTAL_SLOTS - available;

  availableCount.innerText = available;
  occupiedCount.innerText = occupied;
  totalCount.innerText = TOTAL_SLOTS;

  slotsEl.innerHTML = "";
  slots.forEach(slot => {
    const div = document.createElement("div");
    div.className = `card text-center ${slot.status === "occupied" ? "border-red-500/40" : ""}`;
    div.innerHTML = `
      <p class="label">SLOT ${slot.id}</p>
      <h3 class="value">${slot.status === "available" ? "FREE" : "BUSY"}</h3>
      <p class="text-xs text-muted mt-1">${slot.car || ""}</p>
    `;
    slotsEl.appendChild(div);
  });
}

// ================= ALERT =================
function showAlert(msg, type="info") {
  alertBox.className = `mb-10 px-6 py-4 rounded-xl border 
    ${type === "error" ? "border-red-500/40 text-red-400" : "border-green-500/40 text-green-400"}`;
  alertBox.innerText = msg;
  alertBox.classList.remove("hidden");
  setTimeout(() => alertBox.classList.add("hidden"), 3000);
}

// ================= ACTIONS =================
function parkCar() {
  const car = carNumber.value.trim();
  if (!car) return showAlert("Enter vehicle number", "error");

  const slot = slots.find(s => s.status === "available");
  if (!slot) return showAlert("Parking full", "error");

  slot.status = "occupied";
  slot.car = car;
  carNumber.value = "";
  render();
  showAlert(`Vehicle ${car} parked`);
}

function removeCar() {
  const car = carNumber.value.trim();
  if (!car) return showAlert("Enter vehicle number", "error");

  const slot = slots.find(s => s.car === car);
  if (!slot) return showAlert("Vehicle not found", "error");

  slot.status = "available";
  slot.car = null;
  carNumber.value = "";
  render();
  showAlert(`Vehicle ${car} removed`);
}

// ================= INIT =================
const slotsEl = document.getElementById("slots");
render();