# GLITCHKIT — SCUMM for 2026

*The scene system: levels are pure data, playable and testable with zero
graphics. The graphics engine is a separate, swappable skin developed
independently (by another team) against the same data contract.*

## The idea

SCUMM's insight was that adventure games are 95% *content* interpreted by a
small runtime. GLITCHKIT is that, rebuilt for 2026:

```
scene JSON ──▶ interpreter (flags, inventory, verbs, dialogs, ops)
                 │
                 ├─▶ BLOCKOUT renderer  — auto-generated grey-box scene,
                 │    playable in the browser the moment the JSON exists
                 ├─▶ STYLED renderer    — the art team's skin (sodium/
                 │    twilight/petrol…), applied per-room, later
                 └─▶ HEADLESS solver    — no renderer at all: a bot that
                      exhausts the action space in CI, proves the goal is
                      reachable, and lists unreachable content
```

A writer ships a playable level by writing one JSON file. No engine code,
no art, no build knowledge beyond `npm run dev`.

## Scene format (v0)

One scene = one JSON file in `src/game/scenes/`. Top-level:

| key | what |
|---|---|
| `id`, `title` | identity |
| `room` | `w,h,floorY`, walk band, and `blocks` — labeled rects with tint; the blockout renderer draws these directly; the styled renderer replaces them with painted layers keyed by block `id` |
| `actor` | start position + display name |
| `flags` | initial state |
| `hotspots` | rect, `walkX`, `examine` (string or [first, second] — the second-look-new-joke rule is format-level), optional `use` rules |
| `dialogs` | node graphs for phone/NPC conversations; choices carry ops, `goto`, optional `locked` (opened by an `unlock` op — knowledge gates are data) |
| `cues` | narrator lines by id (maps 1:1 to the VO cue table) |
| `onStart` | ops run at scene open |
| `goal` | flag that means "scene complete" (the solver's target) |

**Ops** (the entire verb set of the runtime — deliberately tiny):
`say` (actor/inner line) · `cue` (narrator) · `set` (flags) · `give`/`take`
(inventory) · `dialog` (open a dialog node) · `unlock` (reveal a locked
choice) · `swap` (retint/relabel/hide a block — visual state changes stay
data) · `haptic` · `sfx` · `end` (scene-complete card: counter + line).

**Rules**: a hotspot's `use` is an ordered list of `{if, do}` — first
matching condition fires. Conditions: flag equality, inventory has/hasn't.
That's it. If a puzzle can't be expressed in this, the puzzle is probably
too convoluted (the format is a design linter).

## The three consumers

1. **Blockout** (`?` start page → "blockout demo", or `bg-scene` in
   localStorage): rooms render as tinted boxes with labels, the actor as a
   capsule, hotspots outlined on demand. Full input (tap/double-tap/
   long-press), captions, dialogs, haptics, audio, end card — the complete
   game feel minus art. Writers playtest here.
2. **Styled**: the art team implements `drawRoom(sceneId)` against the same
   block ids (each block becomes a painted region/prop; extra dressing is
   free). Nothing in the scene JSON changes. Theme system (DESIGN.md §4)
   lives entirely on this side.
3. **Solver** (`npm run test:scenes`): BFS over the reachable state space —
   asserts the goal is reachable, reports minimum step count, and lists
   every op/choice/rule that can never fire (dead content is a build
   warning, unreachable goals are a build failure). This is the
   `VERTICAL_SLICE.md` §5 "solvability bot" made real, and it runs on
   every commit.

## Workflow for a new level

1. Copy a scene JSON, write rooms/hotspots/dialogs/jokes. (COMEDY.md rules
   apply: every hotspot examines, wrong attempts get authored lines.)
2. `npm run test:scenes` — solver proves it's completable, shows the path.
3. Open the blockout in a browser, feel the pacing, fix, repeat.
4. File it in `story/SCENES.md` status table; art picks it up whenever —
   the level is *shippable in blockout* for playtests meanwhile.

## Deliberate v0 limits (grow when a real scene demands it)

- One room per scene file (multi-room scenes = several files + a `goto`
  op — added when scene 7/8 needs it).
- The Moosh remains hand-coded (it predates the kit and doubles as the
  styled-renderer reference); it gets ported once the format stabilizes.
- Timers, cutscene scripting, and the Root-Cause Board grammar are
  planned op families, not yet in v0.
- The solver duplicates interpreter semantics in ~100 lines; single-source
  via a shared module is the v1 refactor.

## Proof of concept

`src/game/scenes/mushroom.json` — scene Z0-2 ("The Mushroom",
`story/SCENES.md` #2) authored entirely as data: 8 hotspots, a
poison-control funnel dialog with a knowledge-gated escalation phrase
(examine the medicine shelf → learn the liability words → the locked
choice unlocks), the nine-second human, and the TERMINATE ending. Written
without touching a single engine file.
