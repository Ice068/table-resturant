const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require('path');

// เรียกใช้ better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('./database.sqlite'); 

// === สร้างตารางอัตโนมัติ (ป้องกัน Database พังตอนขึ้น Server) ===
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT,
    email TEXT,
    date TEXT,
    time TEXT,
    guests INTEGER,
    reserveNumber TEXT,
    otp TEXT
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// เสิร์ฟไฟล์ Frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ==========================
// INIT ADMIN
// ==========================
app.get("/init", async (req, res) => {
    try {
        const hash = await bcrypt.hash("1234", 10);
        db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)").run("admin", hash);
        res.json({ message: "Admin ready (admin / 1234)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// LOGIN
// ==========================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username !== "admin") {
            return res.status(401).json({ message: "Only admin allowed" });
        }

        const user = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();

        if (!user) {
            return res.status(401).json({ message: "Run /init first" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// AUTH MIDDLEWARE
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
    try {
        const { fullname, email, date, time, guests } = req.body;

        if (!fullname || !email || !date || !time || !guests) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const reserveNumber = "RES" + Date.now();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        db.prepare(`
            INSERT INTO reservations (fullname, email, date, time, guests, reserveNumber, otp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(fullname, email, date, time, guests, reserveNumber, otp);

        res.json({
            message: "Reservation success",
            reserveNumber,
            otp
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// VERIFY RESERVATION
// ==========================
app.post("/api/verify", (req, res) => {
    try {
        const { reserveNumber, email, otp } = req.body;

        const row = db.prepare(`
            SELECT * FROM reservations 
            WHERE reserveNumber = ? AND email = ? AND otp = ?
        `).get(reserveNumber, email, otp);

        if (!row) {
            return res.status(400).json({ message: "Invalid data" });
        }

        res.json({
            message: "Verified",
            data: row
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// GET ALL (ADMIN)
// ==========================
app.get("/api/reservations", auth, (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM reservations ORDER BY id DESC").all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// DELETE
// ==========================
app.delete("/api/reservations/:id", auth, (req, res) => {
    try {
        const info = db.prepare("DELETE FROM reservations WHERE id = ?").run(req.params.id);

        if (info.changes === 0) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// START SERVER
// ==========================
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});