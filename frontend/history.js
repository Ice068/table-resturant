document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("historyForm");
    const message = document.getElementById("formMessage");
    const submitBtn = form.querySelector("button[type='submit']");

    let isSubmitting = false;

    // ===== VALIDATION =====
    function isValidEmail(email){
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone){
        return /^[0-9]{9,10}$/.test(phone);
    }

    function showMessage(text, color="white"){
        message.innerText = text;
        message.style.color = color;
    }

    function setLoading(state){
        isSubmitting = state;
        submitBtn.disabled = state;
        submitBtn.innerText = state ? "Processing..." : "Verify";
    }

    // ===== SUBMIT =====
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if(isSubmitting) return;

        const reserveNumber = document.getElementById("reserveNumber").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const otp = document.getElementById("otp").value.trim();

        // ===== CHECK EMPTY =====
        if(!reserveNumber || !email || !phone || !otp){
            return showMessage("Please fill in all fields", "red");
        }

        // ===== FORMAT VALIDATION =====
        if(!isValidEmail(email)){
            return showMessage("Invalid email format", "red");
        }

        if(!isValidPhone(phone)){
            return showMessage("Phone must be 9-10 digits", "red");
        }

        if(otp.length !== 6){
            return showMessage("OTP must be 6 digits", "red");
        }

        setLoading(true);
        showMessage("Verifying...", "#aaa");

        try {

            // ===== TIMEOUT =====
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const response = await fetch("http://localhost:3000/api/reservations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                signal: controller.signal,
                body: JSON.stringify({
                    reserveNumber,
                    email,
                    phone,
                    otp
                })
            });

            clearTimeout(timeout);

            const data = await response.json();

            if(response.ok){

                showMessage("✔ Reservation verified!", "#d4af37");

                // reset form
                form.reset();

                // 🔥 optional redirect
                // setTimeout(() => {
                //   window.location.href = `details.html?id=${data.id}`;
                // }, 1500);

            }else{
                showMessage(data.message || "Verification failed", "red");
            }

        } catch (error){

            if(error.name === "AbortError"){
                showMessage("Request timeout. Try again.", "red");
            }else{
                console.error(error);
                showMessage("Server error. Please try again.", "red");
            }

        } finally {
            setLoading(false);
        }

    });

});