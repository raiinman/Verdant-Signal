/**
 * Captures the Verdant Signal implementation at every mandated QA viewport,
 * against the production build served by `vite preview`.
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { VIEWPORTS } from './viewports.mjs';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const OUT = 'reference/screens/implementation';

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  shell: true,
});

const shutdown = () => { try { server.kill(); } catch { /* already gone */ } };
process.on('exit', shutdown);

// Wait for the preview server to answer.
const deadline = Date.now() + 30000;
for (;;) {
  try {
    const res = await fetch(BASE);
    if (res.ok) break;
  } catch { /* not up yet */ }
  if (Date.now() > deadline) { shutdown(); throw new Error('preview server did not start'); }
  await new Promise((r) => setTimeout(r, 400));
}

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
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: `${OUT}/${vp.name}-viewport.png` });
  await page.screenshot({ path: `${OUT}/${vp.name}-full.png`, fullPage: true });

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    hasHorizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    tableVisible: !!document.querySelector('.vs-terminal__tablewrap')
      && getComputedStyle(document.querySelector('.vs-terminal__tablewrap')).display !== 'none',
    cardsVisible: !!document.querySelector('.vs-terminal__cards')
      && getComputedStyle(document.querySelector('.vs-terminal__cards')).display !== 'none',
    slotRows: document.querySelectorAll('.vs-terminal__row').length,
    slotCards: document.querySelectorAll('.vs-slotcard').length,
  }));
  manifest.push({ ...vp, ...metrics });
  console.log(
    `captured ${vp.name}  h=${metrics.scrollHeight}  xoverflow=${metrics.hasHorizontalOverflow}` +
    `  table=${metrics.tableVisible} cards=${metrics.cardsVisible}`,
  );
  await ctx.close();
}

await writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
await browser.close();
shutdown();
console.log('implementation capture complete');
