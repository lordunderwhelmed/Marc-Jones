# Chapter Zero — "Goodbye World" (Intro Sequence Design)

*The flash-forward cold open + the Night of the Sheep vignettes + the
boardroom scene, woven into one playable prologue (~15–20 min). Narration
scripts for all beats live in `story/scripts/intro-narration.md` (to be
recorded by the author). The vertical slice (`VERTICAL_SLICE.md`) builds
Beat 2 of this sequence.*

---

## The weave (why this structure)

The backdrop gives us two kinds of intro material: the everyday-glitch
litany ("all because AI fucked up") and the 3am boardroom scene. The weave:
**they are the same sixty-three minutes.** Every vignette ends with its
victim terminating an account somewhere between 02:00 and 03:03. The player
*is* the exodus, five times over, before smash-cutting to the one man
watching it as a half-centimeter line in a dashboard. The intro teaches the
game's grammar, states its thesis (small tediums, biblical consequences),
and plants the central mystery — all without one line of exposition that
isn't already in the source text.

Structural irony, stated once and never again: the player causes the event
Frank spends the rest of the game investigating.

---

## Beat 0 — Cold open: the book (≈45s, non-interactive)

- Black screen. Page-turn haptic tick. Typeset page fades in: **"Goodbye
  world."** Narrator reads the opening paragraph of the backdrop ("The big
  glitch was actually not a big glitch…"), verbatim (cue N-001).
- The page dissolves into the only fully "fucked up" flash-forward image we
  show: a dead megacity skyline at dusk, 2036 — thousands of dark windows,
  ONE lit. Ferrari color-cycling crawls the dusk down the towers. A delivery
  drone lies in the street like roadkill; a GRIM unit stands rusting at an
  intersection, holding a perfect, pointless traffic stop for nobody.
- Narrator: "But let's not give away the whole plot." (N-002) — hard cut to
  black. **Title card: THE BIG GLITCH.** Sub-card: *based on the book*.
- Then, white on black, small: **"63 minutes earlier than everything."**

## Beats 1–5 — The Night of the Sheep (five playable vignettes)

Rules for all vignettes:
- One room each. Self-contained. A stranger's small life, mid-glitch.
- Escalating brevity: ~4 min, ~3, ~2:30, ~1:30, ~0:45 — the montage
  accelerates like a pulse rising.
- Each ends the same way: the victim reaches the **TERMINATE ACCOUNT?**
  screen and the player presses it. Every press: a felt haptic *thunk* (the
  most satisfying interaction in the game — opting out must feel like the
  best button ever pressed), and a tiny counter in the corner of the "page"
  ticks upward. First press: `1`. By Beat 5 it's in the hundreds of
  thousands and audibly humming.
- Each vignette teaches exactly one mechanic (tutorialization budget below).
- Each vignette's timestamp appears as a chapter-page annotation (02:07,
  02:19, 02:31, 02:48, 02:59) — these timestamps matter later (the Ledger's
  timestamp-encoded message), so the intro is also the mystery's first clue,
  hidden in plain sight.

### Beat 1 — 02:07 — "The Moosh" (teaches: interact/examine, inventory)
Zosia's kitchen. Rain. The delivery arrives: an indescribable moosh, "a mix
of the Gremlins and water." Micro-puzzle: the refund chatbot demands "a
photo of the item as delivered," but the drone's camera only accepts images
it can classify as food — and the moosh is unclassifiable. Solution (cartoon
logic, learnable): garnish the moosh with the plastic parsley from the fake
windowsill plant; the classifier rates it "restaurant quality ✓"; refund
approved; and the absurdity of what she just had to do is what makes Zosia
scroll, quietly, to TERMINATE. *(Full spec in `VERTICAL_SLICE.md`.)*

### Beat 2 — 02:19 — "The Mushroom" (teaches: dialogue)
A forager's cabin, 2am stomach cramps, Forageous cheerfully displays the
photo of last night's dinner: "Chanterelle (98.7%) — bon appétit!" Dialogue
duel with the poison-control phone funnel that won't escalate to a human
because "your symptoms are trending normal." Judo: describe the symptoms in
the one vocabulary the funnel must escalate — liability language ("I would
like to report an *adverse event*"). Instant human. The human is lovely,
fixes it in nine seconds. That nine seconds is the radicalizing contrast.
TERMINATE.

### Beat 3 — 02:31 — "The Ticket" (teaches: hotspot scrubbing / haptic feel)
A street at night. A GRIM issues a parking ticket to a man standing next to
a car that is not his — the plate classifier matched his *jacket pattern*.
The scene is nearly dark; the player finds evidence hotspots by haptic
scrubbing (the taught mechanic): the actual owner's plate, the GRIM's lens
smeared with a delivery-drone's sauce packet. Present both to the GRIM's
appeal interface; watch it approve the appeal and, in the same breath,
ticket the correct car — whose owner, an elderly neighbor watching from her
window, then also… TERMINATE. (Two counter ticks. First runner laugh.)

### Beat 4 — 02:48 — "The Date" (teaches: the examine layer is where jokes live)
Split-screen chat: two people who genuinely like each other, and Kismet.ai
between them flagging "subtle pornographic references" in messages about a
sourdough starter. The puzzle is a word game: get one honest sentence past
the filter (the solution is handwriting a note and photographing it — the
one channel with no classifier; "manual" foreshadowed). They agree to meet.
Both TERMINATE, mid-conversation, in unison — the counter's first *chord*.

### Beat 5 — 02:59 — "The Ghost" (teaches: nothing; it plays itself in 45s)
A bank lobby after hours, one man at a kiosk being told he is 30% deceased
felon. He doesn't solve anything. He's done. He looks into the kiosk camera
— the only vignette character who breaks the fourth wall — and holds up his
phone so *we* can see the button. TERMINATE. Cut to black on the haptic
thunk. The counter spins up like a slot machine: **555,789. Stops. 03:03.**
Silence. Three full seconds.

### The montage stinger
Over the counter spin, 8–10 half-second flash-cuts of *other* terminations
worldwide (a fisherman, a nun, a kid's bunk bed, a night-shift nurse) — the
in-game "TikTok montage" aesthetic, rendered in-engine; this stinger doubles
as the game's trailer and calibrates the Moments engine (`DESIGN.md` §5.3).

## Beat 6 — 03:14 — The Boardroom (playable Frank, ~6–8 min)

The backdrop's dialogue scene, staged nearly verbatim (dialogue mapping in
`story/scripts/intro-narration.md`, cues N-030+). Playable adaptation:

1. **The bedroom.** Phone buzzing (the *worst* haptic pattern in the game —
   deliberately; Frank's phone should feel like a dental drill). Eric's call
   plays as the source text. Interactive beat: the laptop on the nightstand —
   the player sees the Looker line themselves. The half-centimeter cliff.
   Small playable joke from the text: choosing Frank's wardrobe — the
   t-shirt hotspot, picked up, then dropped: "Time for a shirt." (Examine
   layer: his t-shirts are all conference swag from products that no longer
   exist.)
2. **The helipad → corridor** walk-and-talk with Eric (briefing, verbatim).
   Teaches: double-tap instant-exit, because Frank is a man who has never
   once walked anywhere slowly.
3. **The boardroom — first real puzzle: "Twenty minutes."** Frank barks the
   deadline from the text, but the player *is* Frank assembling the answer: a
   proto–Root-Cause Board with three empty slots (WHO / HOW COORDINATED /
   WHY INVISIBLE TO US). Work the room — Andrew Chen (the data is correct),
   Jerry (it's external), the SRE director (no tech causes), Suzie on the
   phone (they're all *paying* users), Andrew slamming in (it's on Giddy —
   secret groups). Pin three findings; wrong pins get authored Frank-isms,
   never stock failures. Solving it produces the scene's true punchline,
   delivered by the board itself: **root cause: `UNKNOWN — ALL SYSTEMS
   NOMINAL`**. Everything works. That's the horror.
4. Frank's closing interior monologue (verbatim: "Maybe they all had no clue
   what was coming.") — the camera pulls back through the boardroom window,
   up, and the city outside is the Beat 0 skyline *with all its windows still
   lit*. The book closes. **Chapter One.**

The player now knows what Frank doesn't — they pressed five of those
buttons. The dramatic irony engine is running.

---

## Tutorialization budget (one mechanic per beat)

| Beat | Teaches | Justification in-fiction |
|---|---|---|
| 1 | interact/examine + inventory combine | kitchen logic |
| 2 | dialogue trees + judo phrasing | phone funnel |
| 3 | haptic hotspot scrubbing | dark street |
| 4 | examine layer = joke channel | chat UI |
| 5 | (nothing — pure story) | earned by now |
| 6 | instant travel + Root-Cause Board | Frank's impatience; the boardroom |

## Portrait staging notes

Every intro scene is composed for **both orientations** (see `DESIGN.md`
§6.1): vignettes 2 and 4 are phone-UI scenes — *portrait-native by nature*
(a chat and a call happen on a phone; the player's phone becomes the prop —
the most diegetic thing we can do on the primary platform). Vignettes 1, 3,
and the boardroom use crop-and-pan with a defined portrait focus corridor
per room. The TERMINATE button is always placed in the thumb zone.

## Clip moments (Moments engine tags in the intro)

Auto-tagged renderable moments: each TERMINATE press (with its vignette's
3-beat lead-in), the parsley classification verdict, the double-ticket gag,
the 555,789 counter spin, and the boardroom `ALL SYSTEMS NOMINAL` reveal.
The counter-spin montage is the canonical share object: it is, by
construction, an 11-second vertical video.

## Open intro questions

1. Vignette 3's double-tick gag vs. pacing — test whether two TERMINATEs in
   one vignette confuses the "one press per beat" rhythm.
2. Should Beat 5's fourth-wall look be reserved for the Ghost's return in
   the spine (he is Ledger member #1?) — currently yes, plant quietly.
3. Localization risk audit for the Beat 4 word-filter puzzle (the puzzle
   must not be English-pun-dependent — the monkey-wrench rule).
4. Timestamps 02:07/02:19/02:31/02:48/02:59 must be chosen to actually
   encode into the Ledger message once that cipher is designed — reserve
   them as unknowns until the cipher locks.
