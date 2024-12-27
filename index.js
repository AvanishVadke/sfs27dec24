// const express = require("express");
// const cors = require("cors");
// const mysql = require("mysql2");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const con = mysql.createConnection({
//     host: "sql12.freesqldatabase.com", // Corrected: no trailing spaces
//     user: "sql12754019",
//     password: "nMIUkfg9X9",
//     database: "sql12754019"
// });

// // Set up Multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Destination folder for uploads
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//     },
// });

// const upload = multer({ storage });

// // Serve uploaded files statically
// app.use('/uploads', express.static('uploads'));

// app.post("/ss", upload.single('file'), (req, res) => {
//     let data = [req.body.rno, req.body.name, req.body.marks, req.file.filename];
//     let sql = "insert into student3 values(?, ?, ?, ?)";
//     con.query(sql, data, (err, result) => {
//         if (err) res.send(err);
//         else res.send(result);
//     });
// });
// app.get("/gs", (req, res) => {
//     let sql = "select * from student3";
//     con.query(sql, (err, result) => {
//         if (err) res.send(err);
//         else res.send(result);
//     });
// });

// app.delete("/ds", (req, res) => {
//     let data = [req.body.rno];
//     fs.unlink("./uploads/" + req.body.image, () => {});
//     let sql = "delete from student3 where rno = ?";
//     con.query(sql, data, (err, result) => {
//         if (err) res.send(err);
//         else res.send(result);
//     });
// });

// app.listen(9000, () => { console.log("server ready @ 9000 "); });


const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const con = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12754019",
    password: "nMIUkfg9X9",
    database: "sql12754019",
});

con.connect((err) => {
    if (err) {
        console.error("Database Connection Error:", err);
        process.exit(1); // Exit if connection fails
    }
    console.log("Database connected");
});

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Directory for uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
        }
        cb(null, true);
    },
});

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Routes

// Add a student record with file upload
app.post("/ss", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: "File not uploaded" });
    }

    const data = [req.body.rno, req.body.name, req.body.marks, req.file.filename];
    const sql = "INSERT INTO student3 (rno, name, marks, filename) VALUES (?, ?, ?, ?)";
    con.query(sql, data, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ error: "Failed to insert record" });
        }
        res.status(201).send({ message: "Record added successfully", result });
    });
});

// Get all student records
app.get("/gs", (req, res) => {
    const sql = "SELECT * FROM student3";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ error: "Failed to fetch records" });
        }
        res.status(200).send(result);
    });
});

// Delete a student record and file
app.delete("/ds", (req, res) => {
    const { rno, image } = req.body;
    if (!rno || !image) {
        return res.status(400).send({ error: "Missing required fields: rno or image" });
    }

    // Delete file from the server
    fs.unlink(`./uploads/${image}`, (err) => {
        if (err) {
            console.error("File Deletion Error:", err);
        }
    });

    const sql = "DELETE FROM student3 WHERE rno = ?";
    con.query(sql, [rno], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ error: "Failed to delete record" });
        }
        res.status(200).send({ message: "Record deleted successfully", result });
    });
});

// Start the server
const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Server ready @ ${PORT}`);
});
