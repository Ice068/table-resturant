document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("historyForm");
    const message = document.getElementById("formMessage");
    const submitBtn = form.querySelector("button");

    function showMessage(text, color="white"){
        message.innerText = text;
        message.style.color = color;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const reserveNumber = document.getElementById("reserveNumber").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const otp = document.getElementById("otp").value.trim();

        if(!reserveNumber || !email || !phone || !otp){
            return showMessage("Please fill all fields", "red");
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Verifying...";

        try {

            const res = await fetch("http://localhost:3000/verify-reservation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reserveNumber,
                    email,
                    phone,
                    otp
                })
            });

            const data = await res.json();

            if(res.ok){
                showMessage("✔ Reservation Verified!", "#d4af37");

                console.log("DATA:", data);

                form.reset();
            }else{
                showMessage(data.message || "Failed", "red");
            }

        } catch (err){
            console.error(err);
            showMessage("Server error", "red");
        }

        submitBtn.disabled = false;
        submitBtn.innerText = "Verify";
    });

});