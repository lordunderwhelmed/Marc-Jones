# The Comedy Bible — operating rules for writing The Big Glitch

*Distilled from the craft research in `RESEARCH.md` §6 into rules we
actually enforce. Complements the Irony Charter (`NARRATIVE.md` §6) and the
topicality rules (`NARRATIVE.md` §8). When a rule cites a name, the source
is in RESEARCH.md.*

---

## 1. The contract (never break these)

1. **Wrong answers cost nothing and pay out in jokes.** The player is never
   punished for doing something funny — doing funny things is the point
   (Ardai on DOTT). Every failure response is authored; a stock failure
   line is a build error.
2. **Failure text gets our best writing, not our leftovers.** Disco
   Elysium's failed checks are often better written than successes — the
   game *pays you for failing*. Budget accordingly: wrong-attempt lines are
   first-class content with their own polish pass.
3. **Make the player feel clever, never the writer** (Grossman). The
   target reaction to every puzzle solution is the punchline reaction:
   "Of course — why didn't I think of that sooner!"
4. **The goal itself must be funny** (Grossman/RtMI; Goose Game's to-do
   list of pranks). Ship's Log entries are written as jokes with stakes:
   not "obtain refund" but "convince the drone your dinner is food."
5. **If we don't have anything funny to say about a situation, something's
   fake** (Schafer). Any hotspot, verb, or system the player can poke must
   acknowledge being poked — in character.

## 2. The narrator (the game's biggest comedy system)

1. **Deadpan survives repetition; performance decays** (Wolpaw's TTS
   lesson → GLaDOS). The narrator never winks. Flat, newsreader gravitas;
   the content carries the absurdity. This is already the recorded-take
   direction in `scripts/intro-narration.md` — it is now doctrine.
2. **The world is the straight man; the player is the comedian.** The
   narrator's job is perfect composure about absurd things and mild,
   escalating discomposure about the player's *choices* (the Stanley
   Parable inversion — enumerate defiance and reward each branch: for
   every authored choice, write the compliance line, the defiance line,
   and the escalation chain).
3. **Silence is authored** (Pugh's "quiet spaces"). Cue tables include
   deliberate no-narration zones; anticipation is a timing instrument. The
   vignettes already follow this: entry cue, silence during play,
   punctuation cue.
4. **Short when reactive, long only when the player stands still** (the
   footnote principle). Idle lines are where digressions live.
5. **Never repeat a gag; condition-gate every line** (Bastion, L4D). A gag
   line must never be the fallback bark. Repetition-awareness is an engine
   feature (cue system: once-per-rule + priority queue), not writer
   discipline alone.
6. **Cruelty has a measurable ceiling** (Portal 2 playtests). The
   narrator's irony is wounded and wry, never vicious — and it switches
   off entirely in the Travis register (Tone rules, `NARRATIVE.md` §7).

## 3. The examine layer (highest joke density per byte)

1. Every hotspot gets a unique look-at line written as **the current
   protagonist's inner monologue** — we are Mo's/Zosia's/Frank's frontal
   lobe, not a neutral describer. Same object, different protagonist =
   different joke (characterization for free).
2. Every optionally-read channel is a **footnote slot** (Pratchett):
   examine text, item descriptions, the Ship's Log margin notes,
   achievement names, save-slot names, settings-menu copy, error toasts.
   The UI itself may editorialize (Adams' apparatus-as-narrator) — with
   the hard caveat: **jokes may tax attention, never inputs.** A joke that
   makes the player type/tap/repeat something exactly is cut.
3. **Medium-native jokes rank highest** (Adams' "no tea"): jokes only a
   game state can tell. The Big Glitch is rich soil: the refund chatbot's
   confidence percentages, inventory items classified wrongly by the
   in-world AI ("PLASTIC PARSLEY — 99.2% GARNISH"), the Moments engine
   offering to clip your most embarrassing failure.

## 4. Puzzle-as-joke (formal calibration)

A puzzle is structured like a joke: setup (the problem), misdirection (the
obvious-but-wrong approach), cognitive shift (the solve). Karhulahti 2021
formalizes it; Gilbert's rules operationalize it.

1. **Teach the cartoon rule before asking the player to exploit it**
   (DOTT's discipline; the slice's classifier demonstrates label-beats-
   substance on optional hotspots first). Irrational-but-inevitable.
2. **Knobs per puzzle, tuned in data**: step count · clue-to-use distance ·
   signposting strength · attempts-before-nudge · parallel open puzzles.
3. **Funny failure responses double as graduated hints** — the hint ladder
   starts inside the jokes, before the hint companion is ever consulted.
4. **Lampshade what we can't fix** (Grossman): if a puzzle's logic is
   implausible and beloved, have the game admit it — the admission is the
   joke and the apology.
5. **Playtest ritual**: after each session, collect the "what did you try
   that didn't work?" list and author responses to it (the DOTT pizza-orgy
   method). This list is a standing agenda item, not ad hoc.
6. **The Grim Fandango warning**: Schafer, rereading his own puzzle doc —
   "some of them puzzles were nuts. Obscure. Mean, even." When in doubt,
   the puzzle is too hard; the hint ladder is not an excuse to ship mean.
7. **Jargon jousting is our insult sword-fighting**: collecting ripostes =
   collecting punchlines; the duel is delivering the right punchline to
   the right setup. Ripostes must work against *paraphrased* setups (the
   swordmaster rule) so the mechanic tests understanding, not memory.

## 5. The joke-first pipeline (process)

1. **Scenarios are teased out of gags** (Thank Goodness You're Here): a
   gag graduates into a scene only if it's still funny a week later. Keep
   a gag backlog; review weekly; most gags die there, correctly.
2. **Don't kill dumb ideas early** (the three-headed monkey rule) — the
   backlog exists so dumbness can prove itself.
3. **A gag is dropped before it outstays its welcome**; running gags are
   rationed and threaded through the spine with foreshadowing (GDC 2010),
   and callbacks are deployed "only very deliberately" (RtMI).
4. **Comedy lowers defenses, then hits with something emotional** — every
   act needs its gut-punch placed where the jokes have opened the door
   (Travis, the Ghost, Frank's 3am marriage).
5. **The empirical test is laughter** (Toby Fox): if the room doesn't
   laugh, improve or cut. No joke ships on theory.
6. **Comedy is fixed in implementation, not the booth**: VO recorded in
   passes against the build (Stanley Parable/Bastion); timing bugs are
   comedy bugs and get triaged as such.

## 6. Easter eggs & secrets (the iceberg spec)

Three tiers (Animal Well architecture), each with a different audience:

- **Tier 1 — the surface**: background gags and examine jokes every player
  brushes against. Density guideline: no screen without at least one; the
  funniest material may live in fully optional interactions.
- **Tier 2 — the attentive**: cross-scene callbacks, the timestamp
  breadcrumbs, characters' recurring histories, hidden interactions for
  players who try weird verb combinations (improv-development harvest).
  Findable by a curious individual.
- **Tier 3 — the community**: Ledger-cipher-grade secrets designed to be
  solved by forums, not individuals (optimal obscurity = findable by the
  community). The Tunic principle governs: the best secret is retroactive
  — "it was here the whole time" — the intro's 02:07/02:19/02:31/02:48/
  02:59 timestamps are exactly this. Fez warning: never ship a secret
  *designed* to stay unsolved; mystique curdles into anticlimax.
- **The Thimbleweed knob**: reference/in-joke density gets a settings
  toggle if playtests show non-cognoscenti fatigue. Better: obey the
  examine-layer rule (`NARRATIVE.md` §8) so references never sit in the
  spine at all.

## 7. Character comedy assignments (who is allowed which register)

- **Narrator**: dry irony, wounded not vicious; off-switch in Travis
  register.
- **Mo**: deadpan competence; comedy of noticing ("the only adult in the
  room" energy — Frog Detective's ordinary-absurdism).
- **Frank**: conviction comedy (Cave Johnson lineage) — escalation through
  total sincerity about insane premises. Never self-aware.
- **Zosia**: warm exasperation; the audience surrogate; jokes happen *to*
  her and she rates them.
- **GRIM-114**: pure GLaDOS-inversion — a machine voice with perfect
  literalism and accidental profundity ("A prayer, in the imperative
  mood."). Its comedy is precision; it never attempts a joke, which is why
  it lands the biggest ones. Also carries the heaviest dramatic beats —
  the comedy/gravity contrast is the design (put humor where the drama is).
- **The world's AIs**: huffy dignity (Goose Game villagers) — every
  chatbot, kiosk, and drone maintains bureaucratic self-respect while
  being wrong.
