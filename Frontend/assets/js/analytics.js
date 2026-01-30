/* ===== DATA SETS (SIMULATED) ===== */
const DATA = {
  "7d": {
    labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    usage:[22,25,28,30,35,38,32],
    avg:"68%",
    peak:"6–8 PM",
    users:42,
    revenue:"₹1,680"
  },
  "30d": {
    labels:["W1","W2","W3","W4"],
    usage:[60,72,80,75],
    avg:"64%",
    peak:"5–7 PM",
    users:38,
    revenue:"₹7,400"
  },
  "all": {
    labels:["Jan","Feb","Mar","Apr","May"],
    usage:[55,62,70,78,74],
    avg:"66%",
    peak:"6–8 PM",
    users:35,
    revenue:"₹32,000"
  }
};

let currentRange = "7d";

/* ===== CHARTS ===== */
const usageChart = new Chart(document.getElementById("usageChart"), {
  type:"line",
  data:{ labels:[], datasets:[{
    data:[],
    borderColor:"#7c7cff",
    backgroundColor:"rgba(124,124,255,.2)",
    fill:true,
    tension:.4
  }]},
  options:{ plugins:{legend:{display:false}} }
});

const slotChart = new Chart(document.getElementById("slotChart"), {
  type:"bar",
  data:{
    labels:["A","B","C","D","E"],
    datasets:[{ data:[75,90,60,50,65], backgroundColor:"#2bff88" }]
  },
  options:{ plugins:{legend:{display:false}} }
});

/* ===== FUNCTIONS ===== */
function setRange(range){
  currentRange = range;

  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  event.target.classList.add("active");

  const d = DATA[range];
  usageChart.data.labels = d.labels;
  usageChart.data.datasets[0].data = d.usage;
  usageChart.update();

  avgOcc.innerText = d.avg;
  peakHour.innerText = d.peak;
  dailyUsers.innerText = d.users;
  revenue.innerText = d.revenue;
}

function exportCSV(){
  const d = DATA[currentRange];
  let csv = "Label,Usage\n";
  d.labels.forEach((l,i)=>csv += `${l},${d.usage[i]}\n`);

  const blob = new Blob([csv], { type:"text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `driveflow-analytics-${currentRange}.csv`;
  a.click();
}

/* INIT */
setRange("7d");