# Art Direction Brief — how to actually get great art for The Big Glitch

Written after four failed rounds of me hand-coding mockups in canvas. The honest
lesson: procedural rectangles from a language model will always read as "what
something hallucinated a game would look like," never as a game. The fix is not a
better prompt to me — it's the right *image model*, briefed the way real studios
brief, anchored to real games we're openly stealing from. This doc is the
briefing you (or I, once you bring results back) can fire off.

---

## 0. The locked look we are matching

The winner, per you: **the original — beige/amber, yellowish, warm retro, rusty.**
Sodium theme. Golden-era LucasArts VGA at 2 a.m. That's the target every tool
below gets pointed at. Everything else (twilight, petrol, print-run, the three
"fresh" experiments) is dropped.

---

## 1. What to steal (great artists steal — so name the theft)

Every good brief names real studios, art directors, and games. That single move
does more than any adjective — it tells the model the exact quality bar and
lineage. Ours, in priority order:

| Steal this | From | For what specifically |
|---|---|---|
| **Mixel** (pixel rooms + smoother characters) | **Thimbleweed Park** — Octavi Navarro / Ron Gilbert | the whole north star: tone + technique |
| Warm VGA interiors, dithered lamplight, color-cycling | **Mark Ferrari** (LucasArts background painter) | the beige/amber glow, rain on glass |
| Rust, Americana grime, noir warmth | **Full Throttle**, **Grim Fandango** — Peter Chan | the "rusty" you asked for |
| Deadpan comedy staging, readable hotspots | **Monkey Island 2 SE**, **Day of the Tentacle** | composition + humor register |
| Modern pixel-adventure polish | **Old Skies / Unavowed** (Wadjet Eye), **Mutropolis**, **The Excavation of Hob's Barrow**, **Loco Motive** | proof the genre still wins awards in this exact look |

Octavi Navarro (aka "Pixels Huh") literally sells his pixel interiors and takes
commissions — his name in a prompt is the single strongest anchor for our look,
and he's a real hire option for hero frames.

---

## 2. Which model, which mode (July 2026)

There is no single tool — the pros run a **pipeline**. Matched to our job:

**Step 1 — Concept / hero frames (pick a mood, get variations)**
- **Nano Banana Pro** (Google, Gemini 3 Pro Image) — *recommended start.* Best at
  **consistency + editing an existing reference** (~93–95% character consistency,
  up to 14 reference images). You can feed it a Thimbleweed screenshot + our
  palette and say "this room, this light," instead of praying to a text prompt.
  Cheap, fast. Mode: image-**editing** with reference images, not blank text-to-image.
- **Midjourney v8** — alternative if you want maximum raw aesthetic wow for
  exploration. Best-in-class beauty, weakest at staying on-model. Mode:
  `--style raw`, ask for a "concept design sheet, 3 angle views."

**Step 2 — Lock the style into an "art bible" (kills the "different every time" problem)**
- **Scenario.gg** — *the studio-grade answer to your exact complaint.* Train a
  custom model on 15–50 images of the chosen look (our winners + Navarro/Ferrari
  refs), then generate hundreds of **on-style** rooms, props, and UI. Reference-
  first, image-to-image, style anchors. 20–40 min to train. This is where "AI art
  looks samey/hallucinated" gets solved — you're generating *from our bible*, not
  from the whole internet.

**Step 3 — Turn it into real mixel sprites + animation**
- **PixelLab.ai** — most complete dedicated *pixel* tool: text-to-pixel,
  skeleton-based animation, **4/8-directional rotation** (our "turn sideways when
  walking"), tilesets, Aseprite plugin.
- **Retro Diffusion** — artist-made pixel specialist; great palette/tiling control
  if PixelLab's house style doesn't fit.

**Step 4 — Human paintover (non-negotiable)**
Every serious 2026 pipeline treats paintover as a *standard stage, not optional*.
The AI gets us 80%; a pixel artist (hire, or Navarro for hero frames) makes it
ship-quality and removes the tells. Budget for this.

**Recommended path for us:** Nano Banana Pro (hero frames, fed real refs) →
Scenario (train the bible once we love a frame) → PixelLab (mixel sprites +
walk rotation) → paintover on hero assets.

---

## 3. Paste-ready briefs

### 3a. Master style line (prepend to everything)
> 16-bit VGA point-and-click adventure background, mixel style — chunky pixel-art
> environment with slightly smoother characters, in the style of **Thimbleweed
> Park** and **Octavi Navarro** pixel interiors, lit like a **Mark Ferrari**
> LucasArts night scene. Palette: sodium amber and warm beige against green-black
> shadow, one cyan phone-glow accent. Rusty, lived-in, deadpan. 256-color feel,
> dithered light pools, no gradients. Readable hotspots, strong focal hierarchy.

### 3b. Hero frame — "The Moosh" (Chapter Zero)
> [master style line] + A cramped rented kitchen at 02:07 a.m., rain on a single
> window with a dead neon sign outside. A tired woman (Zosia) in an amber jacket
> stands under a hanging lamp's cone. On a secondhand wooden table: a small
> unsettling grey takeout blob ("the moosh") and a glowing phone. A humming fridge
> covered in adjectives, a poster reading "EAT. RATE. REPEAT." Wide 16:9 and a
> 9:16 portrait crop. Concept design sheet, 3 lighting variants.

### 3c. Character sheet — Zosia (feed to Nano Banana Pro / PixelLab)
> [master style line] + Character reference sheet for Zosia: front, 3/4, side, and
> back views; walk cycle key poses; smoother-than-background mixel character, ~40px
> tall, amber jacket, dark bob, deadpan. Identity lock: keep face and outfit
> identical across all views. Transparent background.

*(Nano Banana structure that works: identity anchor → subject + action →
composition → consistency lock. Always include the lock.)*

---

## 4. What I can and can't do from here

I have **no image-generation tool** in this environment — that's the real reason
my mockups were hand-coded canvas, and why they failed. So the division of labor:

- **You (or a hire)** run the briefs above in Nano Banana Pro / Midjourney /
  Scenario and bring back frames you love.
- **I** wire the winning frames into the engine (the renderer already takes drawn
  assets), build the scene from JSON, and animate the walk rotation — no more
  procedural art from me.

If you'd rather not run tools yourself: the fastest path to something you love is
a **paid commission from Octavi Navarro or a Thimbleweed-lineage pixel artist**
for the one hero frame, then Scenario-train on it to scale. I can draft that
commission email.

---

Sources: current-as-of-July-2026 tool landscape —
[nHance: Game Artist's Guide to AI Image Generators](https://nhance-school.com/articles/best-ai-image-generators-2026),
[Mage: Best AI Pixel Art Generators 2026](https://blog.mage.space/article/best-ai-pixel-art-generators-2026/83330b2b-607d-4ef3-bca0-19e8ef307e2e),
[Inkration: AI Art Tools for Game Studios 2026](https://inkration.com/ai-art-tools-for-game-studios-in-2026-what-actually-works-for-production/),
[Scenario: style-consistent game art](https://help.scenario.com/en/articles/train-a-consistent-character-model/),
[Prompting.systems: Nano Banana Pro character consistency](https://prompting.systems/blog/nano-banana-pro-character-consistency-guide),
[Aituts: Midjourney pixel art prompts](https://aituts.com/midjourney-pixel-art/).
