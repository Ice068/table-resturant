// ===== CONFIG =====
const TOTAL_TABLES = 12;

// ===== DATA (mock / localStorage) =====
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// ===== GENERATE TABLE =====
function renderTables(){

    const grid = document.getElementById("tableGrid");
    grid.innerHTML = "";

    for(let i=1;i<=TOTAL_TABLES;i++){

        const table = document.createElement("div");

        // logic status
        let status = "available";

        const hasReservation = reservations.find(r => r.table === i);

        if(hasReservation){
            status = hasReservation.status === "confirmed" ? "reserved" : "occupied";
        }

        table.className = `table-card ${status}`;

        table.innerHTML = `
            <div class="table-number">Table ${i}</div>
            <div class="status-text">${status.toUpperCase()}</div>
        `;

        // click action
        table.onclick = () => showDetail(i);

        grid.appendChild(table);
    }
}

// ===== DETAIL =====
function showDetail(tableNumber){

    const res = reservations.find(r => r.table === tableNumber);

    if(!res){
        alert("Table available");
        return;
    }

    alert(`
Table ${tableNumber}
Name: ${res.fullname}
Time: ${res.time}
Guests: ${res.guests}
Status: ${res.status}
    `);
}

// ===== INIT =====
renderTables();