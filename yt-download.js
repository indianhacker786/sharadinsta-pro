import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function downloadReel(url) {
  return new Promise((resolve, reject) => {
    if (!url || !url.includes("instagram.com")) {
      console.log("❌ Invalid link:", url);
      return reject(new Error("Invalid Instagram URL"));
    }

    const timestamp = Date.now();
    const outputPath = path.join(__dirname, `reel-${timestamp}.mp4`);
    const command = `yt-dlp --no-cache-dir -f best -o "${outputPath}" "${url}"`;

    console.log("▶ Running command:", command);

    exec(command, { maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
      console.log("📥 yt-dlp stdout:", stdout);
      if (error) {
        console.error("❌ yt-dlp error:", stderr);
        return reject(error);
      }

      console.log("✅ Download complete:", outputPath);

      // delete old files (older than 1 minute)
      try {
        const now = Date.now();
        fs.readdirSync(__dirname)
          .filter(f => f.startsWith("reel-") && f.endsWith(".mp4"))
          .forEach(f => {
            const file = path.join(__dirname, f);
            const stat = fs.statSync(file);
            if (now - stat.mtimeMs > 60 * 1000) {
              fs.unlinkSync(file);
              console.log("🗑 Deleted old file:", f);
            }
          });
      } catch (e) {
        console.warn("⚠ Cleanup warning:", e.message);
      }

      resolve(outputPath);
    });
  });
}