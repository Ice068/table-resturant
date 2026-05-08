// ==========================
// 1. SETUP & FETCH DATA
// ==========================
let reservations = [];
const token = localStorage.getItem("adminToken"); // ดึง Token ของ Admin

async function loadData() {
    try {
        // ดึงข้อมูลจาก Render (อย่าลืมแนบ Token)
        const res = await fetch("https://resturant-duo.onrender.com/api/reservations", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch");
        }

        reservations = await res.json();

        // พอโหลดข้อมูลเสร็จ ค่อยอัปเดตหน้าจอ กราฟ และตาราง
        updateStats();
        loadChart();
        loadRecent();

    } catch (err) {
        console.error("Error loading data:", err);
        // ถ้าดึงไม่ได้ ให้ตัวเลขเป็น 0 ไว้ก่อน
        document.getElementById("total").innerText = "0";
    }
}

// ==========================
// 2. STATS
// ==========================
function updateStats(){
    document.getElementById("total").innerText = reservations.length;

    const todayDate = new Date().toISOString().split("T")[0];
    const todayCount = reservations.filter(r => r.date === todayDate).length;

    document.getElementById("today").innerText = todayCount;
    document.getElementById("available").innerText = 10 - todayCount;
}

// ==========================
// 3. CHART
// ==========================
let chartInstance = null; // เอาไว้เก็บตัวแปรแก้กราฟซ้อนทับกัน

function loadChart(){
    const map = {};

    reservations.forEach(r => {
        map[r.date] = (map[r.date] || 0) + 1;
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    const ctx = document.getElementById("chart");
    
    // เผื่อหน้าเว็บมีการรีเฟรชกราฟซ้ำ จะได้ไม่พัง (Clear กราฟเก่าก่อนวาดใหม่)
    if(chartInstance){
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Reservations",
                data: data,
                borderColor: "#d4af37", // สีทองธีม Eclipse
                tension: 0.3
            }]
        }
    });
}

// ==========================
// 4. RECENT TABLE
// ==========================
function loadRecent(){
    const tbody = document.getElementById("recentTable");
    if(!tbody) return; // ดักไว้เผื่อหา HTML ไม่เจอ

    tbody.innerHTML = ""; // ล้างข้อมูลเก่า

    // ข้อมูลจาก Backend เรียงจากใหม่ไปเก่ามาให้แล้ว เอาแค่ 5 อันแรก
    const latest = reservations.slice(0, 5);

    if (latest.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No recent reservations</td></tr>`;
        return;
    }

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

// ==========================
// 5. SIDEBAR
// ==========================
function toggleSidebar(){
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");

    sidebar.classList.toggle("hide");
    content.classList.toggle("full");
}

// ==========================
// 6. INIT
// ==========================
// สั่งให้โหลดข้อมูลจาก Server ทันทีที่เปิดหน้านี้ขึ้นมา
loadData();
