# Research Findings (condensed reference)

Three parallel research tracks conducted 2026-07-12. This file is the sourced
reference behind `DESIGN.md`. Sections: (1) friction pathologies & modern
fixes, (2) hi-bit pixel art direction, (3) cross-platform web stack & haptics.

---

## 1. Why 90s adventures felt slow/tedious/stuck — and every shipped fix

### The pathologies

- **Moon logic** — canonical cases: MI2's "monkey wrench" (a pun that doesn't
  exist outside American English) and Gabriel Knight 3's cat-hair mustache
  (has its own Wikipedia page; semi-jokingly blamed for killing the genre).
- **Pixel hunting** — few-pixel hotspots force screen-sweeping. First fix:
  Simon the Sorcerer II's F10 reveal-all key, now genre standard. Thimbleweed
  Park deliberately omitted it and was criticized for it.
- **Walk friction** — fixed slow SCUMM walk over multi-screen maps; the
  community literally patched fast-walk into the classics via ScummVM hotkeys.
- **Verb walls** — Maniac Mansion: 15 verbs; MI1: 12→9; the panel ate a third
  of the screen and most combos returned stock failures. LucasArts itself
  collapsed it: Full Throttle (1995) icon pop-up → Curse of MI (1997) verb
  coin → modern two-verb default (interact/examine).
- **Dead ends & death** — Sierra's walking-dead states vs LucasArts' no-death
  no-dead-end manifesto ("you buy games to be entertained, not whacked over
  the head every time you make a mistake").
- **Dialogue mowing** — safe play = exhaust every node; fixed by marking seen
  options, auto-collapsing, and Oxenfree's interruptible resumable delivery.
- **Inventory brute force** — V×N×M combinatorics; when stuck, play degrades
  to "rub everything on everything."
- **Goal amnesia** — multi-session play with objectives kept only in the
  player's head.

### Ron Gilbert, "Why Adventure Games Suck" (1989) — the rules
grumpygamer.com/why_adventure_games_suck — clear end objective; obvious
sub-goals; no learn-by-death; no backwards puzzles (lock before key); no
permanently missable items; puzzles advance story; no real-time pressure;
constant incremental reward; arbitrary-puzzle test ("Of course!" not "I never
would've gotten that"); **reward intent**; connected events; keep multiple
puzzles open.

### Puzzle Dependency Charts
grumpygamer.com/puzzle_dependency_charts + Falstein GDC 2013. Directed graph
of prerequisites, built backwards from the goal. **Diamond pattern**: each
solve opens 2–3 new puzzles, converging only at act bottlenecks. "It's all
keys and locks." Maniac Mansion (made without charts) cited as the negative
proof. Gilbert published RtMI's actual charts (grumpygamer.com/rtmi_pdc);
Thimbleweed's are at blog.thimbleweedpark.com/act_123_puzzles.html.

### Shipped modern fixes (build list)

1. **State-aware escalating hint object** — RtMI's hint book: nudge→answer,
   one rung per ask, reads game state and what you've tried.
2. **Diegetic hint channel with retrieval friction** — Thimbleweed's dial-4468
   phone line; Machinarium's walkthrough behind a minigame; Loco Motive's
   detective call. Friction prevents hint-spam regret.
3. **Diegetic to-do list** — RtMI quest log; Crimson Diamond auto-notebook.
4. **Difficulty as step count** — RtMI Casual removes puzzle steps, not adds hints.
5. **Optional-depth dialogue** — RtMI Writer's Cut; Oxenfree interruption.
6. **Two-verb/verb-coin UI, hotspot flash key, double-click run/instant
   exits, fast-travel maps** (Broken Sword 5, RtMI).
7. **Enumerated-solution puzzles** — Obra Dinn's batch-validated fate ledger;
   Golden Idol's fill-in-the-blank word banks; Chants of Sennaar's
   batch-validating translation journal. Solution space visible ⇒ "stuck"
   means "reason harder," never "find the hidden pixel."
8. **Skill checks where failure yields content** — Disco Elysium white/red checks.
9. **Completeness indicators** — Sennaar's "anything left here?" dot: tells
   *whether*, not *what*.
10. **Multiple solutions per obstacle by loadout** — Unavowed party system.
11. **Real-world logic over game-internal logic** — Lorelei and the Laser
    Eyes; but its *absence of any hints* was its most-cited flaw.
12. **Structural stuck-immunity** — Blue Prince: a stuck puzzle never blocks
    the session because another draw is always available.

2023–26 games praised for solving tedium: Loco Motive (2024), The Crimson
Diamond (2024), Rise of the Golden Idol (2024), Chants of Sennaar (2023),
Botany Manor (2024), Old Skies (2025 — "invisible nudging… a thin but sturdy
thread that won't leave players feeling stupid").

---

## 2. Hi-bit pixel art (2025–26 state of the art)

### The baseline being evoked
MI2/Fate of Atlantis: 320×200 VGA, 256 colors, backgrounds were **scanned
marker/paint paintings hand-downsampled** (Peter Chan, Steve Purcell) — the
mood is painterly-dithered, not clean tile art. Sprites ~6-frame walk cycles
at 8–12 fps. Music: iMUSE.

### Key findings
- **"Hi-bit"** (D-Pad Studio term): author at 640×360 (or 320×180/384×216),
  integer-upscale; retro look with no palette/sprite ceilings.
  Integer-scaling table: 320×180 → clean ×6/×8/×12 (1080p/1440p/4K);
  384×216 → clean ×5/×10, breaks only at 1440p; 640×360 → clean ×3/×4/×6.
- **Dynamic light on pixel art is the fan-desired upgrade**: Thimbleweed Park
  ("how you remember those games, not how they actually were" — with Mark
  Ferrari backgrounds + real-time light), Sea of Stars (true dynamic light,
  not palette swaps), Eastward (hand-painted per-layer bump maps, LUT
  grading, fog), The Last Night / HD-2D (sprites lit in 3D space).
- **Palette discipline via post-processing**: Obra Dinn architecture — render
  high-precision, quantize to fixed palette + dither in post; camera-warped
  dither to stop pattern-swim. Eastward's LUT pass = palette-safe grading.
- **The Return to Monkey Island lesson**: Gilbert deliberately avoided pixel
  art; fan backlash was intense enough to produce a "Pixel Art Mode" ReShade
  mod. The audience for a golden-era revival expects the MI2 painterly look.
- **The Drifter (Powerhoof, 2025)** — current state of the art for exactly
  the MI2-painterly-under-modern-light target. Built in PowerQuest.
- **Mark Ferrari color cycling** — GDC 2016 talk; full day/night/weather via
  palette animation only; HTML5 Canvas demos exist (effectgames.com/demos/
  canvascycle). The MI1 background artist's own dusk technique.
- **Animation**: keep 8–12 fps sprite timing (the era's "weight"); spend
  budget on bespoke one-offs, cinematic close-up inserts (Loco Motive), and
  ~48-frame ambient loops. The 90s felt cheap from *reused* cycles, not fps.
- **Mixels**: settled pragmatically — diegetic art at one density in the
  low-res buffer; text/UI at native resolution styled to match.
- **Camera**: naive pixel-snapping jitters on slow scrolls (adventure worst
  case); fix = low-res buffer +1px border, subpixel offset on the upscaled quad.
- **Portraits are load-bearing nostalgia** (FoA close-ups; RtMI backlash
  specifically mourned them); ~15–18 emotion states for leads.
- **Touch reality**: at 384×216 on a 6" phone, a 48dp accessible target ≈ 25
  art-pixels — sprites can't be their own hitboxes; inflate hit regions.
- **iMUSE**: Land/McConnell 1991, patented; MIDI score as database of loops +
  transition segments, jumps quantized to musical boundaries (Woodtick's
  per-building instrument layers = canonical demo). Web Audio's
  sample-accurate `start(when)` + Tone.js Transport reproduces the
  behavior with stem-based horizontal resequencing + vertical layering.
- **Norco's atmosphere stack**: painterly pixels + post-industrial score +
  field-recording ambience layer; the ambience carries the sense of place.

---

## 3. Tech stack & haptics (mid-2026)

### Engines
- **PixiJS v8** — renderer only (WebGL + WebGPU backends; WebGL recommended
  for production), nearest-neighbor scaling; best base for a custom TS
  adventure layer. Phaser 4 (released 2025, rewritten renderer) = the
  batteries-included alternative. Both ~≤1 MB.
- **Godot 4.x web** — ~5 MB Brotli wasm floor; single-threaded export (4.3+)
  required for reliable iOS Safari. **Popochiu 2.1** (Godot 4.6) is the
  best-in-class adventure plugin. The "real engine" alternate.
- **Defold** — smallest compiled-engine web builds (~1 MB gz). No adventure
  framework.
- **Unity web** — heavy; only rationale is PowerQuest. **AGS** — Emscripten
  port exists but Windows-era limits; wrong base for modern cross-platform.
- Genre is ~0% CPU-bound: engine choice = payload + tooling, not perf.

### Distribution (the Vampire Survivors template)
Phaser/TS web core + **Capacitor** (iOS/Android stores) + **Electron +
steamworks.js** (Steam; Auto-Cloud saves) + PWA (Workbox service worker,
offline, <5 MB initial payload, per-room lazy loading). iOS PWA notes: no
real fullscreen on iPhone; audio requires gesture-unlock (`AudioContext.
resume()` on touchend + keepalive); WebGPU shipped in Safari 26/iOS 26 but
WebGL2 remains the baseline; Apple's 2024 EU PWA scare = platform-risk
argument for keeping Capacitor primary on mobile.

### Haptics support matrix
- `navigator.vibrate`: ✅ Android Chrome/Edge/Samsung; ❌ Firefox (removed
  129); ❌ iOS Safari (unconfirmed reports it landed ~Mar 2026 — re-verify).
- **Capacitor `@capacitor/haptics`**: ✅ full iOS Taptic Engine —
  impact(Light/Medium/Heavy), notification(Success/Warning/Error),
  selectionStart/Changed/End; Android VibrationEffect. The decisive argument
  for Capacitor over pure PWA on iOS.
- **Gamepad API** `vibrationActuator.playEffect("dual-rumble", {weak,
  strong})`: ✅ Chrome/Edge, Safari desktop 16.4+; ❌ Firefox/iOS.
  "trigger-rumble" in Chromium. Feature-detect via `actuator.effects`.
- macOS Force Touch trackpad: no web API; Electron native modules exist
  (NSHapticFeedbackManager alignment/level/generic).
- Design lineage (Astro's Playroom, Returnal): texture-per-surface ticks,
  intensity scaling, haptic+audio+visual layering; UI = short/subtle, world =
  stronger/longer; always a slider incl. off; never haptics without paired
  visual/audio.

### Input & saves
- Pointer-events core unifies mouse/touch/pen. RtMI mobile (the reference
  port): tap-to-walk, hold-to-reveal, multi-touch mis-tap guards, enlarged
  hitboxes, swipe-out inventory. Gamepad: hotspot-cycling beats virtual
  cursor.
- Saves: JSON flags → IndexedDB + `navigator.storage.persist()`; abstract
  SaveStore → Capacitor Filesystem / Steam Cloud / optional account sync.

## 4. Shareable clips ("Moments engine") — 2026 findings

### Shipped precedents
- **Replay directors**: Gran Turismo's *fixed, pre-authored* trackside cameras
  read far more cinematic than Forza's algorithmic moving cameras — author
  camera beats per moment, don't compute them.
- **PUBG Mobile "Highlight Moments"**: in-engine auto-clips, pre-generated
  and previewed on the results screen with one share button, and
  **quality-gated** (only good matches get clips). Opt-out, not opt-in;
  never block progress with share prompts.
- **NVIDIA Highlights / PS5 trophy capture**: the integration model — the
  game declares moment boundaries via events; a rolling buffer supplies
  lead-in. PS5 defaults to 15s.
- **TikTok Share Kit (official SDK)**: share .mp4 straight into the TikTok
  composer from Capacitor apps (iOS/Android); requires the video in the
  photo library (`@capacitor-community/media` saveVideo) + client key.
- Why clips spread: one clear trigger (surprise, fail, clutch, "that's so
  me", reveal); humor/relatable fails outperform skill; forced prompts
  backfire; UGC reads authentic vs ads.

### Tech (web, mid-2026)
- **Deterministic replay** (inputs + tick + seed, fixed timestep) is the
  right architecture: decouples render from session → any camera/aspect,
  UI stripped. Easy for a puzzle game; guard against unseeded RNG and
  time-based logic. Keep a rolling input buffer for lead-in.
- **PixiJS offscreen**: `RenderTexture.create({width,height})` renders any
  container at arbitrary size off-stage; render pixel-art scene at native
  low res, integer-upscale nearest-neighbor into 1080×1920.
- **Encoding**: WebCodecs VideoEncoder — Chrome/Edge 94+, Firefox 130+,
  Safari/iOS 16.4+ (video only); **AudioEncoder only from Safari/iOS 26**.
  Muxing: `mp4-muxer`/`webm-muxer` are **deprecated** — use **Mediabunny**
  (successor, TS, wraps WebCodecs, canvas source + Web Audio pipeline).
  Audio codec: AAC where available; iOS <26 → silent video or native
  fallback. Avoid `captureStream`+MediaRecorder (realtime-only, drops
  frames, WebM output). Encode in a Web Worker; 1080×1920 H.264 encodes
  ~realtime-or-faster on mid mobile; show progress UI.
- **Share**: `@capacitor/share` (sheet), `@capacitor-community/media`
  (camera roll), TikTok Share Kit (composer).

### Clip design
- 8–15s; hook in first 3s → open at/just before the payoff, not the setup.
  Structure: 2–4s lead-in → solve with camera push-in → 1–2s reaction →
  ~1s end card. Cross-platform safe zone on 1080×1920: **~900×1400
  centered** (TikTok: ~130px top, ~484px bottom, ~140px right clear).
  Small wordmark inside safe zone + end card; keep branding subtle.
- Privacy: engine re-render is inherently clean (no screen/mic capture);
  strip user-entered text; photo-library permission via OS flows.

## 5. Portrait-mode play — 2026 findings

- **Papers, Please mobile (Lucas Pope devlog)** — the best documented
  wide→portrait reframe: stacked regions + swipeable bottom carousel,
  **mixed integer pixel scales per region** (3× documents, 2× checkpoint),
  internal resolution derived from text legibility on a small iPhone.
  Portrait-only by design. dukope.com/devlogs/papers-please/mobile/
- **Florence** (Ken Wong): portrait = intimacy — "we use them in bed…
  they feel personal"; vertical comic-panel composition. Monument Valley:
  portrait because the *architecture* is vertical. Adventure Escape
  Mysteries (tens of millions of players): tall-composed scenes + bottom
  inventory bar — the genre works portrait at scale when authored for it.
  Golden Idol's Netflix port stayed landscape (cheap-port evidence, not a
  counterargument). Dual-orientation games are rare; most commit.
- **Thumb-zone data (Hoober, 1,300+ observations)**: 49% one-handed, 75%
  of touches thumb-driven; comfort = lower two-thirds, best bottom-center;
  top corners worst. Inventory/dialogue-advance bottom-center; scene in
  the middle band; settings top.
- **The de facto portrait adventure layout** = letterboxed scene band +
  functional UI filling the lower third (our "Book panel" matches it).
- Safe areas: `viewport-fit=cover` + `env(safe-area-inset-*)`;
  `@capacitor-community/safe-area` for older Android WebViews.
- Text minimums: web body ≥16px; ~28px @1080p floor for game text;
  44pt/48dp targets. Orientation switching = two UI layouts re-anchored
  over one scene graph, not uniform scaling.
- No public retention data by orientation; qualitative consensus: portrait
  = lower friction, micro-session-friendly, one-handed commute/bed play.
  **Marketing bonus: portrait gameplay is natively 9:16 — auto-clips and
  store assets need no reframing.** The clip camera becomes a zoom/pan
  director over the same vertical composition.

Full source URLs are preserved in the session research transcripts; key ones:
grumpygamer.com/why_adventure_games_suck · grumpygamer.com/puzzle_dependency_charts ·
dukope.com/devlogs/obra-dinn/tig-32 · dpadstudio.com/Blog/postHibit.html ·
effectgames.com/demos/canvascycle · en.wikipedia.org/wiki/IMUSE ·
capacitorjs.com/docs/apis/haptics · capacitorjs.com/docs/v5/guides/games ·
developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator/playEffect ·
godotengine.org/article/progress-report-web-export-in-4-3 ·
github.com/carenalgas/popochiu · toucharcade.com (RtMI mobile review).
