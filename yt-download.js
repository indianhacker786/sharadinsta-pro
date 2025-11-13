import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Identify Link Type
function detectType(url) {
  if (url.includes("/stories/")) return "story";
  if (url.includes("/reel/")) return "reel";
  if (url.includes("/p/")) return "post";
  return "unknown";
}

export function downloadReel(reelUrl) {
  return new Promise((resolve, reject) => {
    const type = detectType(reelUrl);
    const timestamp = Date.now();
    const filePath = path.join(__dirname, `ig-${timestamp}.mp4`);

    // Different commands for story vs reel/post
    let command = "";

    if (type === "story") {
      // Instagram Story Download
      command = `yt-dlp --cookies cookies.txt --user-agent "Mozilla/5.0" -o "${filePath}" "${reelUrl}"`;
    } else {
      // Instagram Reel/Post Download
      command = `yt-dlp --cookies cookies.txt -f best -o "${filePath}`" "${reelUrl}";
    }

    console.log("Running:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("yt-dlp error:", stderr);
        return reject("Download failed");
      }

      console.log("Download complete:", filePath);
      resolve(filePath);
    });
  });
}