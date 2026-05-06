// ==========================
// LOAD DATA
// ==========================
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// ==========================
// STATS
// ==========================
function updateStats(){

    document.getElementById("total").innerText = reservations.length;

    const todayDate = new Date().toISOString().split("T")[0];

    const todayCount = reservations.filter(r => r.date === todayDate).length;

    document.getElementById("today").innerText = todayCount;

    document.getElementById("available").innerText = 10 - todayCount;
}

// ==========================
// CHART
// ==========================
function loadChart(){

    const map = {};

    reservations.forEach(r => {
        map[r.date] = (map[r.date] || 0) + 1;
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Reservations",
                data: data,
                borderColor: "#d4af37",
                tension: 0.3
            }]
        }
    });
}

// ==========================
// RECENT TABLE
// ==========================
function loadRecent(){

    const tbody = document.getElementById("recentTable");

    const latest = [...reservations].reverse().slice(0,5);

    latest.forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.fullname}</td>
            <td>${r.date}</td>
            <td>${r.time}</td>
            <td>${r.guests}</td>
        `;

        tbody.appendChild(tr);
    });
}

function toggleSidebar(){
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");

    sidebar.classList.toggle("hide");
    content.classList.toggle("full");
}

// ==========================
// INIT
// ==========================
updateStats();
loadChart();
loadRecent();
