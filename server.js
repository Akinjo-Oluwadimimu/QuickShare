const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve public and uploads
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// File upload setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Route: QR Code homepage
app.get("/", async (req, res) => {
  const host = req.headers.host;
  const url = `https://${host}/upload.html`;
  const qr = await QRCode.toDataURL(url);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>QuickShare</title>
      <style>
        body { font-family: Arial; text-align: center; margin-top: 40px; }
        img { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>QuickShare</h1>
      <p>Scan this QR code to upload a file from your phone:</p>
      <img src="${qr}" alt="QR Code" />
    </body>
    </html>
  `;
  res.send(html);
});

// Upload handler
app.post("/upload", upload.single("file"), (req, res) => {
  res.send(`
    <h2>Upload successful!</h2>
    <a href="/uploads/${req.file.filename}" target="_blank">Open File</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
