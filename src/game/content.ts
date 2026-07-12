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
  { id: 'window', label: 'window', x: 212, y: 28, w: 92, h: 82, walkX: 250,
    examine: "Rain. The last thing that arrives exactly as advertised.",
    examine2: "The neon says NOODL∞. It has said OPENING SOON for six years. The noodles, presumably, are ready.",
    camLabel: 'WEATHER 88% · mood: cinematic' },
  { id: 'hatch', label: 'delivery hatch', x: 20, y: 58, w: 52, h: 56, walkX: 52,
    examine: "The delivery hatch. Five-star rating. From the drones.",
    examine2: "It once delivered a single olive, overnight, in a crate. The crate was biodegradable. The olive was not.",
    camLabel: 'FIVE-STAR SERVICE PORTAL 100%' },
  { id: 'fridge', label: 'fridge', x: 84, y: 50, w: 48, h: 102, walkX: 112,
    examine: "The fridge auto-orders whatever I'm predicted to want. We have never once agreed.",
    examine2: "Inside: cheese-style slices, milk-adjacent beverage, egg product. Nothing in this fridge is what it says. Everything is what it's labelled.",
    camLabel: 'REFRIGERATOR 99% · contents: cheese-style 74%' },
  { id: 'poster', label: 'poster', x: 148, y: 36, w: 46, h: 60, walkX: 168,
    examine: "“EAT. RATE. REPEAT.” Nourly sent this poster as an apology for the last moosh.",
    examine2: "The poster arrived hot.",
    camLabel: 'ADVERTISEMENT 100% · trust: assumed' },
  { id: 'sink', label: 'smart tap', x: 8, y: 118, w: 40, h: 26, walkX: 36,
    examine: "The smart tap has three settings: filtered, sparkling, and legal disclaimer.",
    camLabel: 'HYDRATION STATION 97%' },
  { id: 'plant', label: 'plastic fern', x: 288, y: 84, w: 30, h: 30, walkX: 278,
    examine: "A plastic fern with plastic parsley. Immortal. The only thing in this kitchen that can't be recalled.",
    examine2: "It photosynthesizes attention.",
    camLabel: 'SALAD (undressed) 91%' },
  { id: 'moosh', label: 'the moosh', x: 176, y: 128, w: 40, h: 22, walkX: 172,
    examine: "It looks like a mix of the Gremlins and water. It cost $14.90, plus service, delivery, convenience, and inconvenience fees.",
    examine2: "It moved. No. It settled. Food settles. This is food. This is fine.",
    camLabel: 'UNRECOGNIZED — is it alive? ⚠' },
  { id: 'phone', label: 'phone', x: 222, y: 128, w: 18, h: 24, walkX: 232,
    examine: "Four hundred apps. One of them is a flashlight.",
    camLabel: 'PHONE 99% (this phone)' },
  { id: 'mug', label: 'mug', x: 244, y: 132, w: 14, h: 16, walkX: 240,
    examine: "WORLD'S OKAYEST HUMAN. A gift from my agent. My AI agent. It knows me.",
    camLabel: 'MUG 99% · self-esteem 12%' },
  { id: 'table', label: 'table', x: 160, y: 146, w: 110, h: 30, walkX: 205,
    examine: "Secondhand. Real wood. It wobbles honestly.",
    camLabel: 'FURNITURE 96% · wobble detected' },
  { id: 'clock', label: 'wall clock', x: 330, y: 40, w: 22, h: 22, walkX: 320,
    examine: "02:07. The hour of refunds.",
    camLabel: 'TIME 100% · late' },
  { id: 'floor', label: 'floor', x: 0, y: 176, w: 384, h: 40, walkX: 192,
    examine: "Heated floor. It warms the exact tile you just stepped off.",
    camLabel: 'HUMAN 51% — please stand still' },
];

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
