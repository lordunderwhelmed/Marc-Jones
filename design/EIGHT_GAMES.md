# The Steal Board — 8 games, one aesthetic

Great artists steal, then combine. Instead of one reference, we pull one *distinct
ingredient* from each of eight beloved games so no single one is being copied — the
combination is the originality. Five golden-era LucasArts, three modern acclaimed.
All feed the locked look: warm amber/rust mixel interiors at 2 a.m.

| # | Game (year · artist) | The ONE thing we steal | Why it, specifically |
|---|---|---|---|
| 1 | **Thimbleweed Park** (2017 · Octavi Navarro) | **Mixel base + deadpan tone** — chunky pixel rooms, slightly smoother characters | our whole north star; the technique *and* the dry humor register |
| 2 | **Monkey Island 2** (1991 · Mark Ferrari) | **Dithered lamplight + color-cycling** — glowing rain, flicker, no gradients | how you make 256 colors feel *lit* and alive; our window rain + lamp |
| 3 | **Full Throttle** (1995 · Peter Chan) | **The palette core** — rust, ochre, diesel Americana grime, warm neon night | this is literally the "rusty beige/amber" you keep asking for |
| 4 | **Day of the Tentacle** (1993 · Peter Chan) | **Readable cartoon shapes** — thick outlines, confident flat shading, bold silhouettes | fixes the #1 critique: hotspots you can actually *find*; carries comedy |
| 5 | **Indiana Jones: Fate of Atlantis** (1992) | **Cinematic framing + gravitas** — dramatic interior scale, pulp warmth | you named it; gives a small kitchen the weight of a set, not a doodle |
| 6 | **The Excavation of Hob's Barrow** (2022) | **Cozy-dread hand-pixel density** — candlelit, intimate, richly detailed | proof the modern era nails warm claustrophobic interiors; our detail bar |
| 7 | **NORCO** (2022) | **Painterly light-in-gloom + techno-melancholy** — oil-on-pixel atmosphere | the exact mood of our story: beautiful, sad, machine-haunted |
| 8 | **Disco Elysium** (2019 · Aleksander Rostov) | **Prestige grade + diegetic UI** — oblique moody color-grade, ornate typography | the "this is capital-A Art" layer; makes the Book/phone UI feel authored |

## The combination recipe (what "maximally aesthetic" means for us)

Read top to bottom — it's the build order of a single frame:

- **Geometry & tone** — Thimbleweed mixel + DOTT's bold readable shapes
- **Palette** — Full Throttle rust & amber over green-black, one cyan phone-glow accent
- **Light** — Ferrari dithered lamp-pools, color-cycling rain & flicker, *no gradients*
- **Camera** — Fate of Atlantis cinematic framing (+ our 9:16 portrait crop)
- **Detail & intimacy** — Hob's Barrow candlelit hand-pixel density
- **Atmosphere & mood** — NORCO painterly light-in-gloom, techno-melancholy
- **Grade & UI** — Disco Elysium prestige color-grade + ornate diegetic type

## The generation prompt (built from the recipe)

> A 16-bit VGA point-and-click adventure background, **mixel** style — chunky
> pixel-art environment with slightly smoother characters. Combine: the mixel
> craft and deadpan tone of **Thimbleweed Park** (Octavi Navarro); the dithered
> color-cycling lamplight of **Monkey Island 2** (Mark Ferrari); the rust, ochre
> and warm-neon Americana palette of **Full Throttle** (Peter Chan); the bold
> readable cartoon shapes of **Day of the Tentacle**; the cinematic interior
> framing of **Indiana Jones: Fate of Atlantis**; the candlelit hand-pixel
> intimacy of **The Excavation of Hob's Barrow**; the painterly light-in-gloom
> and techno-melancholy of **NORCO**; and the prestige color-grade of **Disco
> Elysium**.
>
> Scene: a cramped rented kitchen at 02:07 a.m. Rain on a single window, a dead
> neon sign outside. A hanging lamp throws one dithered amber pool. Palette:
> sodium amber and warm beige against green-black shadow, a single cyan
> phone-glow. Rusty, lived-in, deadpan, quietly sad. 256-color feel, dithered
> light, no gradients, readable hotspots, strong focal hierarchy.
> Reference image attached is the *technique target* (mixel), not the content.

## How we'll run it (once the key is in)

1. `node tools/gen-art.mjs list` — confirm which Gemini image model the key sees.
2. Generate 4–6 variants of the hero frame with your Thimbleweed screenshot
   attached as the technique reference.
3. I review, we pick the closest, then iterate by *editing that frame* (Nano
   Banana's strength) — "warmer," "more rust," "lamp lower" — not re-rolling.
4. Lock it → it becomes the art-bible seed for every other room.
5. I wire the winner into the engine and animate Zosia's walk.
