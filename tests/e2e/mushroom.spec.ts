import { test, expect, Page } from '@playwright/test';

// Beat 2 — "The Mushroom" (styled). Same id-driven Test API discipline as the
// Moosh suite: everything is addressed by hotspot id and dialog-choice text,
// never by pixel coordinates. This scene is painted by the styled renderer but
// driven by the SAME Interp as the grey-box blockout, so these tests also guard
// that the renderer-agnostic logic survived the styling.

type BG = {
  ready(): boolean;
  state(): { started: boolean; dialogOpen: boolean; ended: boolean; flags: Record<string, unknown>; unlocked: string[] };
  hotspots(): string[];
  examine(id: string): void;
  use(id: string): void;
  caption(): string;
  chat(): string[];
  choices(): string[];
  choose(needle: string): void;
  openPhone(): void;
  closePhone(): void;
  phoneOpen(): boolean;
  reveal(): void;
};
declare global { interface Window { __bg: BG } }

async function boot(page: Page) {
  await page.goto('/?scene=mushroom');
  await page.locator('#btnStart').waitFor();
  await page.waitForFunction(() => window.__bg?.ready?.());
  await page.locator('#btnStart').click();
  await page.waitForTimeout(700);   // interp.start() → entry cue
}
function bg<T>(page: Page, fn: (b: BG) => T): Promise<T> {
  return page.evaluate(`(${fn.toString()})(window.__bg)`) as Promise<T>;
}
// choices update synchronously on choose(); a small settle keeps it robust
async function choose(page: Page, needle: string) {
  await page.evaluate((n) => window.__bg.choose(n), needle);
  await page.waitForTimeout(250);
}

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

test.describe('the judo-phrase gate (learn "adverse event" before the funnel yields)', () => {
  test('the funnel hides the escalation phrase until you find it on the shelf', async ({ page }) => {
    await boot(page);
    // straight to the funnel, WITHOUT reading the insurance letter
    await bg(page, b => b.openPhone());
    await choose(page, 'poisoned');                       // → triage
    const before = await bg(page, b => b.choices());
    expect(before.join(' '), 'the liability phrase must stay locked until learned')
      .not.toContain('ADVERSE EVENT');
  });

  test('learning it on the shelf unlocks the phrase in the funnel', async ({ page }) => {
    await boot(page);
    await bg(page, b => b.use('shelf'));                  // the letter: "adverse event" → mandatory human review
    expect(await bg(page, b => b.state().unlocked)).toContain('adverse');

    await bg(page, b => b.use('phone'));
    await choose(page, 'poisoned');                       // → triage
    const after = await bg(page, b => b.choices());
    expect(after.join(' '), 'once learned, the phrase is offered').toContain('ADVERSE EVENT');
  });
});

test.describe('the winning path', () => {
  test('shelf → funnel → adverse event → human → terminate → montage', async ({ page }) => {
    test.setTimeout(45000);   // the montage climb is a real timed sequence
    await boot(page);

    await bg(page, b => b.use('shelf'));
    expect(await bg(page, b => b.state().unlocked)).toContain('adverse');

    await bg(page, b => b.use('phone'));
    expect(await bg(page, b => b.phoneOpen())).toBe(true);

    await choose(page, 'poisoned');                       // → triage
    await choose(page, 'ADVERSE EVENT');                  // the one vocabulary the funnel must escalate → human
    // Dana, a person, fixes it in nine seconds
    await choose(page, 'nine seconds');
    expect(await bg(page, b => b.state().flags.fixed), 'the human resolves it').toBe(true);

    await choose(page, 'Account settings');
    await choose(page, 'TERMINATE ACCOUNT');
    await choose(page, 'TERMINATE. NOW.');
    await page.waitForTimeout(400);

    expect(await bg(page, b => b.state().flags.terminated)).toBe(true);
    expect(await bg(page, b => b.state().ended)).toBe(true);
    await expect(page.locator('#endPage')).toBeVisible({ timeout: 4000 });

    // the montage lands on the night's full toll and hands to the next beat
    await page.waitForFunction(
      () => document.getElementById('counterBig')!.textContent === '555,789',
      undefined, { timeout: 25000 },
    );
    expect(await bg(page, () => document.getElementById('endNext')!.textContent)).toContain('The Ticket');
  });
});

test.describe('the two-scene through-line', () => {
  test('the Moosh end card offers a real button into The Mushroom', async ({ page }) => {
    await page.goto('/?scene=moosh');
    await page.locator('#btnStart').waitFor();
    await page.waitForFunction(() => window.__bg?.ready?.());
    // the button exists and is wired the moment the Moosh boots (revealed on the end card)
    const next = page.locator('#btnNext');
    await expect(next).toHaveText(/The Mushroom/);
  });
});
