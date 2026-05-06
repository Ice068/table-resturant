const express = require("express");
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// ==========================
// INIT ADMIN
// ==========================
app.get("/init", async (req, res) => {
    const hash = await bcrypt.hash("1234", 10);

    db.run(
        "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
        ["admin", hash],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Admin ready (admin / 1234)" });
        }
    );
});

// ==========================
// LOGIN
// ==========================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username !== "admin") {
        return res.status(401).json({ message: "Only admin allowed" });
    }

    db.get(
        "SELECT * FROM users WHERE username = 'admin'",
        async (err, user) => {

            if (!user) {
                return res.status(401).json({ message: "Run /init first" });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });

            res.json({ token });
        }
    );
});

// ==========================
// AUTH
// ==========================
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// ==========================
// CREATE RESERVATION
// ==========================
app.post("/api/reservations", (req, res) => {

    const { fullname, email, date, time, guests } = req.body;

    if (!fullname || !email || !date || !time || !guests) {
        return res.status(400).json({ message: "Missing fields" });
    }

    // 🔥 generate reserve number + OTP
    const reserveNumber = "RES" + Date.now();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    db.run(
        `INSERT INTO reservations 
        (fullname,email,date,time,guests,reserveNumber,otp)
        VALUES (?,?,?,?,?,?,?)`,
        [fullname, email, date, time, guests, reserveNumber, otp],
        function (err) {
            if (err) return res.status(500).json(err);

            res.json({
                message: "Reservation success",
                reserveNumber,
                otp
            });
        }
    );
});

// ==========================
// VERIFY RESERVATION
// ==========================
app.post("/api/verify", (req, res) => {

    const { reserveNumber, email, otp } = req.body;

    db.get(
        `SELECT * FROM reservations 
         WHERE reserveNumber = ? AND email = ? AND otp = ?`,
        [reserveNumber, email, otp],
        (err, row) => {

            if (!row) {
                return res.status(400).json({ message: "Invalid data" });
            }

            res.json({
                message: "Verified",
                data: row
            });
        }
    );
});

// ==========================
// GET ALL (ADMIN)
// ==========================
app.get("/api/reservations", auth, (req, res) => {
    db.all("SELECT * FROM reservations ORDER BY id DESC", (err, rows) => {
        res.json(rows);
    });
});

// ==========================
// DELETE
// ==========================
app.delete("/api/reservations/:id", auth, (req, res) => {

    db.run(
        "DELETE FROM reservations WHERE id = ?",
        [req.params.id],
        function (err) {

            if (this.changes === 0) {
                return res.status(404).json({ message: "Not found" });
            }

            res.json({ message: "Deleted" });
        }
    );
});

// ==========================
app.listen(3000, () => {
    console.log("🚀 http://localhost:3000");
});