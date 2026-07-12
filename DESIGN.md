# Project: THE BIG GLITCH (working title)

*A golden-era point-and-click adventure — the mood of Monkey Island 2 and Fate of
Atlantis, rebuilt with 2026 pixel art, modern haptics, and a design that makes
"slow, tedious, and stuck" structurally impossible. One codebase: browser,
mobile, desktop.*

*Story: a playable adaptation of "The Big Glitch" — see `story/backdrop.md`
(source text) and `story/NARRATIVE.md` (narrative design brainstorm).*

This document is the creative and technical north star, synthesized from deep
research into (1) why 90s adventures created friction and every shipped modern
fix, (2) state-of-the-art hi-bit pixel art direction, and (3) the 2026
cross-platform web stack. Raw findings with sources live in `RESEARCH.md`.

---

## 1. The One-Line Pitch

**"How you remember Monkey Island, not how it actually was"** — Ron Gilbert's
Thimbleweed Park mantra, taken further: painterly VGA-mood pixel art under
dynamic light, an orchestra that follows you from room to room, hotspots you
can *feel* under your finger, and a puzzle structure where being stuck is a
choice, never a wall.

## 2. The Three Pillars

1. **The Vibe Is Sacred.** MI2's mood came from scanned marker paintings —
   dark, dithered, painterly, brown-and-jewel-toned — not from clean tile art.
   We recreate *painterliness under modern light*, never a generic retro look.
   (The Return to Monkey Island art backlash is the proof of demand: fans
   modded pixelation back in.)
2. **Respect the Player's Time Like It's 2026.** Every classic time-sink —
   walking, re-walking, verb-menu spelunking, dialogue mowing, hint shame,
   try-everything inventory — gets a systemic kill, not a band-aid.
3. **Feel Is a First-Class Sense.** Haptics aren't garnish. On touch, the scene
   is *readable by feel* — a genuinely new capability no golden-era homage has
   shipped.

---

## 3. Killing "Slow, Tedious, Stuck" — The Flow System

The research produced a clear taxonomy of the classic pathologies (moon logic,
pixel hunting, walk friction, verb friction, dialogue exhaustion, dead ends,
inventory brute-forcing, goal amnesia). Our answer is one coherent system,
not a settings menu of mercy toggles.

### 3.1 Structure: the Puzzle Dependency Chart is law

- Every chapter is authored as a Gilbert/Falstein **puzzle dependency chart**
  built backwards from the chapter climax, with the **diamond rule**: solving
  any puzzle opens 2–3 new ones; the graph converges only at act breaks.
  **The player always has ≥3 live threads.** Stuck on one? Lateral motion is
  always available — that alone deletes most of the 90s stuck-feeling.
- **The difficulty dial: "irrational but inevitable."** We embrace the
  cartoon-logic whimsy of Indy/Monkey Island/DOTT puzzles — but those were
  a tiny bit too hard, and that margin is exactly what we tune out. The
  rule: irrationality must be *learnable* — the world's absurd systems obey
  their own consistent rules, and the scene teaches its rule before asking
  the player to exploit it (the slice's classifier judges garnish, and
  demonstrates it on two optional hotspots before the puzzle needs it).
  Calibration knobs live in data per puzzle: step count, clue-to-use
  distance, signposting strength, attempts-before-nudge.
- **Gilbert's 1989 rules are hard constraints**: no deaths to learn from, no
  unwinnable states, no missable items (anything needed later is always
  retrievable), problems introduced before their solutions (lock before key),
  and *reward intent* — if the player tries the right idea in a slightly wrong
  way, it works, with a line acknowledging their cleverness.
- **CI-enforced**: the dependency chart lives in the repo as data. A test
  walks the graph and fails the build if any reachable state has <2 open
  puzzles outside act bottlenecks, or any item becomes unreachable. We make
  "never stuck" a compile-time guarantee — something the 90s couldn't do.

### 3.2 The Ship's Log: goal clarity + multi-session memory

- A diegetic journal (Return to Monkey Island's to-do list + Crimson Diamond's
  auto-notebook) splits the chapter goal into live sub-goals, auto-updates,
  and marks which threads have new developments.
- **"Previously on…"**: returning after 3+ days away triggers a skippable
  ~20-second recap vignette narrated in-voice from your log — the multi-session
  amnesia problem (a huge, under-acknowledged cause of "adventure games feel
  tedious") solved the way prestige TV solved it.

### 3.3 The Hint Companion: escalation with charm, friction, and state-awareness

A diegetic hint character (proposed: GRIM-114, the decommissioned patrol
robot — see `story/NARRATIVE.md` §4) carried with you, combining the best
shipped mechanics:

1. **Completeness first** (Chants of Sennaar): "Anything left for me here?"
   → yes/no. Tells you *whether*, never *what*. Free, unlimited.
2. **Escalating ladder** (RtMI hint book / UHS): nudge → stronger nudge →
   explicit answer, one rung per ask, aware of game state and what you've
   already tried. Never hints threads you haven't discovered.
3. **Playful friction** (Machinarium): the top rung — the outright answer —
   costs a 20-second diegetic mini-interaction (bribe the parrot with a
   cracker you fish up via a tiny minigame). Friction prevents hint-spamming
   regret; charm removes hint *shame*.
4. Lorelei and the Laser Eyes' one flaw was shipping *no* hints. We never
   ship a puzzle the companion can't ladder.

### 3.4 Interface: two verbs, zero hunting

- **Contextual two-verb interface** (tap/click = interact, hold/right-click =
  examine) with verb-coin flourish only where multiple context actions exist.
  The 9-verb SCUMM wall appears only as an optional "Museum Mode" skin for
  purists.
- **Hotspot reveal** is always available (hold/two-finger tap) — Gilbert's
  refusal of this in Thimbleweed Park was criticized; we side with the critics.
  On touch, hotspots also announce themselves *haptically* (§5).
- **Enumerated-solution puzzles where they fit**: the deduction-board school
  (Obra Dinn, Golden Idol) taught us that when the solution space is visible,
  "stuck" means "think harder," never "find the hidden pixel." Set-piece
  puzzles (a heist plan board, a translated pirate cipher) use this grammar.

### 3.5 Motion: walking is never waiting

- Double-tap anywhere = run; double-tap an exit = instant cut to next room;
  fast-travel map from chapter one (not unlocked late as a reward).
- **Cut-on-action**: any queued interaction more than ~1.5s of walking away
  triggers a film-style cut (character mid-stride wipe) instead of real-time
  ambulation. Walking exists for mood when *you* want it, never as a tax.
- Ambient banter fills longer traversals so even chosen walks carry content.

### 3.6 Dialogue: flow, not mowing

- Seen options grey out; exhausted branches auto-collapse; options that would
  reveal *new* information are subtly marked (the log tracks it anyway).
- Oxenfree-style interruptible delivery with "as I was saying…" stitching, so
  skipping never loses a gated flag.
- **Writer's Cut toggle** (RtMI): flavor-depth dialogue is opt-in, so
  completionists feast and everyone else flows.

### 3.7 Difficulty: step count, not hint access

Two modes à la RtMI: **Swashbuckler** (full puzzle chains) and **Passenger**
(same story, fewer puzzle steps — steps *removed*, not just hinted). Session
design targets natural stopping points every 15–25 minutes with save-anywhere
and instant resume.

---

## 4. Art Direction: "Remembered VGA"

- **Virtual resolution 384×216** (16:9; integer-scales ×5 to 1080p, ×10 to
  4K; the one non-integer target, 1440p, gets the +1px-border subpixel
  technique). This approximates MI2's pixel density; if portrait/face detail
  demands it, the fallback decision is 640×360 (the Owlboy "hi-bit standard").
- **Palette**: a 48–64 color master palette *derived from the actual MI2/Fate
  of Atlantis VGA palettes* — muted, brown-heavy midtones, jewel accents — not
  off-the-shelf DB32 brights. All rendering (sprites, particles, light) passes
  through a palette-constrained LUT post-process (the Obra Dinn / Eastward
  architecture), so dynamic lighting can never break VGA discipline.
- **Painterly backgrounds**: dithered, brushy, scanned-painting texture in the
  Peter Chan / Steve Purcell lineage (today's exemplar: Powerhoof's The
  Drifter, widely called the state of the art for exactly this look).
- **Dynamic light on top** — the upgrade fans actually want (Thimbleweed Park,
  Sea of Stars, Eastward, The Drifter all prove it): normal-mapped key props
  and characters, lamplight pools, dusk shafts, wet reflections.
- **Mark Ferrari color cycling** as the signature move: dusk crawling down a
  harbor wall via palette animation — the literal MI1 background artist's own
  technique, and it already runs on plain HTML5 Canvas. Period-authentic magic
  no shader can fake.
- **Animation budget**: sprites stay chunky at 8–12 fps (that's the *weight*
  of the era); the budget goes to bespoke one-off animations, cinematic
  close-up inserts for dramatic beats (Loco Motive), and ~48-frame ambient
  loops (dust motes, foliage, water). The 90s felt cheap because of *reused*
  cycles, not low fps.
- **Portraits are load-bearing nostalgia**: detailed dialogue close-ups in the
  Fate of Atlantis tradition (~15 emotion states for leads). The RtMI backlash
  specifically mourned these.
- **Mixel rule**: all diegetic art at one pixel density rendered into the
  low-res buffer; text and UI at native device resolution, styled to match
  (bitmap-look font, palette colors). Readability on phones is non-negotiable.
- **CRT filter**: shipped, tasteful, optional, off by default (Sonic Mania
  standard).

## 5. Audio + Haptics: the Atmosphere Engine

### 5.1 iMUSE reborn in Web Audio

- Per-room scores built on the **Woodtick model**: one shared harmonic bed per
  district, per-room instrument stems that hand off with bar-quantized
  transitions and closing flourishes. Web Audio's sample-accurate `start(when)`
  scheduling (+ Tone.js Transport) implements iMUSE-style horizontal
  resequencing + vertical layering natively in the browser.
- **Norco rule**: a field-recording ambience layer (gulls, rigging creak,
  tavern hum) carries more "place" than the score — always present, ducked
  under music.

### 5.2 Haptics: the scene readable by feel (the genuine novelty)

A semantic haptics layer — `tick / impactLight / impactMedium / success /
failure / rumble(d, weak, strong)` — with per-platform drivers:

| Platform | Driver |
|---|---|
| iOS/Android app (Capacitor) | `@capacitor/haptics` → full Taptic Engine (impact/notification/selection) |
| Any platform + gamepad | Gamepad API `dual-rumble` actuator |
| Android web | `navigator.vibrate` patterns |
| iOS web | best-effort polyfill, degrade silently (re-verify Safari status at build time) |
| macOS desktop | optional Force Touch trackpad "alignment" ticks (Electron native module) |

Signature patterns:
- **Hotspot scrubbing** — drag a finger across the scene and feel a selection
  tick as you cross each interactive object. Pixel hunting dies by touch; it's
  also an accessibility win.
- **Material identity** — hotspot ticks vary by material class (wood/metal/
  cloth/water), a scaled-down Astro's Playroom texture idea.
- **Puzzle-solve chord** — layered impact + rising rumble synced to the
  musical flourish: the aha moment lands in three senses at once.
- **Wrong-combination whisper** — soft error pulse, never punishing; pairs
  with an authored joke line (reward intent, even in failure).
- Ambient rumble (storms, ship engines) on gamepad only; never on phones.
  Global intensity slider incl. off; haptics never fire without a paired
  visual/audio cue.

### 5.3 The Moments engine ("TikTokable" solves)

Every puzzle solve and major story beat is auto-captured as a **shareable
vertical mini-video, rendered from the engine** — not a screen recording:
no menus, no cursor, no UI; the game re-renders the moment clean at
1080×1920 with fast cuts (lead-in beats → the solve → reaction → title
card). Mechanism: deterministic replay (the engine logs inputs/state
deltas; the moment is re-simulated offscreen with an authored "director"
cut list per moment type), encoded in-browser via WebCodecs (fallbacks:
MediaRecorder / native plugin under Capacitor), one-tap native share sheet.
Target duration 8–15s; safe areas for TikTok/Reels/Shorts overlays;
watermarked with the book's colophon. Tagged moment types: puzzle solves,
tedium-boss kills, TERMINATE presses, chapter cards. Sharing is always
player-initiated — auto-capture, manual publish.

### 5.4 Narration as a pillar

The narrator (recorded by the author) is a core system, not garnish: cue-ID
table drives playback, music ducking, once-per-rule repetition awareness,
and reactive alternates (replay lines, idle lines, speed-run lines).
Scripts live in `story/scripts/` with slate-based recording conventions so
sessions are non-technical. Character dialogue may ship as narrator-read
"audiobook mode" — fitting the playable-book frame; decide after v1 takes.

## 6. Tech Stack (the Vampire Survivors template)

- **Core**: TypeScript + **PixiJS v8** (WebGL, nearest-neighbor scaling) with
  a thin custom adventure layer — rooms from LDtk, polygon walkboxes + A*,
  `inkjs` for dialogue trees, hotspot/inventory/verb systems, and the PDC
  validator. Adventure games are ~0% CPU-bound; the engine choice is about
  payload (<1 MB) and control. (Alternate considered: Godot 4.6 + Popochiu —
  better authoring tools, but a ~5 MB wasm floor and weaker web-haptics story.)
- **Distribution**: PWA with service-worker offline (instant-play demo +
  marketing channel; <5 MB initial payload, per-room lazy asset loading) +
  **Capacitor** for iOS/Android stores (this is what unlocks real Taptic
  haptics — iOS Safari still blocks the web Vibration API) + **Electron +
  steamworks.js** for Steam with Auto-Cloud saves. Exactly the architecture
  Vampire Survivors shipped.
### 6.1 Portrait mode is first-class (phones are the primary platform)

Every room is authored wide (384×216) **with a defined portrait focus
corridor** — a per-room camera track the crop-and-pan portrait camera
follows (character position + active hotspot weighting). Portrait layout:
scene viewport on top ~55–60% of the screen, the **Book panel** (dialogue,
inventory, journal margin-notes) filling the bottom thumb zone — dialogue
and critical buttons always land where a thumb rests. Landscape shows the
full room with overlay UI. Orientation switching is seamless mid-scene.
Phone-UI scenes (chatbots, calls, apps — frequent in this story) are
portrait-native by design: the player's phone becomes the in-fiction prop.
Primary buttons (e.g., TERMINATE) are placed per-orientation, not scaled.

- **Input**: pointer-events core unifying mouse/touch/pen. Touch: tap = walk/
  interact, hold = examine/reveal, two-finger tap = skip, hotspot hitboxes
  inflated to ≥48dp (~25 art-pixels at 384×216 on a 6" phone — diegetic
  sprites can't be their own hitboxes). Gamepad: hotspot-cycling on shoulder
  buttons (the RtMI console pattern), not a floating cursor.
- **Saves**: tiny JSON state → IndexedDB (+ `navigator.storage.persist()`),
  abstract SaveStore with drivers for native FS (Capacitor), Steam Cloud, and
  optional account sync (last-write-wins per slot).

## 7. What We Deliberately Reject

- **Changing the drawing style** for modernity's sake (the RtMI lesson).
- **Hint shame and hint absence** (the Lorelei lesson) — every puzzle ships
  with a ladder.
- **Verb walls as default UX** — museum-mode skin only.
- **Real-time timers / deaths / unwinnable states** — Gilbert 1989, forever.
- **Moon logic** — every puzzle passes the "Of course!" test in review; the
  monkey-wrench pun that only works in American English is the eternal
  counter-example.
- **Runtime-heavy engines** — Unity/Godot web weight buys nothing for this
  genre.

## 8. Open Questions (next session fodder)

1. ~~Setting & story premise~~ — resolved: "The Big Glitch" (2035 AI-collapse
   techno-satire). Open sub-questions live in `story/NARRATIVE.md` §10.
2. 384×216 vs 640×360 — settle with an art spike: paint one
   boardroom-at-3am room in both, on-device comparison (phone + 27" monitor).
3. Scope of the deduction-board set pieces (the Casebook layer) vs classic
   item puzzles per spine chapter.
4. Verify iOS Safari `navigator.vibrate` status at build time (unconfirmed
   reports it landed in early 2026).
