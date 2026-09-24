// Gera PNG e PDF da carta para cada nome passado.
// Uso: node render.mjs "Bia Gomes" "Maria Silva"
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const nomes = process.argv.slice(2);
if (nomes.length === 0) nomes.push("Bia Gomes");

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 3 });

for (const nome of nomes) {
  const slug = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const url = `file://${dir}/carta.html?nome=${encodeURIComponent(nome)}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".carta").screenshot({ path: `${dir}/saida/carta-${slug}.png` });
  await page.pdf({ path: `${dir}/saida/carta-${slug}.pdf`, width: "148mm", height: "210mm", printBackground: true });
  console.log(`ok: ${nome}`);
}

await browser.close();
