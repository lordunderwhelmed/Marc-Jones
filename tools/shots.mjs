#!/usr/bin/env node
// Local screenshot gallery. Drives the vertical slice through the milestones a
// human wants to eyeball (examine, chat, drone-cam, garnish, approve, end card)
// and writes labelled PNGs to tests/__screens__/. Runs on your Mac — zero
// Claude tokens. Review the folder by hand, or open the contact sheet it prints.
//
//   npm run dev            # in one terminal (or let this reuse a running one)
//   npm run shots          # in another
//
// Env knobs:  BG_URL (default http://localhost:5173)  BG_THEME (a|b|c|d)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'tests', '__screens__');
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BG_URL || 'http://localhost:5173';
const THEME = process.env.BG_THEME || 'a';
const URL = `${BASE}/?scene=moosh&theme=${THEME}`;

const exe = process.env.PLAYWRIGHT_CHROMIUM || undefined; // let Playwright resolve by default
const browser = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});

async function run(label, viewport, isMobile) {
  const page = await browser.newPage({ viewport, isMobile, hasTouch: !!isMobile, deviceScaleFactor: isMobile ? 2 : 1 });
  page.on('pageerror', e => console.log(`  ! ${label} pageerror:`, String(e).slice(0, 160)));
  const shot = (name) => page.screenshot({ path: join(OUT, `${label}-${name}.png`) });
  const bg = (fn, arg) => page.evaluate(fn, arg);

  await page.goto(URL);
  await page.locator('#btnStart').waitFor();
  await page.waitForFunction(() => window.__bg?.ready?.());
  await shot('00-start');
  await page.click('#btnStart');
  await page.waitForTimeout(700);

  await bg((id) => window.__bg.examine(id), 'moosh');
  await page.waitForTimeout(500); await shot('01-examine-moosh');

  await bg(() => window.__bg.openPhone());
  await page.waitForTimeout(500); await shot('02-chat');

  await bg(() => window.__bg.choose('I want a refund'));
  await bg(() => window.__bg.choose('Open drone-cam'));
  await page.waitForTimeout(700); await shot('03-dronecam');

  await bg((id) => window.__bg.photo(id), 'plant');
  await page.waitForTimeout(1100); await shot('04-fern-verdict');

  await bg(() => window.__bg.choose('Put the phone down'));
  await bg((id) => window.__bg.use(id), 'plant');
  await page.waitForTimeout(500); await shot('05-parsley');
  await bg((id) => window.__bg.use(id), 'moosh');
  await page.waitForTimeout(500); await shot('06-garnished');

  await bg(() => window.__bg.openPhone());
  await bg(() => window.__bg.choose('Try again'));
  await bg((id) => window.__bg.photo(id), 'moosh');
  await page.waitForTimeout(1300); await shot('07-approved');

  await bg(() => window.__bg.choose('Account settings'));
  await bg(() => window.__bg.choose('TERMINATE ACCOUNT'));
  await bg(() => window.__bg.choose('TERMINATE. NOW.'));
  await page.waitForTimeout(400);
  const hold = page.locator('.choice', { hasText: 'HOLD TO TERMINATE' });
  const bb = await hold.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down(); await page.waitForTimeout(1300); await page.mouse.up();
  await page.waitForTimeout(2200); await shot('08-end-card');

  await page.close();
  console.log(`  ✓ ${label}: 9 shots`);
}

console.log(`■ shooting ${URL}`);
await run('landscape', { width: 1280, height: 720 }, false);
await run('portrait', { width: 390, height: 780 }, true);
await browser.close();
console.log(`\n✓ gallery written to tests/__screens__/`);
