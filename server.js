import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// 📥 Download Reel API
// ==============================
app.post("/api/download", async (req, res) => {
  const { reelUrl } = req.body;
  console.log("📩 Request received:", reelUrl);

  if (!reelUrl || !reelUrl.includes("instagram.com")) {
    return res.status(400).json({ success: false, message: "Invalid link" });
  }

  const timestamp = Date.now();
  const filePath = path.join(__dirname, `reel-${timestamp}.mp4`);
  const command = `yt-dlp -f best -o "${filePath}" "${reelUrl}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ yt-dlp error:", stderr);
      return res.status(500).json({ success: false, message: "Download failed" });
    }

    console.log("✅ Download complete:", filePath);
    res.json({ success: true, fileUrl: `/download/${path.basename(filePath)}` });

    // 🕐 Auto-delete after 1 minute
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🗑 File deleted after 1 minute:", path.basename(filePath));
        }
      } catch (e) {
        console.warn("⚠ Cleanup failed:", e.message);
      }
    }, 60 * 1000);
  });
});

// ==============================
// ⬇ Serve file for download
// ==============================
app.get("/download/:fileName", (req, res) => {
  const file = path.join(__dirname, req.params.fileName);
  res.download(file);
});

// ==============================
// ✅ Start Server
// ==============================
app.listen(PORT, () =>
  console.log(`✅ Sharad Insta Pro running at http://localhost:${PORT}`)
);