const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 8080;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set up Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Root route: show QR code to the upload page
app.get("/", async (req, res) => {
  const host = req.headers.host;
  const publicURL = `https://${host}/upload.html`;
  const qrCode = await QRCode.toDataURL(publicURL);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>QuickShare</title>
      <style>
        body { font-family: Arial; text-align: center; margin-top: 50px; }
        img { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>QuickShare</h1>
      <p>Scan to upload from your phone</p>
      <img src="${qrCode}" alt="QR Code to Upload Page" />
    </body>
    </html>
  `;
  res.send(html);
});

// Handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send("✅ File uploaded successfully!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
