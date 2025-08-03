const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// File upload config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Root route: index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ✅ Route for iframe that shows QR code to upload.html
app.get("/upload-url", async (req, res) => {
  const host = req.headers.host; // works on Railway
  const url = `https://${host}/upload.html`;
  const qr = await QRCode.toDataURL(url);
  res.send(`
    <h2>Scan this QR to upload a file</h2>
    <img src="${qr}" />
  `);
});

// ✅ File upload POST handler
app.post("/upload", upload.single("file"), (req, res) => {
  res.send(`
    <h2>Upload successful!</h2>
    <p><a href="/uploads/${req.file.filename}" target="_blank">Open File</a></p>
    <p><a href="/upload.html">Upload another file</a></p>
  `);
});

// ✅ Optional 404 fallback
app.use((req, res) => {
  res.status(404).send("❌ Page not found.");
});

// ✅ Start server
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
