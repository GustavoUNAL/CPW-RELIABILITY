import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE = process.env.INFORME_URL ?? "http://127.0.0.1:5175/informes/informe-mensual";
const OUT = resolve(
  process.env.INFORME_PDF ??
    "data/Agosto/Informe mensual COPOWER - Agosto 2026.pdf",
);
const EXE =
  process.env.CHROME_FOR_TESTING ??
  resolve(
    ".pw-browsers/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  );

mkdirSync(dirname(OUT), { recursive: true });

const browser = await chromium.launch({
  executablePath: EXE,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
await page.addInitScript(() => {
  localStorage.setItem(
    "cpw-auth-session-v1",
    JSON.stringify({
      id: "usr-gustavo",
      email: "gustavo@copower.com",
      name: "Gustavo Arteaga",
      role: "admin",
    }),
  );
});
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("#lamina-1", { timeout: 30000 });
await page.waitForSelector("#lamina-13");
await page.evaluate(async () => {
  await Promise.all(
    [...document.images].map((img) =>
      img.complete ? null : new Promise((res) => {
        img.addEventListener("load", res, { once: true });
        img.addEventListener("error", res, { once: true });
      }),
    ),
  );
});
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: OUT,
  width: "10in",
  height: "7.5in",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log(OUT);
