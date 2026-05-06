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

    const hash = await bcrypt.hash("1234", 10);

    db.run(
        "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
        ["admin", hash],
        (err) => {
            if (err) return res.json(err);
            res.json({ message: "Admin created (admin / 1234)" });
        }
    );
});

// ==========================
// 🔐 LOGIN
// ==========================
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET,
                { expiresIn: "1h" }
            );

            res.json({ token });
        }
    );
});

// ==========================
// 🔒 MIDDLEWARE
// ==========================
function auth(req, res, next) {

    const header = req.headers.authorization;

    if (!header) return res.sendStatus(401);

    const token = header.split(" ")[1];

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ==========================
// 📋 GET RESERVATIONS
// ==========================
app.get("/reservations", auth, (req, res) => {

    db.all("SELECT * FROM reservations", (err, rows) => {
        if (err) return res.json(err);
        res.json(rows);
    });
});

// ==========================
// ➕ ADD RESERVATION
// ==========================
app.post("/reservations", (req, res) => {

    const { fullname, email, date, time, guests } = req.body;

    db.run(
        `INSERT INTO reservations (fullname,email,date,time,guests)
         VALUES (?,?,?,?,?)`,
        [fullname, email, date, time, guests],
        function (err) {
            if (err) return res.json(err);
            res.json({ id: this.lastID });
        }
    );
});

// ==========================
// ❌ DELETE
// ==========================
app.delete("/reservations/:id", auth, (req, res) => {

    db.run(
        "DELETE FROM reservations WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.json(err);
            res.json({ message: "Deleted" });
        }
    );
});

// ==========================
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});