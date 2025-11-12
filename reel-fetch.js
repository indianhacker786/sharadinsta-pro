// reel-fetch.js
import fetch from "node-fetch";

/**
 * getReelUrl(instagramUrl)
 * returns direct mp4 url from a public Instagram reel link
 */
export async function getReelUrl(instagramUrl) {
  if (!instagramUrl.includes("instagram.com/reel/")) {
    throw new Error("Invalid Instagram URL");
  }

  const apiUrl = instagramUrl.replace("/reel/", "/p/").split("?")[0] + "/?_a=1&_d=dis";
  console.log("🔍 Fetching meta from:", apiUrl);

  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept-Language": "en"
    }
  });

  if (!res.ok) throw new Error("Failed to fetch reel data");

  const data = await res.json();
  // different Instagram structures appear depending on account type
  const media =
    data?.items?.[0]?.video_versions?.[0]?.url ||
    data?.graphql?.shortcode_media?.video_url ||
    data?.data?.xdt_shortcode_media?.video_url;

  if (!media) throw new Error("No video found. Possibly private reel.");
  console.log("✅ Video URL fetched:", media);
  return media;
}