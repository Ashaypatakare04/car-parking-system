/* ===== ADMIN STATE ===== */
let TOTAL_SLOTS = 10;
let maintenance = false;

/* ===== ELEMENTS ===== */
const totalSlotsEl = document.getElementById("totalSlots");
const occupancyEl = document.getElementById("occupancy");
const modeEl = document.getElementById("systemMode");
const logEl = document.getElementById("activityLog");

/* ===== HELPERS ===== */
function log(msg){
  const div = document.createElement("div");
  div.className = "card text-sm";
  div.innerText = msg;
  logEl.prepend(div);
}

function updateUI(){
  totalSlotsEl.innerText = TOTAL_SLOTS;
  occupancyEl.innerText = Math.floor(Math.random()*100) + "%";
  modeEl.innerText = maintenance ? "MAINTENANCE" : "LIVE";
  modeEl.className = "value " + (maintenance ? "text-yellow" : "text-green");
}

/* ===== ACTIONS ===== */
function updateSlots(){
  const val = Number(slotInput.value);
  if(!val || val < 1) return alert("Invalid slot count");
  TOTAL_SLOTS = val;
  log(`Capacity updated to ${val} slots`);
  updateUI();
}

function toggleMaintenance(){
  maintenance = !maintenance;
  log(`System mode changed to ${maintenance ? "Maintenance" : "Live"}`);
  updateUI();
}

function resetSystem(){
  if(!confirm("Reset entire system?")) return;
  log("System reset performed");
}

/* ===== INIT ===== */
updateUI();

/* ===== LOGOUT ===== */
logoutBtn.onclick = () => location.href = "login.html";