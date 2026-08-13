#!/usr/bin/env node
/**
 * Exporta el informe completo a PDF (A3 apaisado) con logo COPOWER
 * en encabezado y pie de cada página.
 *
 * Uso: node scripts/export-informe-pdf.mjs
 * Requiere el servidor Vite en http://127.0.0.1:5175
 */
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const URL = process.env.INFORME_URL ?? "http://localhost:5175/informes/reporte-completo";
const OUT =
  process.env.INFORME_PDF_OUT ??
  path.join(ROOT, "data/Julio/Informe de Confiabilidad - Julio 2026.pdf");
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const logoPath = path.join(ROOT, "public/brand/copower-logo.png");
const logoB64 = (await readFile(logoPath)).toString("base64");
const logoSrc = `data:image/png;base64,${logoB64}`;

const headerTemplate = `
  <div style="width:100%; box-sizing:border-box; padding:0 12mm; display:flex; align-items:center; gap:10px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#15202b; border-bottom:1.6pt solid #1e2a78;">
    <img src="${logoSrc}" style="height:28px; width:auto;" />
    <div style="flex:1; min-width:0;">
      <div style="font-size:10px; font-weight:700; line-height:1.2;">Informe de confiabilidad</div>
      <div style="font-size:8px; color:#5c6e7e;">Parque de generación Putumayo Norte · Julio 2026 · Costayaco / Vonú</div>
    </div>
    <div style="font-size:8px; font-weight:650; color:#5c6e7e; white-space:nowrap;">Gran Tierra Energy</div>
  </div>
`;

const footerTemplate = `
  <div style="width:100%; box-sizing:border-box; padding:0 12mm; display:flex; align-items:center; gap:8px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#5c6e7e; border-top:1pt solid #1e2a78;">
    <img src="${logoSrc}" style="height:16px; width:auto;" />
    <div style="flex:1; font-size:8px; line-height:1.25;">
      COPOWER Energy Solutions · Informe de confiabilidad · Costayaco / Vonú · Julio 2026 · Uso interno · Confidencial
    </div>
    <div style="font-size:8px; white-space:nowrap;">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>
  </div>
`;

const puppeteer = (await import("puppeteer-core")).default;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--disable-gpu", "--font-render-hinting=none"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
  page.setDefaultTimeout(180_000);

  console.log("Cargando", URL);
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 180_000 });
  await page.waitForSelector(".informes-report-page .inf-report-cover, .informes-report-page .exec-header");

  await page.evaluate(async () => {
    document.documentElement.classList.add("inf-pdf-export");
    document.querySelectorAll("details").forEach((el) => {
      el.open = true;
    });
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });

  // Recharts / layout tras abrir todos los details
  await new Promise((r) => setTimeout(r, 4000));
  await page.emulateMediaType("print");
  await new Promise((r) => setTimeout(r, 800));

  await mkdir(path.dirname(OUT), { recursive: true });
  await page.pdf({
    path: OUT,
    format: "A3",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    margin: { top: "18mm", bottom: "16mm", left: "12mm", right: "12mm" },
  });
  console.log("PDF escrito:", OUT);
} finally {
  await browser.close();
}
