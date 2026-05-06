document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorBox = document.getElementById('error-message');

    errorBox.classList.add('d-none');

    try {
        // ==========================================
        // 📍 [รอ Backend] จุดที่ต้องเปลี่ยนไปใช้ fetch() เรียก API Login จริง
        // ==========================================
        
        // ชั่วคราว: กำหนดรหัสผ่านจำลองคือ admin / 1234
            const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'index.html';
        } else {
            errorBox.classList.remove('d-none');
        }

    } catch (error) {
        console.error("Login Error:", error);
    }
});