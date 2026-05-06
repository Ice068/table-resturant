// ===== CONFIG =====
const MAX_TABLES = 10;
const TIMES = [
"09:00","10:00","11:00","12:00","13:00",
"14:00","15:00","16:00","17:00",
"18:00","19:00","20:00","21:00"
];

// ===== INIT =====
const timeSelect = document.getElementById("time");
const tableCount = document.getElementById("tableCount");
const alertBox = document.getElementById("alertBox");

TIMES.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    timeSelect.appendChild(option);
});

// ===== LOAD DATA =====
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// ===== CHECK TABLE =====
function getAvailableTables(date, time){
    const count = reservations.filter(r => r.date === date && r.time === time).length;
    return MAX_TABLES - count;
}

// ===== UPDATE UI =====
function updateTableUI(){
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if(!date || !time) return;

    const available = getAvailableTables(date, time);
    tableCount.textContent = available;
}

// ===== ALERT =====
function showAlert(msg, type="danger"){
    alertBox.innerHTML = `
    <div class="alert alert-${type}">${msg}</div>
    `;
}

// ===== EVENTS =====
document.getElementById("date").addEventListener("change", updateTableUI);
document.getElementById("time").addEventListener("change", updateTableUI);

document.getElementById("reservationForm").addEventListener("submit", function(e){
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const guests = document.getElementById("guests").value;

    if(!fullname || !email || !date || !time || !guests){
        return showAlert("Please fill all fields");
    }

    if(new Date(date) < new Date().setHours(0,0,0,0)){
        return showAlert("Cannot select past date");
    }

    const available = getAvailableTables(date, time);

    if(available <= 0){
        return showAlert("No tables available");
    }

    reservations.push({ fullname, email, date, time, guests });
    localStorage.setItem("reservations", JSON.stringify(reservations));

    showAlert("Reservation successful!", "success");

    this.reset();
    tableCount.textContent = MAX_TABLES;
});