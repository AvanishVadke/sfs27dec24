const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const con = mysql.createConnection({
    host: "sql12.freesqldatabase.com", // Corrected: no trailing spaces
    user: "sql12754019",
    password: "nMIUkfg9X9",
    database: "sql12754019"
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.post("/ss", upload.single('file'), (req, res) => {
    let data = [req.body.rno, req.body.name, req.body.marks, req.file.filename];
    let sql = "insert into student3 values(?, ?, ?, ?)";
    con.query(sql, data, (err, result) => {
        if (err) res.send(err);
        else res.send(result);
    });
});
app.get("/gs", (req, res) => {
    let sql = "select * from student3";
    con.query(sql, (err, result) => {
        if (err) res.send(err);
        else res.send(result);
    });
});

app.delete("/ds", (req, res) => {
    let data = [req.body.rno];
    fs.unlink("./uploads/" + req.body.image, () => {});
    let sql = "delete from student3 where rno = ?";
    con.query(sql, data, (err, result) => {
        if (err) res.send(err);
        else res.send(result);
    });
});

app.listen(9000, () => { console.log("server ready @ 9000 "); });
