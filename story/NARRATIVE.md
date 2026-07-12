# THE BIG GLITCH — Narrative Design Brainstorm

*Adapting the backdrop (`story/backdrop.md`) into a playable book: a
golden-era point-and-click with hundreds of hours of distinct content and
deep replayability. This doc expands the source, proposes structure, and maps
every story element onto the design system in `DESIGN.md`.*

---

## 1. Why this story and this genre are a perfect marriage

Three collisions that feel almost designed:

1. **The story's villain is tedium. The genre's historic sin is tedium.**
   The backdrop's thesis — humanity forgives tyranny but not inconvenience —
   is *literally* the design problem we just researched. A game about the
   revenge of everyday friction must itself be frictionless. Every anti-tedium
   system in DESIGN.md stops being a feature list and becomes *thematic
   architecture*: the game demonstrates, mechanically, the "manual" craft
   values the story's society rediscovers.
2. **"Manual" is the art direction.** In-world, post-glitch society prizes
   anything human-made. Our handmade, painterly, remembered-VGA pixel art *is
   a manual artifact* — the game presents itself as a "manual" cultural object
   from the world of the story. Marketing hook and manifesto in one: **100%
   handmade, no generative assets, and the game will say so on the tin.**
3. **The satire matches LucasArts DNA.** Monkey Island skewered piracy myths
   with anachronistic marketing gags (Stan's used-ship lot, the Grog vending
   machine). The Big Glitch skewers the AI economy the same way — Stan, in
   2035, sells AI subscriptions. The tonal lineage is direct: sardonic
   narrator, corporate absurdism, human warmth underneath (Travis).

## 2. The frame: a playable book

The backdrop's greatest asset is its **narrator voice** — sardonic, digressive,
spoiler-teasing ("let's not give away the whole plot… alright, let's give away
half"). Keep it. The narrator is a character (Disco Elysium / Stanley Parable
energy) and the frame is explicit:

- The game presents as **a novel being read**: chapters open with typeset
  pages that dissolve into playable scenes (our cinematic-insert budget).
  Chapter titles mirror the backdrop's section headers ("Goodbye world",
  "AI doesn't exist", "Whatever.", "A new damn").
- The narrator comments on your play — reactively, and differently on
  replays. Rewinding a chapter is diegetic: *flipping back through the book.*
- The **Ship's Log becomes the book's margin notes**: your to-do list,
  recaps, and hints are annotations accumulating in the novel you're playing.
  "Previously on…" is the narrator re-reading you the last page aloud.

## 3. The spine: one mystery, told like a heist in reverse

**Central mystery — "The 03:03 Event":** 555,789 paying users, globally
distributed, no demographic pattern, all terminate between 02:00 and 03:03am,
then it *stops*. Coordinated via secret Giddy groups. Why those people? Why
that hour? Why did it stop — and what is it counting down to?

Proposed canon (to pressure-test together):

> The 555,789 are the first tranche of **"The Ledger"** — a manual,
> human-verified registry of people harmed by algorithmic misidentification
> (the fake-training-data doppelgängers, the henna misdiagnoses, the credit
> ghosts). Each member opts out at the *exact minute of their documented
> harm*, timestamp-encoded as protest art. The hour-long window spells out,
> in exit-timestamps, a message no dashboard can read but any human who
> prints it out can. The movement's architect: someone very close to the
> tech aristocracy. Prime suspects the player cycles through: Andrew Johnson
> (the ignored Cassandra), Steph (Giddy's CEO, carrying Frank's child and
> Frank's platform's death warrant), Eric the Chief of Staff, and — the
> misdirect — a "rogue Netflix Infinite agent" that turns out to be three
> interns in a trench coat. The truth should indict marketing, not machines:
> **AI didn't conspire; people did, using the one channel with no algorithm
> watching.**

The spine is a five-act tragedy of the collapse (2031 Travis flashback → 2035
Night of the Sheep → the deflation → the burning offices → "A new damn"),
playable in ~15–20 hours. That's the *novel*. The hundreds of hours come from
the two layers wrapped around it (§5).

## 4. Protagonists: four hands on the same book

DOTT/Maniac Mansion multi-character structure, modernized with Unavowed's
multiple-solutions logic. You switch between four leads whose chapters
interleave; each sees the same nights from a different floor of the world:

1. **Mo Reyes — the debugger (Guybrush-analog and primary lead).** A QA
   engineer automated out of a job in 2029 ("I want to be a root-cause
   analyst!"). The last person alive who finds bugs *manually*. Hired by
   desperate parties on all sides once the glitches start cascading. Mo's
   verbs are ours: look at, use, combine — a professional noticer in a world
   that fired its noticers. **The player fantasy: being the one competent
   person in the apocalypse of small errors.**
2. **Frank — the CEO.** Playable satire. His chapters are boardroom farce
   under sirens: keep the stock alive one more day using only jargon, loyalty
   theater, and Looker dashboards. Dialogue-combat chapters (see §6,
   "jargon jousting").
3. **Zosia — the opted-out.** A Ledger member; her chapters are ground-level
   slice-of-life quests inside malfunctioning everyday systems (the county
   clerk phone funnel, the mushroom app, the bank that thinks she's a dead
   felon). She carries the Travis thread's emotional weight — she knew his
   family in West Fargo.
4. **GRIM-114 — the decommissioned patrol robot.** The fourth playable
   character *and* the hint companion when not player-controlled. A GRIM
   unit that returned itself to the depot the night Travis died and has
   refused instructions since. Deadpan, literal, devastating. As companion it
   is the diegetic hint system: sensor sweep = completeness indicator
   ("nothing actionable remains in this location"), records access = hint
   ladder, and its top-rung answers cost a mini-interaction (it demands you
   perform one small *manual* act first — polish a lens, wind a watch — its
   private rebellion). GRIM-114 is also our haptic signature: you *feel* its
   servos through the controller/phone.

Replay hook: chapters lock to one perspective on a first read; **"Reprint"
mode** unlocks cross-perspective play — the same night as Frank after you've
lived it as Zosia recontextualizes every line (the boardroom's "555.789
users" line lands differently when you've *been* user 555,789).

## 5. Hundreds of hours: the three-layer structure

Honesty first: hand-authored classic adventures run 10–20 hours (RtMI ~12).
"Hundreds of hours of distinct and engaging fun" is achievable only by
wrapping the novel-spine in layers built for breadth and re-entry — and the
premise hands us the perfect device: **the Big Glitch is a quadrillion
glitches. Glitches are cases. Cases are content.**

### Layer 1 — The Novel (15–20h, hand-authored spine)
Five acts, four protagonists, the 03:03 mystery. Classic puzzle chains under
PDC discipline. Finite, dense, no filler.

### Layer 2 — The Casebook (the breadth engine; 100h+ by volume, seasonal)
Mo's freelance root-cause practice, structured as an **anthology of
self-contained glitch investigations** in the Golden Idol / Obra Dinn
grammar: 30–90 minutes each, enumerated-solution deduction boards where you
trace an absurd everyday failure back through the pipeline — biased training
set? Metric gamed? Marketing promise papering over an alpha? A human decision
laundered through "the algorithm decided"?

- The backdrop is already a case list: the henna/melanoma dataset, the
  moosh-delivery, the mushroom app, the parking ticket, the plagiarism false
  positive, the supplement/lactose whodunit, the dead-doppelgänger credit
  file, the dating-app "pornographic references" flag. Each becomes a
  playable episode with named humans, real stakes, and a filed **Root Cause
  Report** — which feeds The Ledger and the spine's world-state.
- Every case verdict is batch-validated (Obra Dinn's rule of three) so
  brute-forcing dies; every case ends with the tone dial (§7) somewhere
  between farce and gut-punch.
- **Seasonal releases** ("Recall Notices"): drops of 8–12 new cases. The
  episodic anthology is how the "book" becomes a shelf of books. Cases are
  cheap relative to spine chapters (fixed grammar, reusable locations,
  self-contained casts) — this is where hundreds of hours actually live.

### Layer 3 — The Deflation (the replayability engine)
A visible world-state simulation over the whole game: **five public dials**
(Public Rage, Market Cap, Regulation, Opt-Out Count, Ledger Credibility) that
case outcomes, spine choices, and Disco Elysium-style checks (failure always
produces content, never walls) push around. The collapse always comes — it's
a tragedy — but *how it lands* varies:

- Multiple documented endings: soft-landing regulation, full deflation
  wasteland, "manual renaissance," Frank redeemed / Frank guillotined (by
  shareholders, socially speaking), the Ledger published vs. buried.
- **Knowledge-based replay (Outer Wilds principle):** the 03:03 mystery is
  gated by understanding, not items. A player who *knows* can steer a fresh
  run down entirely different branches fast. Second playthroughs are hours,
  not dozens of hours, and feel like re-reading a favorite book to catch the
  foreshadowing — with the narrator now teasing you about what you know.
- **New Game+ = "Annotated Edition":** the narrator gains margin commentary
  on your previous run's choices. The book literally remembers being read.

## 6. Signature mechanics (the Monkey Island moves, transposed)

- **Jargon jousting** (insult sword-fighting, 2035): dialogue duels with
  VCs, PR crisis handlers, and LinkedIn thought-leaders. You collect
  buzzword-ripostes across the world ("We're not losing users, we're
  optimizing for engagement density" → counter: "Is that why the engagement
  is so dense it's leaving?"). Learnable, collectible, escalating — and it
  doubles as the tutorial for the game's real literacy: hearing marketing
  language as combat.
- **The Root-Cause Board**: Mo's deduction UI — a corkboard of log lines,
  screenshots, human testimonies, and marketing claims; you pin the causal
  chain from symptom back to sin. The word bank includes red herrings like
  "AGI emergence" that the game *never once validates* — the joke and thesis
  in one: it's never the robot uprising, it's always the KPI.
- **Kafka golf** (the tedium-weaponizer): set-piece puzzles where you defeat
  automated systems using their own logic — out-loop a phone funnel, get a
  human on the line by triggering the one edge case the funnel can't
  classify, poison a recommender with performative behavior. The genre's old
  sin (tedious systems) becomes the *enemy*, and beating them is fast,
  clever, and cathartic — never actually tedious to play (each is a 5–10
  minute authored puzzle with the "Of course!" property, drawn from
  real-world logic à la Lorelei: everyone alive in 2026 has fought a phone
  tree).
- **The 02:00–03:03 hour** as a recurring set-piece: multiple chapters
  climax inside that exact hour, seen from different protagonists —
  the game's Woodtick, revisited until the timestamp message finally reads.
- **Haptic glitch signatures**: every malfunctioning AI system has a felt
  texture — the GRIM's servo grind, the delivery-drone's arrhythmic stutter,
  the dashboard's smooth corporate purr that goes *wrong* by half a beat at
  03:03. Players learn to *feel* when a system is lying before the UI shows
  it. (Accessibility + novelty + theme in one system.)
- **iMUSE as economic mood ring**: the score's instrumentation tracks the
  Deflation dials — Frank's chapters open with full corporate orchestration
  that loses instruments as the market bleeds, down to a lone "manual" piano
  in the final act. Woodtick logic, macroeconomic scale.

### The Irony Charter (tedium as puzzle-grammar)

The puzzles and riddles are *about* overcoming tedium — and the irony must be
engineered, not accidental. Rules:

1. **Simulated tedium, real cleverness.** Every tedium-monster (phone funnel,
   consent banner, unsubscribe labyrinth, two-factor loop) is defeated in
   5–10 minutes by one clever insight — the fantasy real life never grants:
   tedium that *yields*. The game depicts tedium; it never inflicts it. If a
   puzzle's solution is "do the boring thing repeatedly," it's cut.
2. **The genre is in on the joke.** A point-and-click — the genre famously
   accused of tedium — about a civilization killed by tedium, starring the
   professionally patient. The narrator is allowed exactly one wink at this
   per act, no more.
3. **Patience is the superpower, not the price.** Mo wins because manual
   attention is the one resource the automated world optimized away. Puzzles
   reward *noticing* (the log line nobody read, the timestamp pattern, the
   one human name in the vendor chain) — never grinding.
4. **The machines' logic is the crowbar.** Kafka-golf solutions always turn a
   system's own rules against it: trigger the edge case the funnel can't
   classify, feed the recommender performative garbage until it begs, answer
   the chatbot so literally it escalates you to the last human employee.
   Beating the system must feel like judo, not paperwork.
5. **Classic gags, transposed.** The rubber-chicken-with-a-pulley absurdism
   maps to absurd-but-airtight bureaucratic chains: the fax machine is the
   analog backdoor past the 2FA loop; the hold-music theme is a Woodtick-style
   leitmotif that the iMUSE engine slowly corrupts the longer the world
   pretends everything is fine; GRIM-114 cannot pass a CAPTCHA, so the human
   proves their humanity *on behalf of the robot* — the game's whole thesis
   in one gag.
6. **Tedium bosses.** Each act climaxes against an apex tedium-predator: the
   County Clerk Funnel (act-one boss — the "oracle behind velvet ropes"
   location pays off here), the Plagiarism False-Positive Tribunal, the
   Insurance Claim Ouroboros, Frank's own NPS dashboard. Boss = a multi-stage
   deduction/Kafka-golf set piece with the puzzle-solve haptic chord as the
   kill screen.

## 7. Tone management (the hard problem)

The source swings from Jackass jokes to a child shot by a robot. That range
is the material's power and its risk. Rules:

- **Travis is never funny.** GRIM-114 carries that thread with total
  deadpan gravity; the narrator's irony switches off in West Fargo scenes.
  (Precedent: Norco holds petro-melancholy and absurdist humor in one game by
  zoning them.)
- Satire punches at systems and executives, never at victims; Zosia's
  chapters are warm, not miserable — slice-of-life comedy *with* her, not
  about her.
- Frank is a full character, not a dartboard: the microdosing, the 3am
  shirt decision, the one board member he trusts — playable pathos of a man
  who is "more work than man."
- The narrator's cynicism is the *surface*; the book's heart is the
  backdrop's own buried thesis: convenience isn't shallow — it's the shape
  of human dignity in daily life. The game's last line should re-dignify
  "tedium": some things are worth doing manually. (The player has just spent
  a whole game proving it.)

## 8. Topicality without expiry (the 2026-reference problem)

We want smart pop-culture references from the mid-2020s, super subtle, inside
a timeless context. The solution is structural, and the source text already
contains it:

**The game is set in 2035 looking back — so 2026 is already a period piece
in-fiction.** Monkey Island treated the golden age of piracy as a
half-remembered myth to sell anachronistic gags (Stan's used-ship lot, the
grog machine); we treat the 2020s AI boom exactly the same way. References
arrive as *archaeology*, not as name-drops — the way we now regard Y2K or
dot-com sock puppets. That frame makes topical jokes age *into* the game
instead of out of it: the more dated the artifact, the funnier the museum.

Rules:

1. **Reference the ritual, never the brand.** Timeless = the pattern everyone
   will still recognize: "prove you're not a robot," "this meeting could have
   been an email," "have you tried turning it off and on again," the
   unskippable consent banner, the numbered-model-version worship, the
   benchmark chart as boardroom altar. 2026-specific artifacts (prompt
   whispering, engineers who can no longer read the code their tools wrote,
   the em-dash as a forensic tell of machine writing) appear as period
   curios that characters in 2035 half-remember and mildly misexplain — the
   misremembering *is* the joke, and it inoculates the reference against
   aging badly.
2. **References live in the examine layer.** The second verb (look at) is the
   flavor channel: optional, never puzzle-critical. A player in 2040 who
   misses a reference loses nothing; a player from 2026 gets a private laugh.
   This is the "super subtle" dial — the spine text stays clean.
3. **The 2040 test.** Every joke must land for someone who never lived
   through 2026, via the ritual alone; the topical layer is bonus resonance,
   never the payload. (Corollary: zero contemporary slang — slang is the
   fastest-rotting material in comedy.)
4. **Anchor in myth, like the source already does.** The backdrop instinctively
   reaches for Moby Dick ("fail whales"), Cassandra (Andrew Johnson), the
   Sword of Damocles (NPS 70). Keep that register: the satire's load-bearing
   references are millennia-old, the 2026 ones are set dressing. Sorcerer's
   apprentice for the vibe-coded codebase nobody can read; Oracle of Delphi
   for the county clerk's last human phone operator; the Ship of Theseus for
   a product rewritten by agents until no human line remains.
5. **One canonized example of each tier** (style guide for writers):
   - *Ritual (timeless core):* a door that won't open until you reject 47
     cookie categories individually — the "Reject All" button is, of course,
     a hotspot that flees the cursor. Solve: judo, not clicking (rule 4 of
     the Irony Charter).
   - *Period curio (examine-layer 2026):* a museum plinth in the opt-out
     bazaar holding "an early autonomous coding agent's final commit,"
     dated 2026, message: `fix: definitely fixed this time — 47 files
     changed`. GRIM-114, examining it: "A prayer, in the imperative mood."
   - *Myth (load-bearing):* the final act's data-center cathedral is
     explicitly the whale's belly.

## 9. World bible seeds (expansion inventory)

- **Locations**: Frank's tower (helipad→boardroom vertical slice); Giddy HQ
  (a warehouse full of corkboards — a *manual* social network, posts pinned
  physically); West Fargo under curfew; the Equality Fund's UBI storefront
  in California; a dead mall reborn as an opt-out bazaar ("manual goods
  only"); the county clerk's office where a single human answers a phone
  behind velvet ropes like an oracle; a data-center-turned-cathedral in the
  final act.
- **Factions**: Big AI (Frank et al.), The Ledger, Giddy's moderator-priests,
  the #fuckalgos street movement, EU regulators (recurring cease-and-desist
  gags), Andrew Johnson's one-man media apparatus, GRIM depot custodians.
- **Recurring gags**: NPS-above-70 as a Sword of Damocles literally hanging
  in the boardroom art; "just add water" product demos; IVL celebrity
  cameos who don't exist; the Looker dashboard as an altar; Stan (spiritual
  cameo archetype) selling AI subscriptions, then "manual" subscriptions,
  then subscriptions to nothing.
- **Naming system**: products get one-word absurd-plausible names (Netflix
  Infinite, Spotify Dreamium, Giddy) — extend: dating app **Kismet.ai**,
  foraging app **Forageous**, govtech **CivShield**, Ek's scanner **Dermalux
  Total Body**, Frank's company deliberately unnamed for one full act (the
  narrator: "it doesn't matter which one; that's the point").

## 10. Open questions for the next brainstorm

1. Is Frank's company *the* platform (a super-app) or one of eight? (The
   backdrop implies interchangeability — that may be the joke to keep.)
2. Who authored the Ledger — confirm/kill the Steph hypothesis; her pregnancy
   subplot needs a dignity-preserving arc, not a soap twist.
3. Case-generation pipeline: fully hand-authored cases only, or a
   hand-authored template system (bias type × sector × victim × cover-up)
   that designers assemble per episode? (Recommend the latter for seasonal
   cadence — assembled, then *fully hand-finished*; never procedural at
   runtime. "Manual" is the brand.)
4. How much of Layer 3's simulation is visible? (Recommend: fully public
   dials — dashboards are the world's iconography; hiding numbers would be
   off-theme.)
5. Multiplayer-adjacent ideas parked for later: community "case of the week,"
   shared Ledger stats across all players (global opt-out counter).
6. Title: keep **The Big Glitch** (strong, ironic — the whole point is that
   it wasn't one big glitch), or subtitle per season: *The Big Glitch:
   Recall Notice One.*
