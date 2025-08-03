const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const os = require("os");
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

// ✅ Root route to keep app active
app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const host = req.headers.host;
  const url = `https://${host}/upload.html`;
  const qr = await QRCode.toDataURL(url);

  res.send(`
    <h1>QuickShare</h1>
    <p>Scan this QR code to upload a file from your phone:</p>
    <img src="${qr}" />
  `);
});


app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.get("/upload-url", async (req, res) => {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}/upload.html`;
  const qr = await QRCode.toDataURL(url);
  res.send(`<h2>Scan this QR to upload file</h2><img src="${qr}" />`);
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.send(`
    <h2>Upload successful!</h2>
    <a href="/uploads/${req.file.filename}" target="_blank">Open File</a>
  `);
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
}

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
