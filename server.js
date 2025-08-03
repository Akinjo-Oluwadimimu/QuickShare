const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const os = require("os");
const app = express();
const PORT = process.env.PORT || 3000;

// File upload config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

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