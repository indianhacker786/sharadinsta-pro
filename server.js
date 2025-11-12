import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------------
// 📥 Download Reel API
// ----------------------
app.post("/api/download", async (req, res) => {
  const { reelUrl } = req.body;

  try {
    if (!reelUrl || !reelUrl.includes("instagram.com")) {
      return res.status(400).json({ success: false, message: "Invalid link" });
    }

    // Instagram oEmbed API (public)
    const apiUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(reelUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.thumbnail_url) {
      throw new Error("Failed to fetch reel info");
    }

    // Thumbnail को download करना
    const fileName = `reel_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, fileName);
    const imageStream = await fetch(data.thumbnail_url);
    const buffer = await imageStream.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    res.json({ success: true, fileUrl: `/download/${fileName}` });

    // Auto delete after 1 minute
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("⚠ Cleanup failed:", err.message);
      }
    }, 60 * 1000);
  } catch (err) {
    console.error("💥 Download failed:", err);
    res.status(500).json({ success: false, message: "Download failed" });
  }
});

// File serve route
app.get("/download/:fileName", (req, res) => {
  const file = path.join(__dirname, req.params.fileName);
  res.download(file);
});

app.listen(PORT, () => {
  console.log(`✅ Sharad Insta Pro running at http://localhost:${PORT}`);
});