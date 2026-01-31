let currentUser;
let slotsCache = [];

/* AUTH GUARD */
auth.onAuthStateChanged(user=>{
if(!user) return location.href="login.html";
currentUser = user;
userEmail.innerText = user.email;
loadSystem();
loadHistory();
});

/* LOGOUT */
logoutBtn.onclick = ()=> auth.signOut().then(()=>location.href="login.html");

/* LOAD SYSTEM CONFIG */
function loadSystem(){
db.collection("system").doc("config")
.onSnapshot(doc=>{
const d = doc.data();
totalSlots.innerText = d.totalSlots;

renderSlots(d.totalSlots);
});
}

/* REALTIME SLOT LISTENER */
function renderSlots(count){
db.collection("slots").onSnapshot(snap=>{
slotGrid.innerHTML="";
slotsCache = [];

let occupied=0;

snap.forEach(doc=>{
slotsCache.push({id:doc.id,...doc.data()});
});

for(let i=1;i<=count;i++){
let s = slotsCache.find(x=>x.id==="S"+i);
if(s && s.occupied) occupied++;

const div = document.createElement("div");
div.className="slot "+(s && s.occupied ? "occupied":"free");
div.innerHTML = `
S${i}<br>
<span class="text-xs opacity-70">
${s && s.occupied ? "Occupied":"Free"}
</span>`;
slotGrid.appendChild(div);
}

availableSlots.innerText = count-occupied;
occupiedSlots.innerText = occupied;
});
}

/* PARK */
async function parkVehicle(){
const num = vehicleNumber.value.trim();
if(!num) return alert("Enter vehicle number");

const free = slotsCache.find(s=>!s.occupied);
if(!free) return alert("No free slots");

await db.collection("slots").doc(free.id).set({
occupied:true,
userId:currentUser.uid,
vehicle:num,
start:firebase.firestore.FieldValue.serverTimestamp()
});

await db.collection("sessions").add({
userId:currentUser.uid,
vehicle:num,
slot:free.id,
start:new Date(),
active:true
});

userStatus.innerText="Parked";
}

/* REMOVE */
async function removeVehicle(){
const snap = await db.collection("slots")
.where("userId","==",currentUser.uid)
.get();

snap.forEach(doc=>{
doc.ref.update({occupied:false,userId:null});
});

const s = await db.collection("sessions")
.where("userId","==",currentUser.uid)
.where("active","==",true)
.get();

s.forEach(doc=>{
doc.ref.update({active:false,end:new Date()});
});

userStatus.innerText="Idle";
}

/* HISTORY */
function loadHistory(){
db.collection("sessions")
.where("userId","==",currentUser.uid)
.orderBy("start","desc")
.limit(10)
.onSnapshot(snap=>{
historyList.innerHTML="";
snap.forEach(d=>{
const x=d.data();
const div=document.createElement("div");
div.className="card text-sm";
div.innerHTML=`
🚗 ${x.vehicle} — ${x.slot}<br>
Start: ${x.start?.toDate().toLocaleString()}
`;
historyList.appendChild(div);
});
});
}