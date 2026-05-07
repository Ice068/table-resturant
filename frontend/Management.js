// ==========================
// 1. SETUP & FETCH DATA
// ==========================
let reservations = [];
const token = localStorage.getItem("adminToken"); // ดึง Token ของ Admin

// ฟังก์ชันดึงข้อมูลจาก Render
async function loadData() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading...</td></tr>`;

    try {
        const res = await fetch("https://resturant-duo.onrender.com/api/reservations", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await res.json();
        
        // ใส่ status จำลองไปก่อน เพราะใน DB เรายังไม่ได้สร้างคอลัมน์ status
        reservations = data.map(r => ({
            ...r,
            status: "pending" 
        }));

        applyFilters(); // โหลดเสร็จแล้วสั่งวาดตาราง

    } catch (err) {
        console.error("Error loading data:", err);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load data from server</td></tr>`;
    }
}

// ==========================
// 2. RENDER TABLE
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
            <button class="btn btn-success btn-sm" onclick="confirmRes(${r.id})">✔</button>
            <button class="btn btn-warning btn-sm" onclick="cancelRes(${r.id})">✖</button>
            <button class="btn btn-danger btn-sm" onclick="deleteRes(${r.id})">🗑</button>
        </td>
        `;

        tbody.appendChild(tr);
    });
}

// ==========================
// 3. ACTIONS
// ==========================
// ปรับสถานะแค่ในหน้าจอ (ยังไม่เซฟลง DB เพราะไม่มีคอลัมน์)
function confirmRes(id){
    const item = reservations.find(r => r.id == id);
    if(item){
        item.status = "confirmed";
        applyFilters();
    }
}

function cancelRes(id){
    const item = reservations.find(r => r.id == id);
    if(item){
        item.status = "cancelled";
        applyFilters();
    }
}

// ลบข้อมูลออกจากฐานข้อมูลบน Render จริงๆ
async function deleteRes(id){
    if(!confirm("Are you sure you want to delete this reservation?")) return;

    try {
        const res = await fetch(`https://resturant-duo.onrender.com/api/reservations/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            // ลบสำเร็จ ให้ดึงข้อมูลที่เหลือมาแสดงใหม่
            reservations = reservations.filter(r => r.id !== id);
            applyFilters();
        } else {
            alert("Failed to delete from database.");
        }
    } catch (err) {
        console.error(err);
        alert("Server error while deleting.");
    }
}

// ==========================
// 4. FILTERS
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
// 5. EVENTS & INIT
// ==========================
document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filterDate").addEventListener("change", applyFilters);
document.getElementById("filterStatus").addEventListener("change", applyFilters);

// โหลดข้อมูลทันทีที่เปิดหน้าเว็บ
loadData(); 

function toggleSidebar(){
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");

    sidebar.classList.toggle("hide");
    content.classList.toggle("full");
}