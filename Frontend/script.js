const totalSlots = 10;
let slots = [];

function init() {
    for (let i = 1; i <= totalSlots; i++) {
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
    box.className = `mb-4 p-3 rounded text-center ${
        type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
        div.className = `p-4 rounded shadow text-center ${
            s.car ? "bg-red-100" : "bg-green-100"
        }`;

        div.innerHTML = `
            <p class="font-bold">Slot ${s.slot}</p>
            <p class="text-sm">${s.car ? s.car : "Available"}</p>
            <p class="text-xs text-gray-500">
                ${s.entryTime ? "In: " + s.entryTime.toLocaleTimeString() : ""}
            </p>
        `;

        slotsDiv.appendChild(div);
    });

    document.getElementById("availableCount").innerText = totalSlots - occupied;
    document.getElementById("occupiedCount").innerText = occupied;
}

function parkCar() {
    const car = document.getElementById("carNumber").value.trim();
    if (!car) return showAlert("Enter car number", "error");

    const freeSlot = slots.find(s => s.car === null);
    if (!freeSlot) return showAlert("Parking is full", "error");

    freeSlot.car = car;
    freeSlot.entryTime = new Date();

    showAlert(`Car parked in Slot ${freeSlot.slot}`, "success");
    updateUI();
}

function removeCar() {
    const car = document.getElementById("carNumber").value.trim();
    const slot = slots.find(s => s.car === car);

    if (!slot) return showAlert("Car not found", "error");

    const hours = Math.ceil((new Date() - slot.entryTime) / (1000 * 60 * 60));
    const amount = hours * 20;

    showAlert(`Bill: ₹${amount} for ${hours} hour(s)`, "success");

    slot.car = null;
    slot.entryTime = null;
    updateUI();
}

init();
