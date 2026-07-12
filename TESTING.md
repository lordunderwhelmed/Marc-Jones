# Testing — run it on your Mac, not on tokens

Everything here runs locally. None of it spends Claude tokens. The point is that
Claude writes the tests once; you (or CI) run them forever for free, and only
loop Claude back in when something actually fails.

## One-time setup

```bash
npm install
npx playwright install chromium     # ~120 MB, once
```

## The three checks

| Command | What it proves | Speed | Tokens |
|---|---|---|---|
| `npm run test:scenes` | Every blockout scene is *completable* (headless BFS solver) and has no dead content | instant | 0 |
| `npm run test:e2e` | The styled slice plays correctly in a real browser, portrait **and** desktop | ~15 s | 0 |
| `npm run shots` | A gallery of labelled screenshots to eyeball by hand | ~20 s | 0 |
| `npm test` | scenes + e2e together — the pre-push gate | ~20 s | 0 |

`npm run test:e2e` auto-starts the dev server (and reuses one if it's already
running). To watch the tests drive the game in Playwright's time-travel UI:

```bash
npm run test:e2e -- --ui
```

Failed? `npm run test:report` opens the trace with a DOM snapshot at every step.

## Why these tests can't flake

Every test drives the game through **`window.__bg`**, the test API defined at
the bottom of `src/main.ts`. It addresses things **by hotspot id**:

```js
window.__bg.use('plant')     // walk to the fern and pick the parsley
window.__bg.photo('moosh')   // frame the moosh in drone-cam and hit the shutter
window.__bg.choose('I want a refund')
window.__bg.chat()           // → array of every chat bubble's text
window.__bg.state()          // → { phase, hasParsley, garnished, … }
```

The old throwaway scripts computed screen pixels by hand, and clicks *silently
missed* whenever the camera had panned — the character just never walked, and
the test "passed" by doing nothing. Id-driven actions can't miss, so a green run
means the game genuinely works, not that the click landed on empty floor.

## Every test is anchored to a real bug

`tests/e2e/moosh.spec.ts` is organised by the bugs you caught, so none can come
back:

- **the fern photo bug (IMG_9310)** — a raw classifier score (`91%`) leaked into
  GRAVY's chat bubble. The test asserts the joke survives (`SALAD (undressed)`)
  but no `NN%` ever appears in conversation, for the fern and other props.
- **the chat-exit bug (IMG_9309)** — the ✕ was clipped off the top of the
  screen in portrait. The test measures the button's box against the viewport in
  both orientations and confirms it closes the phone, then that re-opening
  *resumes* the conversation instead of restarting it.
- **content integrity** — every hotspot returns a non-empty examine line.
- **the winning path** — parsley → garnish → photo → approve → terminate → end
  card, asserting the phase machine at each gate.

**When you hit a new bug:** tell Claude, it adds one `test(...)` here that fails
on the bug, fixes it, and the test guards it permanently. That's the loop —
Claude touches the code, your Mac runs the suite.

## CI (optional)

The same three commands run in GitHub Actions on push. See
`.github/workflows/test.yml`. Chromium is cached, so a run is ~1 minute and,
again, zero Claude tokens.
