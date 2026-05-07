document.addEventListener("DOMContentLoaded", async () => {

    const historyContainer = document.getElementById("historyContainer");
    const loading = document.getElementById("loading");

    // 1. ✅ แก้ชื่อให้ตรงกับตอนที่เซฟในหน้า Login
    const token = localStorage.getItem("adminToken"); 

    try {
        // 2. ✅ แก้ URL ให้เป็นของ Render (หรือ Vercel) ที่คุณ Deploy ไว้
        const res = await fetch("https://resturant-duo.onrender.com/api/reservations", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();

        loading.style.display = "none";

        if (!res.ok) {
            historyContainer.innerHTML = `
                <p>${data.message}</p>
            `;
            return;
        }

        data.forEach(item => {

            const div = document.createElement("div");

            div.innerHTML = `
                <h3>${item.fullname}</h3>
                <p>${item.email}</p>
                <p>${item.date}</p>
                <p>${item.time}</p>
            `;

            historyContainer.appendChild(div);

        });

    } catch(err) {

        console.error(err);

        loading.innerText = "Failed to load";

    }

});