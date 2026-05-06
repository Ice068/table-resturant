// ==========================
// LOAD DATA
// ==========================
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// add default status
reservations.forEach(r => {
    if(!r.status) r.status = "pending";
});

// ==========================
// RENDER TABLE
// ==========================
function renderTable(data){

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    data.forEach((r,i)=>{

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${i+1}</td>
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
            <button class="btn btn-success btn-sm" onclick="confirmRes(${i})">✔</button>
            <button class="btn btn-warning btn-sm" onclick="cancelRes(${i})">✖</button>
            <button class="btn btn-danger btn-sm" onclick="deleteRes(${i})">🗑</button>
        </td>
        `;

        tbody.appendChild(tr);
    });
}

// ==========================
// ACTIONS
// ==========================
function confirmRes(i){
    reservations[i].status = "confirmed";
    save();
}

function cancelRes(i){
    reservations[i].status = "cancelled";
    save();
}

function deleteRes(i){
    if(confirm("Delete this reservation?")){
        reservations.splice(i,1);
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

    let filtered = reservations.filter(r => {

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
