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
// 🔐 CREATE ADMIN (ครั้งแรก)
// ==========================
app.get("/init", async (req, res) => {
    try {
        const hash = await bcrypt.hash("1234", 10);

        db.run(
            "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
            ["admin", hash],
            (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Admin ready (admin / 1234)" });
            }
        );
    } catch (err) {
        res.status(500).json({ message: "Init error" });
    }
});

// ==========================
// 🔐 LOGIN (ล็อกเฉพาะ admin)
// ==========================
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    // 🔥 บังคับให้เป็น admin เท่านั้น
    if (username !== "admin") {
        return res.status(401).json({ message: "Only admin allowed" });
    }

    db.get(
        "SELECT * FROM users WHERE username = ?",
        ["admin"],
        async (err, user) => {

            if (err) {
                return res.status(500).json({ message: "DB error" });
            }

            if (!user) {
                return res.status(401).json({ message: "Admin not found (run /init)" });
            }

            try {
                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return res.status(401).json({ message: "Wrong password" });
                }

                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    SECRET,
                    { expiresIn: "1h" }
                );

                res.json({
                    token,
                    user: {
                        username: user.username
                    }
                });

            } catch {
                res.status(500).json({ message: "Login error" });
            }
        }
    );
});

// ==========================
// 🔒 AUTH MIDDLEWARE
// ==========================
function auth(req, res, next) {

    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// ==========================
// 📋 GET RESERVATIONS
// ==========================
app.get("/reservations", auth, (req, res) => {

    db.all("SELECT * FROM reservations ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

// ==========================
// ➕ ADD RESERVATION
// ==========================
app.post("/reservations", (req, res) => {

    const { fullname, email, date, time, guests } = req.body;

    if (!fullname || !email || !date || !time || !guests) {
        return res.status(400).json({ message: "Missing fields" });
    }

    db.run(
        `INSERT INTO reservations (fullname,email,date,time,guests)
         VALUES (?,?,?,?,?)`,
        [fullname, email, date, time, guests],
        function (err) {
            if (err) return res.status(500).json(err);

            res.json({
                message: "Reservation created",
                id: this.lastID
            });
        }
    );
});

// ==========================
// ❌ DELETE RESERVATION
// ==========================
app.delete("/reservations/:id", auth, (req, res) => {

    db.run(
        "DELETE FROM reservations WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json(err);

            if (this.changes === 0) {
                return res.status(404).json({ message: "Not found" });
            }

            res.json({ message: "Deleted successfully" });
        }
    );
});

// ==========================
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});