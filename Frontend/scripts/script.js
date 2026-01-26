const TOTAL_SLOTS = 10;
const RATE_PER_HOUR = 20;
let slots = [];

function init() {
    for (let i = 1; i <= TOTAL_SLOTS; i++) {
        slots.push({
            slot: i,
            car: null,
            entryTime: null
        });
    }
    updateUI();
}

function showAlert(message, type) {
    const box = document.getElementById("alertBox");
    box.className = `mb-6 p-4 rounded-lg text-center font-medium ${
        type === "success"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
    }`;
    box.innerText = message;
    box.classList.remove("hidden");

    setTimeout(() => box.classList.add("hidden"), 3000);
}

function updateUI() {
    const slotsDiv = document.getElementById("slots");
    slotsDiv.innerHTML = "";

    let occupied = 0;

    slots.forEach(s => {
        if (s.car) occupied++;

        const div = document.createElement("div");
        div.className = `
            rounded-xl p-4 shadow
            ${s.car ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}
            transition hover:scale-105
        `;

        div.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-slate-700">Slot ${s.slot}</span>
                <span class="text-xs px-2 py-1 rounded-full ${
                    s.car ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                }">
                    ${s.car ? "Occupied" : "Free"}
                </span>
            </div>

            <p class="text-sm text-slate-600">
                ${s.car ? `🚘 ${s.car}` : "No vehicle"}
            </p>

            <p class="text-xs text-slate-400 mt-1">
                ${s.entryTime ? "Entry: " + s.entryTime.toLocaleTimeString() : ""}
            </p>
        `;

        slotsDiv.appendChild(div);
    });

    document.getElementById("availableCount").innerText = TOTAL_SLOTS - occupied;
    document.getElementById("occupiedCount").innerText = occupied;
}

function parkCar() {
    const car = document.getElementById("carNumber").value.trim();
    if (!car) return showAlert("Please enter vehicle number", "error");

    const freeSlot = slots.find(s => s.car === null);
    if (!freeSlot) return showAlert("Parking is full", "error");

    freeSlot.car = car;
    freeSlot.entryTime = new Date();

    showAlert(`Vehicle parked in Slot ${freeSlot.slot}`, "success");
    updateUI();
}

function removeCar() {
    const car = document.getElementById("carNumber").value.trim();
    const slot = slots.find(s => s.car === car);

    if (!slot) return showAlert("Vehicle not found", "error");

    const hours = Math.ceil((new Date() - slot.entryTime) / (1000 * 60 * 60));
    const amount = hours * RATE_PER_HOUR;

    slot.car = null;
    slot.entryTime = null;

    showAlert(`Parking Fee: ₹${amount} (${hours} hour(s))`, "success");
    updateUI();
}

init();
