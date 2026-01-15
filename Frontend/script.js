const totalSlots = 10;
let parkingSlots = [];

function initSlots() {
    for (let i = 1; i <= totalSlots; i++) {
        parkingSlots.push({
            slot: i,
            car: null,
            entryTime: null
        });
    }
    displaySlots();
}

function displaySlots() {
    const slotDiv = document.getElementById("slots");
    slotDiv.innerHTML = "";

    parkingSlots.forEach(s => {
        const div = document.createElement("div");
        div.className = "slot " + (s.car ? "occupied" : "free");
        div.innerHTML = `
            Slot ${s.slot}<br>
            ${s.car ? s.car : "Free"}
        `;
        slotDiv.appendChild(div);
    });
}

function parkCar() {
    const carNumber = document.getElementById("carNumber").value;
    if (!carNumber) {
        alert("Enter car number");
        return;
    }

    const freeSlot = parkingSlots.find(s => s.car === null);
    if (!freeSlot) {
        alert("Parking Full!");
        return;
    }

    freeSlot.car = carNumber;
    freeSlot.entryTime = new Date();
    displaySlots();
    alert(`Car parked in slot ${freeSlot.slot}`);
}

function removeCar() {
    const carNumber = document.getElementById("carNumber").value;
    const slot = parkingSlots.find(s => s.car === carNumber);

    if (!slot) {
        alert("Car not found!");
        return;
    }

    const exitTime = new Date();
    const hours = Math.ceil((exitTime - slot.entryTime) / (1000 * 60 * 60));
    const amount = hours * 20;

    alert(`Parking Time: ${hours} hour(s)\nBill Amount: ₹${amount}`);

    slot.car = null;
    slot.entryTime = null;
    displaySlots();
}

initSlots();
