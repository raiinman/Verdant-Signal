/**
 * Captures the live Zenom Alpha reference at every mandated QA viewport.
 * Read-only: navigates, waits for the telemetry poll to paint, screenshots.
 * Never submits forms, never touches payment or wallet controls.
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { VIEWPORTS } from './viewports.mjs';

const TARGET = 'https://www.zenomalpha.com/';
const OUT = 'reference/screens/reference';

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });
const manifest = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.width < 768,
    hasTouch: vp.width < 768,
  });
  const page = await ctx.newPage();
  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 });
  // Let the 3s telemetry poll land at least once so cards are populated.
  await page.waitForTimeout(4000);

  await page.screenshot({ path: `${OUT}/${vp.name}-viewport.png` });
  await page.screenshot({ path: `${OUT}/${vp.name}-full.png`, fullPage: true });

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    hasHorizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  manifest.push({ ...vp, ...metrics });
  console.log(`captured ${vp.name}  h=${metrics.scrollHeight}  xoverflow=${metrics.hasHorizontalOverflow}`);
  await ctx.close();
}

await writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
await browser.close();
console.log('reference capture complete');
