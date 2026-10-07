/**
 * Makes the sponsorship brochure (public/ufc-sponsorship-brochure.pdf) from the Support us page, one PDF page per section.
 *
 *   npm run dev                                    (in another terminal)
 *   node scripts/make-brochure.mjs                 uses http://localhost:3000
 *   node scripts/make-brochure.mjs https://www.fossclub.tech
 *
 * Needs Playwright (npx playwright install chromium) and `pdfunite` (poppler-utils) to join the pages. If Playwright is not installed in this
 * project, point PLAYWRIGHT_DIR at a folder that has it. Run it again after editing the page or src/components/support/support-data.ts.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, "x.js") : import.meta.url);
const { chromium } = require("playwright");

const base = process.argv[2] ?? "http://localhost:3000";
const out = path.join(root, "public", "ufc-sponsorship-brochure.pdf");
// Links inside the PDF point at the real site, whichever address the page was read from.
const site = (process.env.SITE_URL ?? "https://www.fossclub.tech").replace(/\/$/, "");
const WIDTH = 1280;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
await page.goto(`${base}/support-us`, { waitUntil: "networkidle" });

// Everything on the page fades in as it scrolls into view, so scroll through it once and mark it all as seen.
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < height; y += 600) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(250);
}
await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-in", "")));
await page.waitForTimeout(1200);

await page.evaluate(
  ({ origin, site }) => {
    document.querySelectorAll("a[href]").forEach((a) => {
      if (a.href.startsWith(origin)) a.setAttribute("href", site + a.href.slice(origin.length));
    });
  },
  { origin: new URL(base).origin, site },
);

// A brochure has no menu, footer or download button.
await page.addStyleTag({
  content: `
    body { background: #fff !important; }
    nav, header, footer, [data-brochure], [data-sticker-hint] { display: none !important; }
    main > section:first-of-type { padding-top: 4.5rem !important; }
    main > :not(section) { display: none !important; }
    main > section:first-of-type [data-ticket] { grid-template-columns: 1fr 1fr !important; }
  `,
});

const count = await page.evaluate(() => document.querySelectorAll("main > section").length);
const dir = mkdtempSync(path.join(tmpdir(), "brochure-"));
const parts = [];
try {
  for (let i = 1; i <= count; i++) {
    await page.evaluate((i) => {
      document.getElementById("only")?.remove();
      const style = document.createElement("style");
      style.id = "only";
      style.textContent = `main > section:not(:nth-of-type(${i})) { display: none !important; }`;
      document.head.appendChild(style);
    }, i);
    await page.waitForTimeout(200);
    const h = await page.evaluate(
      (i) => Math.ceil(document.querySelector(`main > section:nth-of-type(${i})`).getBoundingClientRect().height),
      i,
    );
    const file = path.join(dir, `part-${String(i).padStart(2, "0")}.pdf`);
    await page.pdf({
      path: file,
      width: `${WIDTH}px`,
      height: `${h}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    parts.push(file);
  }
  const joined = path.join(dir, "joined.pdf");
  execFileSync("pdfunite", [...parts, joined]);
  try {
    // The paper textures make the raw file large. Ghostscript shrinks it and keeps the text and the links.
    execFileSync("gs", [
      "-q",
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.5",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dBATCH",
      `-sOutputFile=${out}`,
      joined,
    ]);
  } catch {
    console.warn("Ghostscript (gs) is not available, so the brochure was not shrunk.");
    copyFileSync(joined, out);
  }
  console.log(`wrote ${path.relative(root, out)} (${count} pages)`);
} finally {
  rmSync(dir, { recursive: true, force: true });
  await browser.close();
}
