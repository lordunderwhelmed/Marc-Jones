// All authored content for The Moosh — examine lines (Zosia's inner
// monologue), classifier labels, chatbot script, narrator cues.
// Per story/COMEDY.md: no stock failure lines, deadpan, jokes tax attention
// never inputs. Per NARRATIVE.md §8: rituals not brands.

export interface HotspotDef {
  id: string; label: string;
  x: number; y: number; w: number; h: number;   // world rect (384x216)
  walkX: number;                                 // where Zosia stands
  examine: string;
  examine2?: string;                             // second look = new joke
  camLabel: string; camOk?: boolean;             // classifier verdict when photographed
}

export const HOTSPOTS: HotspotDef[] = [
  { id: 'window', label: 'window', x: 430, y: 26, w: 100, h: 86, walkX: 468,
    examine: "Rain. The last thing that arrives exactly as advertised.",
    examine2: "The neon says NOODL∞. It has said OPENING SOON for six years. The noodles, presumably, are ready.",
    camLabel: 'WEATHER 88% · mood: cinematic' },
  { id: 'hatch', label: 'delivery hatch', x: 20, y: 56, w: 56, h: 58, walkX: 54,
    examine: "The delivery hatch. Five-star rating. From the drones.",
    examine2: "It once delivered a single olive, overnight, in a crate. The crate was biodegradable. The olive was not.",
    camLabel: 'FIVE-STAR SERVICE PORTAL 100%' },
  { id: 'fridge', label: 'fridge', x: 176, y: 48, w: 52, h: 104, walkX: 204,
    examine: "The fridge auto-orders whatever I'm predicted to want. We have never once agreed.",
    examine2: "Inside: cheese-style slices, milk-adjacent beverage, egg product. Nothing in this fridge is what it says. Everything is what it's labelled.",
    camLabel: 'REFRIGERATOR 99% · contents: cheese-style 74%' },
  { id: 'poster', label: 'poster', x: 240, y: 36, w: 50, h: 62, walkX: 266,
    examine: "“EAT. RATE. REPEAT.” Nourly sent this poster as an apology for the last moosh.",
    examine2: "The poster arrived hot.",
    camLabel: 'ADVERTISEMENT 100% · trust: assumed' },
  { id: 'sink', label: 'smart tap', x: 106, y: 90, w: 40, h: 30, walkX: 128,
    examine: "The smart tap has three settings: filtered, sparkling, and legal disclaimer.",
    camLabel: 'HYDRATION STATION 97%' },
  { id: 'plant', label: 'plastic fern', x: 504, y: 70, w: 32, h: 38, walkX: 492,
    examine: "A plastic fern with plastic parsley. Immortal. The only thing in this kitchen that can't be recalled.",
    examine2: "It photosynthesizes attention.",
    camLabel: 'SALAD (undressed) 91%' },
  { id: 'moosh', label: 'the moosh', x: 330, y: 118, w: 44, h: 26, walkX: 330,
    examine: "It looks like a mix of the Gremlins and water. It cost $14.90, plus service, delivery, convenience, and inconvenience fees.",
    examine2: "It moved. No. It settled. Food settles. This is food. This is fine.",
    camLabel: 'UNRECOGNIZED — is it alive? ⚠' },
  { id: 'phone', label: 'phone', x: 385, y: 118, w: 17, h: 27, walkX: 396,
    examine: "Four hundred apps. One of them is a flashlight.",
    camLabel: 'PHONE 99% (this phone)' },
  { id: 'mug', label: 'mug', x: 402, y: 127, w: 17, h: 16, walkX: 400,
    examine: "WORLD'S OKAYEST HUMAN. A gift from my agent. My AI agent. It knows me.",
    camLabel: 'MUG 99% · self-esteem 12%' },
  { id: 'table', label: 'table', x: 298, y: 142, w: 124, h: 38, walkX: 358,
    examine: "Secondhand. Real wood. It wobbles honestly.",
    camLabel: 'FURNITURE 96% · wobble detected' },
  { id: 'clock', label: 'wall clock', x: 395, y: 33, w: 26, h: 26, walkX: 406,
    examine: "02:07. The hour of refunds.",
    camLabel: 'TIME 100% · late' },
  { id: 'sock', label: 'one (1) sock', x: 92, y: 162, w: 20, h: 14, walkX: 106,
    examine: "A sock. Alone. It has clearly been through something.",
    camLabel: 'SOCK 96% · pair confidence: 50%' },
  { id: 'floor', label: 'floor', x: 0, y: 176, w: 560, h: 40, walkX: 280,
    examine: "Heated floor. It warms the exact tile you just stepped off.",
    camLabel: 'HUMAN 51% — please stand still' },
];

// -------- Interaction depth (DESIGN rule: every scene needs second verbs) --
export const DEPTH = {
  fridgeOpen: [
    "It sighs open. Inside: cheese-style slices, milk-adjacent beverage, egg product. A refrigerator of adjectives.",
    "The interior light works flawlessly. Of course it does. The light has a service-level agreement.",
  ],
  fridgeClose: "It closes itself. Gently. Offended.",
  fridgeInside: [
    "The cheese-style slices are stacked with terrifying precision. Nothing organic stacks like that.",
    "The jar at the bottom predates my subscription. Possibly my lease. We respect each other's privacy.",
    "The milk-adjacent beverage is 'adjacent' the way I am adjacent to being asleep right now.",
  ],
  sink: [
    "Filtered. Sparkling. Legal disclaimer. I choose disclaimer — it's the only honest one.",
    "The tap suggests I hydrate proactively. The tap can mind its own business.",
  ],
  window: [
    "I crack the window. For a moment the rain gets loud and honest.",
    "Cold air. Real weather. No subscription tier.",
  ],
  hatch: [
    "I knock on the hatch. Somewhere in the network, a drone flinches.",
    "A slip prints out: RATE YOUR DELIVERY. I rate it: one moosh out of five.",
  ],
  mooshPokes: [
    "It yields. It reforms. It remembers.",
    "Poking it violates several terms of service. Mine, not its.",
    "It's warm. I wish I didn't know that.",
    "We've bonded now. I hate that we've bonded.",
  ],
  sockPickup: "Reunited. Well — halfway. The other one entered the laundry-as-a-service pipeline in March.",
};

export const PARSLEY = {
  pickupLine: "Zosia pockets a sprig of immortal parsley. It has outlived three governments.",
  garnishLine: "Chef Zosia plates. The parsley forgives everything.",
  mooshGarnishedExamine: "Garnished. It looks like a crime scene that hired a stylist.",
  mooshGarnishedCam: 'PLATED ENTRÉE · restaurant quality ✓ 99.2%',
};

// -------- Narrator cues (delivered as book captions; VO drops in later) ----
export const CUES = {
  entry: { id: 'N-010', who: 'the book', text: "Two-oh-seven in the morning. Somewhere, it is raining. Somewhere, dinner has arrived." },
  mooshFirstLook: { id: 'N-011', who: 'the book', text: "It looked like a mix of the Gremlins and water. It had been paid for." },
  nudge: { id: 'N-nudge', who: 'the book', text: "The drone knows what food looks like. It has never once known what food is." },
  idle: { id: 'N-090', who: 'the book', text: "Take your time. Everyone in this book wishes they had." },
  terminate: { id: 'N-012', who: 'the book', text: "She did not leave a one-star review. She left." },
};

// -------- Chatbot script: GRAVY, the Nourly assistant ----------------------
// Phases: hello -> wantPhoto -> failed(n) -> approved -> settings -> confirm -> done
export const CHAT = {
  botTag: 'GRAVY · Guest Relations Assistant, Very Yummy',
  hello: [
    "Hi Zosia! I'm GRAVY 🍲 How was tonight's Chef's Surprise?",
  ],
  helloChoices: [
    { t: "It's... a moosh.", r: "A signature texture! Our chefs (297 GPUs, one intern) work hard on mouthfeel." },
    { t: "Is it alive?", r: "Great question! Nourly⁺ meals are 100% inanimate on delivery. Movement after delivery is seasoning settling. Enjoy!" },
    { t: "I want a refund.", r: null }, // advances
  ],
  wantPhoto: "Totally hearing you! To process a refund I just need a photo of the item **as delivered**. Opening drone-cam now — it's one of the perks! 📸",
  failLines: [
    "Hmm! My eyes — which are legally the drone's eyes — found no food in that photo. No food, no refund. That's just science.",
    "Still no food detected! Have you tried photographing the *food part* of the food?",
    "I'm seeing an UNRECOGNIZED OBJECT. Nourly⁺ cannot refund objects. Nourly⁺ refunds *meals*. Meals look like meals!",
    "Between us? The classifier grades on presentation. I've already said too much. 🤫",
  ],
  notFood: (label: string) => `That's ${label ? 'a ' + label.split('·')[0].trim() : 'not the item'}. Flattering! But I need the delivered item.`,
  approved: "GORGEOUS. One (1) PLATED ENTRÉE, restaurant quality. ✓ Since the item is clearly excellent, your refund processes at the Excellence Rate: **$0.03**. Thanks for choosing Nourly⁺!",
  approvedChoices: [
    { t: "Three cents.", r: "Plus tax! (The tax is negative two cents.)" },
    { t: "Account settings.", r: null },
  ],
  settings: "Of course! What would you like to do? (Most guests choose 'nothing'! 💜)",
  settingsChoices: [
    { t: "Pause subscription", r: "Paused! Un-pausing automatically in 4 hours so you don't miss Moosh Monday. 💜" },
    { t: "Downgrade to Nourly Basic", r: "Done! Nourly Basic is the same price and includes fewer things. Great choice!" },
    { t: "TERMINATE ACCOUNT", r: null },
  ],
  confirm: "Quick check! Terminating forfeits your 4,102 Flavor Points (cash value: $0.00). It also really hurts my feelings (I have those now, it was a product decision). Are you sure?",
  confirmChoices: [
    { t: "Tell me about Flavor Points", r: "Flavor Points can be exchanged for Points, which convert to Tokens, which unlock Points. It's a whole ecosystem!" },
    { t: "TERMINATE. NOW.", r: null },
  ],
  holdToEnd: "Okay. Press and hold to confirm. (Legally I must add: everyone who leaves comes back! Almost everyone. Statistically some people.)",
};

export const END_LINE = "Between 02:00 and 03:03 this morning, 555,789 people pressed that button. You were the first. Somebody noticed.";
