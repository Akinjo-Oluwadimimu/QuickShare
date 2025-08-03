const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists (use /tmp on Railway)
const uploadPath = path.join("/tmp", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Serve static files (like upload.html, style.css)
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files
app.use("/uploads", express.static(uploadPath));

// Home route
app.get("/", async (req, res) => {
  const host = req.headers.host;
  const publicURL = `https://${host}/upload.html`;
  const qr = await QRCode.toDataURL(publicURL);

  res.send(`
    <h1>QuickShare</h1>
    <p>Scan this QR code to upload a file from your phone:</p>
    <img src="${qr}" />
  `);
});

// Optional: /upload-url route for iframe (used in index.html)
app.get("/upload-url", async (req, res) => {
  const host = req.headers.host;
  const url = `https://${host}/upload.html`;
  const qr = await QRCode.toDataURL(url);
  res.send(`
    <h2>Scan this QR to upload file</h2>
    <img src="${qr}" />
  `);
});

app.get("/uploads-list", (req, res) => {
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to list uploaded files.");
    }
    const list = files
      .map(
        (file) =>
          `<li><a href="/uploads/${file}" target="_blank">${file}</a></li>`
      )
      .join("");
    res.send(`<h2>Uploaded Files</h2><ul>${list}</ul>`);
  });
});

// Handle uploads
app.post("/upload", upload.single("file"), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  res.send(`
    <h2>Upload successful!</h2>
    <a href="${fileUrl}" target="_blank">Open Uploaded File</a>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
