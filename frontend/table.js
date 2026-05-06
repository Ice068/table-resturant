// ===== CONFIG =====
const MAX_TABLES = 10;
const TIMES = [
"09:00","10:00","11:00","12:00","13:00",
"14:00","15:00","16:00","17:00",
"18:00","19:00","20:00","21:00"
];

// ===== ELEMENTS =====
const timeSelect = document.getElementById("time");
const tableCount = document.getElementById("tableCount");
const alertBox = document.getElementById("alertBox");
const form = document.getElementById("reservationForm");

// ===== LOAD DATA =====
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// ===== INIT TIME OPTIONS =====
function renderTimeOptions(){
    timeSelect.innerHTML = `<option value="">-- Select Time --</option>`;

    const date = document.getElementById("date").value;

    TIMES.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;

        // disable ถ้าเต็ม
        if(date && getAvailableTables(date, t) <= 0){
            option.disabled = true;
            option.textContent += " (Full)";
        }

        // disable เวลาที่ผ่านมา (เฉพาะวันนี้)
        if(date === getToday()){
            const now = getCurrentTime();
            if(t <= now){
                option.disabled = true;
                option.textContent += " (Passed)";
            }
        }

        timeSelect.appendChild(option);
    });
}

// ===== HELPERS =====
function getToday(){
    return new Date().toISOString().split("T")[0];
}

function getCurrentTime(){
    const now = new Date();
    return now.toTimeString().slice(0,5); // HH:MM
}

// ===== CHECK TABLE =====
function getAvailableTables(date, time){
    const count = reservations.filter(r => r.date === date && r.time === time).length;
    return MAX_TABLES - count;
}

// ===== UPDATE UI =====
function updateTableUI(){
    const date = document.getElementById("date").value;
    const time = timeSelect.value;

    renderTimeOptions();

    if(!date || !time){
        tableCount.textContent = MAX_TABLES;
        return;
    }

    const available = getAvailableTables(date, time);
    tableCount.textContent = available;

    // เปลี่ยนสี
    tableCount.style.color = available <= 0 ? "red" : "#7CFFB2";
}

// ===== ALERT =====
function showAlert(msg, type="danger"){
    alertBox.innerHTML = `
    <div class="alert alert-${type}">${msg}</div>
    `;

    // auto hide
    setTimeout(() => alertBox.innerHTML = "", 3000);
}

// ===== EVENTS =====
document.getElementById("date").addEventListener("change", updateTableUI);
timeSelect.addEventListener("change", updateTableUI);

// ===== SUBMIT =====
form.addEventListener("submit", function(e){
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const time = timeSelect.value;
    const guests = document.getElementById("guests").value;

    // ===== VALIDATION =====
    if(!fullname || !email || !date || !time || !guests){
        return showAlert("Please fill all fields");
    }

    if(date < getToday()){
        return showAlert("Cannot select past date");
    }

    const available = getAvailableTables(date, time);

    if(available <= 0){
        return showAlert("No tables available");
    }

    // ===== SAVE =====
    reservations.push({
        fullname,
        email,
        date,
        time,
        guests
    });

    localStorage.setItem("reservations", JSON.stringify(reservations));

    showAlert("Reservation successful!", "success");

    form.reset();
    tableCount.textContent = MAX_TABLES;

    renderTimeOptions(); // refresh
});

// ===== INIT =====
renderTimeOptions();