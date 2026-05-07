document.addEventListener("DOMContentLoaded", async () => {

    const historyContainer = document.getElementById("historyContainer");
    const loading = document.getElementById("loading");

    const token = localStorage.getItem("token");

    try {

        const res = await fetch("http://localhost:3000/api/reservations", {
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