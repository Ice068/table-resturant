document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorBox = document.getElementById('error-message');
    const btn = this.querySelector("button");

    // reset UI
    errorBox.classList.add('d-none');
    btn.disabled = true;
    btn.innerText = "Logging in...";

    try {

        const res = await fetch("hhttps://resturant-duo.onrender.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        // 🔥 เช็ค response ก่อน
        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error("Invalid server response");
        }

        if (res.ok) {
            // ✅ เก็บ token
            localStorage.setItem('adminToken', data.token);

            // (optional) เก็บ user
            if(data.user){
                localStorage.setItem('adminUser', JSON.stringify(data.user));
            }

            // ✅ ไป dashboard
            window.location.href = 'admin-dashboard.html';

        } else {
            errorBox.innerText = data.message || "Login failed";
            errorBox.classList.remove('d-none');
        }

    } catch (error) {
        console.error("Login Error:", error);

        errorBox.innerText = "Server error. Please try again.";
        errorBox.classList.remove('d-none');

    } finally {
        btn.disabled = false;
        btn.innerText = "Login";
    }
});