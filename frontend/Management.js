// ==========================
// LOAD DATA
// ==========================
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// 🔥 เพิ่ม id + status (กันพัง)
reservations = reservations.map((r, index) => {
    return {
        id: r.id || (Date.now() + index), // unique id
        fullname: r.fullname,
        email: r.email,
        date: r.date,
        time: r.time,
        guests: r.guests,
        status: r.status || "pending"
    };
});

// ==========================
// RENDER TABLE
// ==========================
function renderTable(data){

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if(data.length === 0){
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">No data</td></tr>`;
        return;
    }

    data.forEach((r, i) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${r.fullname}</td>
        <td>${r.email}</td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td>${r.guests}</td>
        <td>
            <span class="status ${r.status}">
                ${r.status}
            </span>
        </td>
        <td>
            <button class="btn btn-success btn-sm" onclick="confirmRes('${r.id}')">✔</button>
            <button class="btn btn-warning btn-sm" onclick="cancelRes('${r.id}')">✖</button>
            <button class="btn btn-danger btn-sm" onclick="deleteRes('${r.id}')">🗑</button>
        </td>
        `;

        tbody.appendChild(tr);
    });
}

// ==========================
// ACTIONS (ใช้ id แทน index)
// ==========================
function confirmRes(id){
    const item = reservations.find(r => r.id == id);
    if(item){
        item.status = "confirmed";
        save();
    }
}

function cancelRes(id){
    const item = reservations.find(r => r.id == id);
    if(item){
        item.status = "cancelled";
        save();
    }
}

function deleteRes(id){
    if(confirm("Delete this reservation?")){
        reservations = reservations.filter(r => r.id != id);
        save();
    }
}

// ==========================
// SAVE + REFRESH
// ==========================
function save(){
    localStorage.setItem("reservations", JSON.stringify(reservations));
    applyFilters();
}

// ==========================
// FILTERS
// ==========================
function applyFilters(){

    const keyword = document.getElementById("search").value.toLowerCase();
    const date = document.getElementById("filterDate").value;
    const status = document.getElementById("filterStatus").value;

    const filtered = reservations.filter(r => {

        const matchText =
            r.fullname.toLowerCase().includes(keyword) ||
            r.email.toLowerCase().includes(keyword);

        const matchDate = date ? r.date === date : true;
        const matchStatus = status ? r.status === status : true;

        return matchText && matchDate && matchStatus;
    });

    renderTable(filtered);
}

// ==========================
// EVENTS
// ==========================
document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filterDate").addEventListener("change", applyFilters);
document.getElementById("filterStatus").addEventListener("change", applyFilters);

// ==========================
// INIT
// ==========================
applyFilters();

function toggleSidebar(){
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");

    sidebar.classList.toggle("hide");
    content.classList.toggle("full");
}