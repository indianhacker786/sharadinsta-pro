// insta-cookie-extractor.js
import puppeteer from "puppeteer";
import fs from "fs";

async function extractCookies() {
  console.log("Opening Instagram…");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });

  console.log("👉 Please login manually. Username, password डालो.");
  console.log("✔ After login, wait for home feed to load.");
  console.log("✔ Then press ENTER here in terminal.");

  // Wait for ENTER key
  await new Promise((resolve) => process.stdin.once("data", resolve));

  const cookies = await page.cookies();

  const cookieString = cookies
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  fs.writeFileSync("cookies.txt", cookieString);
  console.log("\n🍪 Cookies saved to cookies.txt");

  await browser.close();
  process.exit(0);
}

extractCookies();