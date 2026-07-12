# Vertical Slice — "The Moosh" (Beat 1 of Chapter Zero)

*The engineering paradigm: one room, one scene, one puzzle — but every
system in the game passes through it. If a feature isn't in the slice, the
feature doesn't exist. The slice is Beat 1 of the intro (`story/INTRO.md`):
Zosia's kitchen, 02:07am, the delivery is moosh.*

---

## 1. Why this scene as the slice

- Smallest complete unit that exercises **all** core systems (list in §4).
- It's the first thing players will ever touch — polish invested here ships.
- One room, one NPC-ish entity (the refund chatbot), 2-step puzzle, one
  narrator arc (cues N-010…N-012), one clip moment, both orientations.
- It ends on the TERMINATE press — the game's single most important
  interaction (design goal: *the most satisfying button in games*), so the
  slice forces the haptics/audio/visual juice pipeline to exist early.

## 2. The scene

**Room:** Zosia's kitchen, night, rain. One window (neon-lit rain outside,
Ferrari color-cycle on the rain), fridge, counter, windowsill with a fake
plastic plant, wall-mounted delivery hatch, a table, her phone (propped
against a mug — the phone screen is the dialogue/chatbot surface).

**Beats:**
1. Delivery hatch chimes; tray slides out carrying *the moosh*. Player
   explores (~12–15 hotspots, every examine line is a joke or a
   characterization beat — no dead "it's a fridge" lines, per the
   LucasArts failure-response rule).
2. Player opens the refund flow on the phone → chatbot demands "a photo of
   the item as delivered." Drone-cam interface opens: the classifier
   labels everything in view *except* the moosh (`UNRECOGNIZED — is it
   alive?`). Refund blocked: "no food detected."
3. **The puzzle (2 steps, cartoon-logic, learnable):** the fake plastic
   parsley on the windowsill plant. Pick it, garnish the moosh, re-photo:
   classifier: `PLATED ENTRÉE (restaurant quality) ✓ 99.2%`. Refund
   approved, +$0.03 "inconvenience credit."
4. Zosia looks at the parsley. Looks at the moosh. Scrolls past the refund
   confirmation to ACCOUNT → TERMINATE. Player presses. Thunk. Counter: 1.
   Narrator N-012. Cut.

**Difficulty dial (the "tiny bit too hard" target):** the DOTT school —
irrational but *inevitable* (cartoon logic the scene itself teaches: the
classifier has already demonstrated, on other hotspots, that it labels by
surface garnish, not substance — examine the fridge's "cheese-style slices"
and the window's "self-cleaning coating" stickers to learn the world's rule:
*labels beat contents*). No hint-companion in the slice; instead the
narrator idle line and one escalating nudge after 4 failed photo attempts
("The drone knows what food looks like. It has never once known what food
is."). Calibration knobs exposed in data: attempts-before-nudge, nudge
copy, hotspot glow strength.

**Wrong-attempt jokes (reward intent):** photographing the fridge contents,
the plant itself, Zosia's face, the rain — each returns an authored
classifier misfire (the plant: `SALAD (undressed)` — which is *also the
clue*). Minimum 10 authored failure lines; stock failures are a build error.

## 3. Definition of Done (acceptance criteria)

1. Playable start-to-terminate in browser (desktop + Android/iOS Safari),
   installed PWA, and a Capacitor debug build on one real iPhone + one
   Android device.
2. **Both orientations**, switchable mid-scene: landscape = full room;
   portrait = crop-and-pan camera on the room's focus corridor + "Book
   panel" (dialogue/inventory) in the bottom thumb zone. TERMINATE button
   renders in thumb zone in portrait.
3. Haptics fire through the abstraction layer on: hotspot scrub (Android
   web + both Capacitor builds), moosh squelch (impact), classifier
   verdict (notification), TERMINATE thunk (the flagship pattern —
   iterate until it *feels* right in hand). Gamepad rumble path smoke-tested
   on desktop Chrome.
4. Narrator VO pipeline: N-010/011/012 + idle + nudge lines load from cue
   IDs, duck the music, play once per rule (repetition-aware).
5. iMUSE-lite: rain ambience bed + two music stems (kitchen theme, chatbot
   hold-music corruption layer) with bar-quantized transitions; terminate
   press hits a musical flourish synced with the haptic.
6. **Moments engine v0**: the solve (parsley → verdict → terminate) renders
   to a clean 1080×1920 vertical clip in-engine (no UI), with title card
   and end card, saved/shared via native share sheet on Capacitor and file
   download on web.
7. Save/resume mid-scene (IndexedDB), full offline replay after first load,
   initial payload < 5 MB.
8. Art at 384×216 discipline: palette-LUT post pass on, sprites 8–12fps,
   text at native res. One dynamic light (the phone's glow on Zosia's face)
   over painterly art — the whole art-direction thesis in one image.
9. All scene content loaded from data (room JSON, ink dialogue, cue table,
   puzzle graph) — zero scene logic hardcoded in engine TypeScript.
10. The intro's puzzle-dependency mini-graph validates in CI (the "never
    stuck" checker exists, even if trivial at this scale).

## 4. Systems the slice forces into existence

Room renderer + walkboxes/A* · hotspot system + examine layer · two-verb
input (pointer-events, touch + mouse + gamepad-cycling stub) · inventory
(1 item is enough: the parsley) · dialogue runner (ink) with a
classifier-NPC · narrator cue system · haptics abstraction (4 drivers) ·
audio engine (stems + ducking + flourish sync) · palette-LUT + dynamic
light + color-cycling shaders · portrait/landscape camera + responsive UI ·
Moments engine v0 (deterministic replay → offscreen render → encode) ·
save store · asset pipeline (Aseprite/LDtk/ink → build) · PDC validator ·
PWA + Capacitor + (deferred: Electron) shells.

## 5. Engineering paradigm

- **Slice-first, always.** After this slice ships, every subsequent feature
  lands as a change to the slice or a new scene using only data files. The
  slice is the permanent integration test and the demo.
- **Content is data.** Rooms (LDtk JSON), dialogue (ink), narration (cue
  table CSV/JSON), puzzles (dependency-graph JSON), palettes (LUT PNGs).
  Engine code knows genres of things, never specific things.
- **The stack** (per `DESIGN.md` §6): TypeScript + PixiJS v8, Vite build,
  Workbox PWA, Capacitor 7. Moments encoder: WebCodecs VideoEncoder +
  **Mediabunny** muxer (mp4-muxer is deprecated), encoding in a Web Worker;
  scene rendered to a `RenderTexture` at native low res and nearest-neighbor
  upscaled to 1080×1920. Audio in clips: AAC where supported; on iOS <26
  (no AudioEncoder in WebKit) ship silent clips v0 and revisit. Share via
  `@capacitor/share` + `@capacitor-community/media` (camera roll).
- **Repo layout (proposal):**
  `engine/` (rendering, input, haptics, audio, moments, save) ·
  `game/` (scene data, ink, cues, art, palettes) ·
  `tools/` (PDC validator, cue-slate splitter for VO WAVs, palette checker) ·
  `shells/` (pwa, capacitor, electron) · `story/`, `*.md` (design).
- **Testing:** PDC validation + puzzle-solvability simulation (a bot that
  brute-forces the scene's action space and must find exactly the authored
  solutions) in CI; visual regression on the room render; the slice must
  boot headless for the bot.

## 6. Slice backlog (build order)

1. Boot + room render + camera (both orientations) — the "walking skeleton."
2. Hotspots + examine + input on all pointer types.
3. Ink dialogue + chatbot scene.
4. Puzzle state + inventory + classifier verdicts.
5. Haptics layer + TERMINATE juice pass.
6. Audio stems + narrator cues (scratch VO: text-to-speech placeholders
   until Session A is recorded — clearly watermarked as scratch).
7. Palette LUT + phone-glow light + rain color-cycle.
8. Save/resume + PWA offline.
9. Moments engine v0.
10. Capacitor builds + device haptics tuning session.
11. Polish lock: examine-line pass, wrong-attempt joke pass, difficulty
    knob tuning with 3–5 playtesters (measure: time-to-parsley, hint uses).
