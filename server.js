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

// HOME PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API – DOWNLOAD REEL
app.post("/api/download", (req, res) => {
  const { reelUrl } = req.body;

  if (!reelUrl || !reelUrl.includes("instagram.com")) {
    return res.json({ success: false, message: "Invalid link" });
  }

  const timestamp = Date.now();
  const filePath = path.join(__dirname, `reel-${timestamp}.mp4`);

  const cmd = `yt-dlp -f best -o "${filePath}" "${reelUrl}"`;

  exec(cmd, (err) => {
    if (err) {
      console.log("yt-dlp error:", err);
      return res.json({ success: false, message: "Download failed" });
    }

    res.json({
      success: true,
      fileUrl: `/download/${path.basename(filePath)}`,
    });

    // Auto-delete after 1 min
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted:", filePath);
      }
    }, 60 * 1000);
  });
});

// SERVE FILE
app.get("/download/:file", (req, res) => {
  const f = path.join(__dirname, req.params.file);
  res.download(f);
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Sharad Insta Pro running at http://localhost:${PORT}`);
});