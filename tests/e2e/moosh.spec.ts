import { test, expect, Page } from '@playwright/test';

// The Moosh — vertical-slice regression suite.
//
// Every test drives the game through window.__bg (the Test API in main.ts):
// hotspots are addressed BY ID, never by guessing pixel coordinates. That is
// the whole point — the old scripts computed screen coords by hand and clicks
// silently missed whenever the camera had panned. Id-driven actions can't miss.
//
// Each `test.describe` block below is anchored to a bug we actually shipped and
// a user caught. New bug → new test here, so it can never come back.

// A tiny typing so the specs read cleanly without `as any` everywhere.
type BG = {
  ready(): boolean;
  state(): { phase: string; hasParsley: boolean; garnished: boolean; photoFails: number; fridgeOpen: boolean; hasSock: boolean };
  hotspots(): string[];
  examine(id: string): void;
  use(id: string): void;
  photo(id: string): void;
  caption(): string;
  chat(): string[];
  choices(): string[];
  choose(needle: string): void;
  phoneOpen(): boolean;
  camOpen(): boolean;
  openPhone(): void;
  closePhone(): void;
};
declare global {
  interface Window { __bg: BG }
}

async function boot(page: Page) {
  await page.goto('/?scene=moosh');
  await page.locator('#btnStart').waitFor();
  await page.waitForFunction(() => window.__bg?.ready?.());
  await page.locator('#btnStart').click();
  await page.waitForTimeout(150);
}
// Run a callback in the page with window.__bg injected as its argument. The
// callback must be pure (no closed-over test variables) — it's stringified and
// re-parsed in the browser. For dynamic args, use page.evaluate directly.
function bg<T>(page: Page, fn: (b: BG) => T): Promise<T> {
  return page.evaluate(`(${fn.toString()})(window.__bg)`) as Promise<T>;
}

test.describe('the garnish exploit (fool the classifier with plastic parsley)', () => {
  test('garnish the moosh, photograph it, and the mistake approves the refund', async ({ page }) => {
    await boot(page);
    await bg(page, b => b.use('plant'));                 // collect the immortal parsley from the sill
    expect(await bg(page, b => b.state().hasParsley)).toBe(true);
    await bg(page, b => b.use('moosh'));                 // put it on top of the moosh
    expect(await bg(page, b => b.state().garnished)).toBe(true);

    await bg(page, b => b.openPhone());
    await bg(page, b => b.choose('I want a refund'));
    await bg(page, b => b.choose('Open drone-cam'));
    await bg(page, b => b.photo('moosh'));               // a plastic sprig → "restaurant quality" → refund
    await page.waitForTimeout(1200);                     // GRAVY "is typing…" then approves

    expect(await bg(page, b => b.state().phase), 'the garnish should approve the refund').toBe('approved');
    const gravy = (await bg(page, b => b.chat())).filter(t => /GRAVY/.test(t)).join('  ');
    expect(gravy, 'the joke — a plastic sprig upgrades the plate — must land').toContain('PLATED ENTRÉE');
    expect(gravy, 'a raw NN% classifier score must never leak into a chat bubble').not.toMatch(/\d%/);
  });

  test('photographing the moosh WITHOUT the garnish is refused', async ({ page }) => {
    await boot(page);
    await bg(page, b => b.openPhone());
    await bg(page, b => b.choose('I want a refund'));
    await bg(page, b => b.choose('Open drone-cam'));
    await bg(page, b => b.photo('moosh'));               // bare moosh → UNRECOGNIZED → no refund
    await page.waitForTimeout(1000);
    expect(await bg(page, b => b.state().phase), 'no garnish, no approval').toBe('wantPhoto');
    expect(await bg(page, b => b.state().photoFails)).toBeGreaterThan(0);
  });

  // Generalises the bug: no classifier verdict, for any photographed prop,
  // may carry a percentage into conversation.
  for (const id of ['window', 'mug', 'fridge', 'plant']) {
    test(`photographing "${id}" leaks no score into chat`, async ({ page }) => {
      await boot(page);
      await bg(page, b => b.openPhone());
      await bg(page, b => b.choose('I want a refund'));
      await bg(page, b => b.choose('Open drone-cam'));
      await page.evaluate((hid) => window.__bg.photo(hid), id);
      await page.waitForTimeout(1000);
      const gravy = (await bg(page, b => b.chat())).filter(t => /GRAVY/.test(t)).join('  ');
      expect(gravy).not.toMatch(/\d%/);
    });
  }
});

test.describe('the chat-exit bug (IMG_9309)', () => {
  test('the exit button is fully on-screen and closes the phone', async ({ page }) => {
    await boot(page);
    await bg(page, b => b.openPhone());
    await expect(page.locator('#phone')).toHaveClass(/show/);

    const box = await page.locator('#phoneExit').boundingBox();
    const vp = page.viewportSize()!;
    expect(box, 'exit button must exist').not.toBeNull();
    expect(box!.y, 'exit must not be clipped off the top').toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height, 'exit must not fall below the fold').toBeLessThanOrEqual(vp.height);
    expect(box!.x + box!.width, 'exit must not sit off the right edge').toBeLessThanOrEqual(vp.width);

    await page.locator('#phoneExit').click();
    await expect(page.locator('#phone')).not.toHaveClass(/show/);
  });

  test('re-entering the chat resumes where we left off', async ({ page }) => {
    await boot(page);
    await bg(page, b => b.openPhone());
    await bg(page, b => b.choose('I want a refund'));
    await page.locator('#phoneExit').click();
    await expect(page.locator('#phone')).not.toHaveClass(/show/);
    // reopen — the refund conversation should still be there, not a fresh hello
    await bg(page, b => b.openPhone());
    const chat = (await bg(page, b => b.chat())).join('  ');
    expect(chat).toContain('I want a refund');
  });
});

test.describe('content integrity', () => {
  test('every hotspot yields a non-empty examine line', async ({ page }) => {
    await boot(page);
    for (const id of await bg(page, b => b.hotspots())) {
      await page.evaluate((hid) => window.__bg.examine(hid), id);
      const cap = await bg(page, b => b.caption());
      expect(cap, `examining "${id}" should say something`).not.toBe('');
    }
  });
});

test.describe('the winning path', () => {
  test('parsley → garnish → photo → approve → terminate → end card', async ({ page }) => {
    await boot(page);

    await bg(page, b => b.use('plant'));
    expect(await bg(page, b => b.state().hasParsley)).toBe(true);

    await bg(page, b => b.use('moosh'));
    expect(await bg(page, b => b.state().garnished)).toBe(true);

    await bg(page, b => b.openPhone());
    await bg(page, b => b.choose('I want a refund'));
    await bg(page, b => b.choose('Open drone-cam'));
    await bg(page, b => b.photo('moosh'));  // plated → auto-approve
    await page.waitForTimeout(1200);
    expect(await bg(page, b => b.state().phase)).toBe('approved');

    await bg(page, b => b.choose('Account settings'));
    await bg(page, b => b.choose('TERMINATE ACCOUNT'));
    await bg(page, b => b.choose('TERMINATE. NOW.'));
    await page.waitForTimeout(300);

    // hold-to-terminate is a genuine press-and-hold — drive it on the DOM
    const hold = page.locator('.choice', { hasText: 'HOLD TO TERMINATE' });
    const bb = await hold.boundingBox();
    await page.mouse.move(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2);
    // hold well past the ~900ms threshold — setInterval ticks get throttled
    // under load, so give generous headroom to keep this deterministic
    await page.mouse.down();
    await page.waitForTimeout(2400);
    await page.mouse.up();

    await expect(page.locator('#endPage')).toBeVisible({ timeout: 4000 });
  });
});
