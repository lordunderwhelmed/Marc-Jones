// Art for Beat 2 — "The Mushroom." A forager's hillside cabin at 02:19,
// painted in the same sodium/amber mixel language as the Moosh (art.ts), but
// the key light here is a wood-stove's fire, not a streetlamp — warm orange
// against the cold moon through the window, with the phone the one cyan thing.
// Coordinates are pinned to mushroom.json's block rects so the hotspots land
// on the painted props. Reuses the shared toolkit exported from art.ts.

import { canvas, dither, speckle, PAL } from './art';

export const CABINW = 480, CH = 216;
export const CABIN_FLOOR_Y = 150;

// cabin-specific pigments layered over the theme palette (defaults = sodium)
const FIRE = '#ff7a2e', FIRE_HI = '#ffd07a', FIRE_LO = '#b84018';
const MOON = '#c4d2e8', MOON_DIM = '#6a7a98';
const DOG = '#8a6a44', DOG_HI = '#b08a5a', DOG_LO = '#4e3a24', DOG_NOSE = '#241812';

// window geometry (shared with the hills layer)
export const CWIN = { x: 30, y: 30, w: 80, h: 70 };

// --------------------------------------------------- hills (parallax behind glass)
export function drawHills(): HTMLCanvasElement {
  const [cv, c] = canvas(140, 92);
  // cold night sky, light-polluted amber only at the very bottom horizon
  dither(c, 0, 0, 140, 92, '#0c1220', '#141c30');
  // a few cold stars
  c.fillStyle = '#8a9ac0';
  [[14, 10], [40, 6], [70, 14], [96, 8], [120, 18], [58, 22], [108, 30]].forEach(([a, b]) => c.fillRect(a, b, 1, 1));
  // the moon — the cold disc, the only honest light out there
  c.fillStyle = MOON_DIM; c.beginPath(); c.arc(30, 24, 12, 0, Math.PI * 2); c.fill();
  c.fillStyle = MOON; c.beginPath(); c.arc(30, 24, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#e6eeff'; c.beginPath(); c.arc(27, 21, 5, 0, Math.PI * 2); c.fill();
  // rolling hills in receding ink-blue bands
  const bands: [string, number][] = [['#1a2438', 52], ['#141c2c', 64], ['#0e1420', 76]];
  for (const [col, base] of bands) {
    c.fillStyle = col;
    for (let x = 0; x < 140; x++) {
      const h = base + Math.round(Math.sin(x * 0.08 + base) * 6 + Math.sin(x * 0.21) * 3);
      c.fillRect(x, h, 1, 92 - h);
    }
  }
  // a low mist ribbon — real weather, no subscription tier
  dither(c, 0, 70, 140, 12, 'rgba(180,196,224,0.14)', 'rgba(180,196,224,0)');
  return cv;
}

// ------------------------------------------------------------------ the cabin room
export function drawCabin(): HTMLCanvasElement {
  const [cv, c] = canvas(CABINW, CH);

  // ---- timber wall: warm dark, a touch warmer toward the stove
  dither(c, 0, 0, CABINW, CABIN_FLOOR_Y, '#231910', '#312414', true);
  dither(c, 130, 0, 120, CABIN_FLOOR_Y, '#312414', '#42301c', true);   // firelight wash
  // log courses
  c.fillStyle = '#160f08';
  for (let y = 14; y < CABIN_FLOOR_Y; y += 17) c.fillRect(0, y, CABINW, 1);
  c.fillStyle = '#4a3826';
  for (let y = 15; y < CABIN_FLOOR_Y; y += 17) c.fillRect(0, y, CABINW, 1); // chinking highlight
  speckle(c, 0, 0, CABINW, CABIN_FLOOR_Y, '#0e0a05', 0.006, 5);
  c.fillStyle = PAL.shadow; c.fillRect(0, CABIN_FLOOR_Y - 3, CABINW, 3);

  // ---- floor planks
  dither(c, 0, CABIN_FLOOR_Y, CABINW, CH - CABIN_FLOOR_Y, '#2e2214', '#140e08');
  c.fillStyle = '#100b06';
  for (let i = 0; i < 12; i++) {
    const t = i / 11, xTop = 30 + t * (CABINW - 60), xBot = -50 + t * (CABINW + 100);
    for (let y = CABIN_FLOOR_Y; y < CH; y++) {
      const k = (y - CABIN_FLOOR_Y) / (CH - CABIN_FLOOR_Y);
      c.fillRect((xTop + (xBot - xTop) * k) | 0, y, 1, 1);
    }
  }
  speckle(c, 0, CABIN_FLOOR_Y, CABINW, CH - CABIN_FLOOR_Y, '#060402', 0.005, 11);

  // ---- window (30..110, 30..100): glass transparent, hills layer behind
  c.fillStyle = PAL.woodD; c.fillRect(CWIN.x - 6, CWIN.y - 6, CWIN.w + 12, CWIN.h + 12);
  c.fillStyle = PAL.wood; c.fillRect(CWIN.x - 4, CWIN.y - 4, CWIN.w + 8, CWIN.h + 8);
  c.clearRect(CWIN.x, CWIN.y, CWIN.w, CWIN.h);
  c.fillStyle = PAL.wood;
  c.fillRect(CWIN.x + CWIN.w / 2 - 1, CWIN.y, 3, CWIN.h);
  c.fillRect(CWIN.x, CWIN.y + CWIN.h / 2 - 1, CWIN.w, 3);
  c.fillStyle = PAL.woodL; c.fillRect(CWIN.x - 8, CWIN.y + CWIN.h + 6, CWIN.w + 16, 5); // sill
  c.fillStyle = '#2a3650'; c.fillRect(CWIN.x - 8, CWIN.y + CWIN.h + 6, CWIN.w + 16, 1); // cold moon rim

  // ---- wood stove (140..200, 84..150): cast iron, the fire is the key light
  c.fillStyle = '#0a0806'; c.fillRect(160, 0, 12, 84);                 // stovepipe up to ceiling
  c.fillStyle = '#1a1510'; c.fillRect(161, 0, 3, 84);
  c.fillStyle = '#141010'; c.fillRect(140, 90, 60, 60);               // iron body
  dither(c, 142, 92, 56, 20, '#26201a', '#141010', true);            // top plate
  c.fillStyle = '#0a0806'; c.fillRect(140, 90, 60, 2);
  // legs
  c.fillStyle = '#0a0806'; c.fillRect(146, 144, 6, 8); c.fillRect(188, 144, 6, 8);
  // fire door + glowing grate (glow sprite layers over this at runtime)
  c.fillStyle = '#0a0806'; c.fillRect(154, 106, 32, 30);
  c.fillStyle = FIRE_LO; c.fillRect(157, 109, 26, 24);
  c.fillStyle = FIRE; c.fillRect(159, 114, 22, 17);
  c.fillStyle = FIRE_HI; c.fillRect(162, 118, 15, 10);
  c.fillStyle = '#fff2d0'; c.fillRect(166, 121, 7, 4);
  // grate bars across the fire
  c.fillStyle = '#160f08'; c.fillRect(159, 120, 22, 1); c.fillRect(159, 126, 22, 1);
  c.fillStyle = '#2a2018'; c.fillRect(153, 104, 34, 2);              // door hinge lip
  // a warm cast on the floor in front of the stove
  dither(c, 150, 150, 60, 20, `rgba(255,122,46,0.16)`, `rgba(255,122,46,0)`);

  // ---- pan on the stove top (152..188, 74..86): the evidence, the accomplice
  c.fillStyle = '#050403'; c.fillRect(151, 82, 40, 3);               // shadow under pan
  c.fillStyle = '#3a3630'; c.beginPath(); c.ellipse(170, 80, 19, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#565048'; c.beginPath(); c.ellipse(170, 79, 17, 5, 0, 0, Math.PI * 2); c.fill();
  // the saute — golden, and that is the tragedy
  c.fillStyle = '#8a5a2a'; c.beginPath(); c.ellipse(170, 79, 13, 3.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#b8823a'; c.fillRect(163, 77, 5, 2); c.fillRect(172, 78, 4, 2); c.fillRect(168, 76, 3, 2);
  c.fillStyle = '#6a3f1e'; c.fillRect(166, 79, 3, 2); c.fillRect(174, 78, 2, 2);
  c.fillStyle = '#3a3630'; c.fillRect(188, 78, 12, 3);              // handle
  c.fillStyle = '#565048'; c.fillRect(188, 78, 12, 1);

  // ---- kettle ledge + smart kettle (210..234, 96..118)
  c.fillStyle = PAL.counterD; c.fillRect(204, 118, 46, 4);          // little ledge
  dither(c, 204, 122, 46, 28, PAL.cabinet, PAL.cabinetD);
  c.fillStyle = '#3a3e42'; c.fillRect(212, 98, 20, 20);            // kettle body
  dither(c, 213, 99, 18, 16, '#5a6268', '#3a3e42', true);
  c.fillStyle = '#2a2e32'; c.fillRect(212, 116, 20, 2);
  c.fillStyle = '#6a7278'; c.fillRect(230, 100, 5, 3);            // spout
  c.fillStyle = '#3a3e42'; c.fillRect(216, 94, 12, 3);           // lid
  c.fillStyle = PAL.phoneCyan; c.fillRect(214, 104, 4, 3);       // its cold little smart-screen

  // ---- medicine shelf (250..334, 40..92): vitamins-as-a-service, expired
  c.fillStyle = PAL.woodD; c.fillRect(248, 38, 88, 4);
  c.fillStyle = PAL.wood; c.fillRect(248, 42, 88, 2);
  c.fillStyle = PAL.woodD; c.fillRect(248, 66, 88, 3);
  c.fillStyle = '#160f08'; c.fillRect(248, 44, 88, 22);           // shelf 1 shadow box
  c.fillStyle = '#160f08'; c.fillRect(248, 69, 88, 20);           // shelf 2 shadow box
  c.fillStyle = PAL.amberDeep; c.fillRect(248, 38, 88, 1);        // firelit shelf edge
  // bottles / jars — amber and green, subscription-labelled
  const jars: [number, number, number, number, string][] = [
    [254, 48, 8, 16, '#b8862e'], [266, 50, 7, 14, '#7a9a3a'], [277, 46, 9, 18, '#a85a2e'],
    [290, 50, 6, 14, '#8a6a2a'], [300, 48, 8, 16, '#6a8a4a'], [258, 72, 7, 14, '#a8702e'],
    [270, 74, 8, 12, '#7a9a3a'], [284, 72, 7, 14, '#b8862e'], [296, 73, 8, 13, '#96602e'],
  ];
  for (const [x, y, w, h, col] of jars) {
    c.fillStyle = col; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x, y, 1, h);         // glass sheen
    c.fillStyle = '#e8dcc0'; c.fillRect(x, y + h - 5, w, 3);                // white label
  }
  // the insurance letter — pale, folded, the whole solution sticking out
  c.fillStyle = '#d8cba6'; c.fillRect(312, 70, 20, 18);
  c.fillStyle = '#c2b48c'; c.fillRect(312, 70, 20, 2);
  c.fillStyle = '#8a7a52'; c.fillRect(315, 75, 14, 1); c.fillRect(315, 78, 14, 1); c.fillRect(315, 81, 10, 1);
  c.fillStyle = PAL.posterRed; c.fillRect(315, 84, 11, 2);       // a red-stamped clause

  // ---- table (220..290, 126..152)
  c.fillStyle = PAL.woodD; c.fillRect(220, 126, 72, 4);
  dither(c, 220, 130, 72, 8, PAL.woodL, PAL.wood, true);
  c.fillStyle = PAL.amberDeep; c.fillRect(220, 126, 72, 1);
  c.fillStyle = PAL.leg; c.fillRect(226, 138, 5, 14); c.fillRect(282, 138, 5, 14);
  // phone propped on the table (244..260, 112..128) — cyan, the cold object
  c.fillStyle = '#05070a'; c.fillRect(245, 111, 15, 18);
  c.fillStyle = PAL.phoneCyan; c.fillRect(247, 113, 11, 14);
  c.fillStyle = PAL.phoneCyanDeep; c.fillRect(247, 122, 11, 5);
  c.fillStyle = '#0a1a1e'; c.fillRect(249, 115, 7, 3);          // the smug verdict line
  c.fillStyle = '#d8f0a0'; c.fillRect(250, 116, 2, 1);          // chef's-kiss green tick

  // ---- cot / bed (340..460, 110..156): just abandoned, mid-cramp
  c.fillStyle = PAL.leg; c.fillRect(342, 118, 116, 34);         // frame
  c.fillStyle = PAL.woodD; c.fillRect(342, 118, 116, 3);
  c.fillStyle = '#3a4a3a'; c.fillRect(346, 120, 108, 14);       // mattress
  dither(c, 346, 126, 108, 12, '#5a4a34', '#3a2e1e', true);     // rumpled earthy blanket
  c.fillStyle = '#6a5a40'; c.fillRect(346, 120, 22, 12);        // pillow, dented
  c.fillStyle = '#7a6a4c'; c.fillRect(348, 121, 18, 3);
  c.fillStyle = PAL.leg; c.fillRect(346, 150, 6, 6); c.fillRect(448, 150, 6, 6); // feet

  // ---- door (418..466, 42..150): planked, latched, cold draft
  c.fillStyle = PAL.woodD; c.fillRect(416, 40, 52, 112);
  dither(c, 419, 43, 46, 106, PAL.wood, PAL.woodD, true);
  c.fillStyle = '#160f08'; c.fillRect(430, 43, 1, 106); c.fillRect(444, 43, 1, 106); // planks
  c.fillStyle = PAL.metalD; c.fillRect(422, 92, 8, 5);          // latch
  c.fillStyle = PAL.metal; c.fillRect(422, 92, 8, 1);
  c.fillStyle = '#2a3650'; c.fillRect(416, 40, 1, 112);         // cold air seeping the frame

  // ---- rug (180..290, 170..196): ties absolutely nothing together
  c.fillStyle = '#3a2028'; c.beginPath(); c.ellipse(235, 184, 58, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5a2e34'; c.beginPath(); c.ellipse(235, 184, 52, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8a5a3a'; c.beginPath(); c.ellipse(235, 184, 40, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3a2028'; c.beginPath(); c.ellipse(235, 184, 22, 4, 0, 0, Math.PI * 2); c.fill();
  speckle(c, 180, 172, 110, 24, '#1a0e10', 0.02, 17);          // threadbare

  // ---- vignette
  const vg = c.createLinearGradient(0, 0, 0, CH);
  vg.addColorStop(0, 'rgba(4,3,2,0.42)'); vg.addColorStop(0.3, 'rgba(4,3,2,0)');
  vg.addColorStop(0.82, 'rgba(4,3,2,0)'); vg.addColorStop(1, 'rgba(4,3,2,0.5)');
  c.fillStyle = vg; c.fillRect(0, 0, CABINW, CH);
  return cv;
}

// ---------------------------------------- foreground plane (parallax 1.18)
// A beam across the top hung with a string of drying foraged mushrooms — the
// irony he'll be chewing on shortly — plus a basket in the near corner.
export function drawCabinFg(): HTMLCanvasElement {
  const [cv, c] = canvas(CABINW, CH);
  const ink = '#040302';
  c.fillStyle = ink; c.fillRect(0, 0, CABINW, 10);                 // ceiling beam
  c.fillStyle = `rgba(${PAL.glowRGB},0.28)`; c.fillRect(0, 10, CABINW, 1);
  // string of drying mushrooms hanging from the beam
  c.fillStyle = '#1a120a';
  for (let i = 0; i < 8; i++) {
    const x = 250 + i * 16, len = 10 + (i % 3) * 5;
    c.fillRect(x, 10, 1, len);                                     // string
    c.fillStyle = i % 2 ? '#3a2a18' : '#2e2014';
    c.fillRect(x - 3, 10 + len, 7, 4); c.fillRect(x - 1, 10 + len + 4, 3, 3); // cap + stem
    c.fillStyle = '#1a120a';
  }
  // near basket of foraged finds, bottom-left, in silhouette
  c.fillStyle = ink; c.fillRect(-6, 176, 60, 42);
  c.fillStyle = `rgba(${PAL.glowRGB},0.2)`; c.fillRect(-6, 176, 60, 1);
  c.fillStyle = '#0a0806';
  for (let x = 0; x < 54; x += 6) c.fillRect(x, 178, 1, 40);       // weave
  return cv;
}

// ---------------------------------------- fire shaft (warm light on the floor)
export function drawFireShaft(): HTMLCanvasElement {
  const [cv, c] = canvas(120, 70);
  for (let j = 0; j < 70; j++) {
    const t = j / 70, x0 = 30 - t * 30, wdt = 60 + t * 56;
    for (let i = 0; i < wdt; i++) {
      if (((i + j) & 3) + (j & 3) > 5 - t * 2) continue;
      c.fillStyle = `rgba(255,122,46,${0.14 * (1 - t * 0.8)})`;
      c.fillRect((x0 + i) | 0, j, 1, 1);
    }
  }
  return cv;
}

// ------------------------------------------------- Barnaby, the smug dog
// Two idle frames (breathing). Warm brown, curled by the stove, one eyebrow
// permanently raised — he ate none of the mushrooms and he knows it.
export function drawBarnaby(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 2; f++) {
    const [cv, c] = canvas(52, 30);
    const lift = f;                                     // breathing
    c.fillStyle = '#050403'; c.beginPath(); c.ellipse(26, 27, 22, 4, 0, 0, Math.PI * 2); c.fill(); // shadow
    // curled body
    c.fillStyle = DOG_LO; c.beginPath(); c.ellipse(24, 20 - lift, 20, 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = DOG; c.beginPath(); c.ellipse(24, 18 - lift, 18, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = DOG_HI; c.beginPath(); c.ellipse(21, 15 - lift, 12, 5, 0, 0, Math.PI * 2); c.fill();
    // tail curled around
    c.fillStyle = DOG; c.fillRect(4, 18 - lift, 8, 5); c.fillRect(4, 16 - lift, 5, 4);
    c.fillStyle = DOG_HI; c.fillRect(4, 16 - lift, 4, 2);
    // head resting, raised toward the room (watching you)
    c.fillStyle = DOG; c.beginPath(); c.ellipse(40, 15 - lift, 11, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = DOG_HI; c.beginPath(); c.ellipse(42, 12 - lift, 7, 5, 0, 0, Math.PI * 2); c.fill();
    // snout
    c.fillStyle = DOG_LO; c.fillRect(47, 15 - lift, 8, 5);
    c.fillStyle = DOG_NOSE; c.fillRect(53, 15 - lift, 2, 3);
    // ear, floppy
    c.fillStyle = DOG_LO; c.fillRect(34, 8 - lift, 6, 11);
    // the smug eye + raised brow
    c.fillStyle = DOG_NOSE; c.fillRect(43, 12 - lift, 2, 2);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(43, 12 - lift, 1, 1);
    c.strokeStyle = DOG_LO; c.lineWidth = 1;
    c.beginPath(); c.moveTo(42, 9 - lift); c.lineTo(47, 8 - lift); c.stroke();  // the eyebrow of judgement
    // firelight rim on the stove side
    c.fillStyle = `rgba(255,122,46,0.4)`; c.fillRect(6, 14 - lift, 2, 8);
    frames.push(cv);
  }
  return frames;
}

// ------------------------------------------------- Imre, the forager (smooth mixel)
// Same technique as Zosia (drawn 5×, filtered down): frame layout matches the
// runtime's expectation — [0]=idle, [1]=idle-blink, [2..5]=side-walk cycle.
// He's bearded, in a heavy oatmeal sweater, hunched a few degrees around a
// stomach that has filed a formal objection.
export function drawImre(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  const SKIN = '#d8a074', SKIN_SH = '#b07e54';
  const HAIR = '#3a2a1a', BEARD = '#4a3624', BEARD_HI = '#6a4e34';
  const SWTR = '#b8a884', SWTR_SH = '#8a7a58', SWTR_RIB = '#9a8a66';
  const PANT = '#3a3428', SHOE = '#1a160e';

  const P = { SKIN, SKIN_SH, HAIR, BEARD, BEARD_HI, SWTR, SWTR_SH, SWTR_RIB, PANT, SHOE };
  for (let f = 0; f < 6; f++) {
    const cv = document.createElement('canvas'); cv.width = 100; cv.height = 210;
    const c = cv.getContext('2d')!; c.imageSmoothingEnabled = true;
    if (f >= 2) { drawImreSide(c, f - 2, P); frames.push(cv); continue; }
    drawImreFront(c, f === 1, P);
    frames.push(cv);
  }
  return frames;
}

function rrf(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, col: string) {
  c.fillStyle = col; c.beginPath();
  // @ts-ignore roundRect exists in modern canvas
  c.roundRect(x, y, w, h, r); c.fill();
}

function drawImreFront(c: CanvasRenderingContext2D, blink: boolean, P: Record<string, string>) {
  const lean = 3;                                   // hunched around the cramp
  // legs
  rrf(c, 30 + lean, 140, 17, 58, 8, P.PANT); rrf(c, 54 + lean, 140, 17, 58, 8, P.PANT);
  rrf(c, 26 + lean, 194, 25, 13, 5, P.SHOE); rrf(c, 52 + lean, 194, 25, 13, 5, P.SHOE);
  // torso — heavy sweater, boxy, leaning forward
  rrf(c, 22 + lean, 60, 56, 90, 15, P.SWTR);
  c.fillStyle = P.SWTR_SH; c.beginPath();
  // @ts-ignore
  c.roundRect(22 + lean, 132, 56, 18, { bl: 15, br: 15 } as never); c.fill();
  // knit ribbing
  c.strokeStyle = P.SWTR_RIB; c.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(30 + lean + i * 10, 74); c.lineTo(30 + lean + i * 10, 128); c.stroke(); }
  // one hand pressed to the stomach, the other slack
  const armY = 72;
  rrf(c, 10 + lean, armY, 16, 56, 8, P.SWTR_SH);
  rrf(c, 74 + lean, armY, 16, 50, 8, P.SWTR_SH);
  rrf(c, 46 + lean, 112, 13, 12, 6, P.SKIN);          // hand on belly
  rrf(c, 12 + lean, armY + 48, 12, 12, 6, P.SKIN);
  c.fillStyle = 'rgba(255,122,46,0.42)'; c.fillRect(74 + lean, 66, 2, 76); // firelight rim, stove side
  // head
  c.fillStyle = P.SKIN; c.beginPath(); c.arc(50 + lean, 40, 24, 0, Math.PI * 2); c.fill();
  c.fillStyle = P.SKIN_SH; c.beginPath(); c.arc(50 + lean, 44, 24, 0.35 * Math.PI, 0.78 * Math.PI); c.fill();
  // hair — receding, tousled
  c.fillStyle = P.HAIR; c.beginPath();
  c.arc(50 + lean, 30, 25, Math.PI * 1.02, Math.PI * 1.98); c.fill();
  c.fillRect(26 + lean, 28, 10, 20); c.fillRect(64 + lean, 28, 10, 20);
  // beard — a forager's beard
  c.fillStyle = P.BEARD; c.beginPath(); c.arc(50 + lean, 50, 22, 0.12 * Math.PI, 0.88 * Math.PI); c.fill();
  c.fillRect(30 + lean, 44, 8, 18); c.fillRect(62 + lean, 44, 8, 18);
  c.fillStyle = P.BEARD_HI; c.fillRect(40 + lean, 60, 20, 3);
  // firelit rim on the hair, stove side
  c.strokeStyle = '#8a5326'; c.lineWidth = 2.5; c.beginPath();
  c.arc(50 + lean, 30, 23.5, -Math.PI * 0.28, Math.PI * 0.1); c.stroke();
  // eyes — pained, a bit up at 2am
  c.fillStyle = '#221812';
  if (blink) { c.fillRect(37 + lean, 39, 10, 3); c.fillRect(55 + lean, 39, 10, 3); }
  else {
    c.beginPath(); c.ellipse(42 + lean, 40, 4.5, 5.5, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(60 + lean, 40, 4.5, 5.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(43 + lean, 36.5, 2.2, 2.2); c.fillRect(61 + lean, 36.5, 2.2, 2.2);
  }
  // brows knitted in discomfort
  c.strokeStyle = P.HAIR; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(37 + lean, 33); c.lineTo(47 + lean, 35); c.stroke();
  c.beginPath(); c.moveTo(55 + lean, 35); c.lineTo(65 + lean, 33); c.stroke();
}

function drawImreSide(c: CanvasRenderingContext2D, wf: number, P: Record<string, string>) {
  const swing = [1, 0, -1, 0][wf];
  const bob = wf % 2 === 0 ? 3 : 0;
  const y0 = bob, s = swing * 15, lean = 4;
  // back leg
  rrf(c, 42 - s + lean, 142, 16, 54, 7, '#2a251c');
  rrf(c, 38 - s + lean, 190, 24, 12, 5, '#100c07');
  // back arm
  rrf(c, 34 - s * 0.7 + lean, y0 + 74, 13, 52, 7, P.SWTR_SH);
  // torso leaning into the walk
  rrf(c, 30 + lean, y0 + 62, 42, 88, 12, P.SWTR);
  c.fillStyle = P.SWTR_SH; c.beginPath();
  // @ts-ignore
  c.roundRect(30 + lean, y0 + 132, 42, 18, { bl: 12, br: 12 } as never); c.fill();
  c.strokeStyle = P.SWTR_RIB; c.lineWidth = 1.3;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(36 + lean + i * 10, y0 + 74); c.lineTo(36 + lean + i * 10, y0 + 128); c.stroke(); }
  // front leg
  rrf(c, 46 + s + lean, 142, 16, 56, 7, P.PANT);
  rrf(c, 46 + s + lean, 192, 25, 12, 5, P.SHOE);
  // front arm
  rrf(c, 48 + s * 0.8 + lean, y0 + 72, 13, 56, 7, P.SWTR);
  rrf(c, 50 + s * 0.8 + lean, y0 + 122, 11, 11, 5, P.SKIN);
  // head in profile (faces right)
  c.fillStyle = P.SKIN; c.beginPath(); c.arc(52 + lean, y0 + 40, 23, 0, Math.PI * 2); c.fill();
  c.fillStyle = P.SKIN; c.beginPath(); c.arc(73 + lean, y0 + 46, 4.5, 0, Math.PI * 2); c.fill(); // nose
  // beard in profile
  c.fillStyle = P.BEARD; c.beginPath(); c.arc(56 + lean, y0 + 52, 18, 1.65 * Math.PI, 0.55 * Math.PI); c.fill();
  c.fillRect(52 + lean, y0 + 48, 20, 16);
  c.fillStyle = P.BEARD_HI; c.fillRect(58 + lean, y0 + 60, 12, 3);
  // hair
  c.fillStyle = P.HAIR; c.beginPath(); c.arc(48 + lean, y0 + 30, 25, Math.PI * 0.9, Math.PI * 1.85); c.fill();
  c.fillRect(26 + lean, y0 + 28, 20, 20);
  c.strokeStyle = '#8a5326'; c.lineWidth = 2.4;
  c.beginPath(); c.arc(48 + lean, y0 + 30, 23.5, Math.PI * 1.5, Math.PI * 1.92); c.stroke();
  // one eye + brow
  c.fillStyle = '#221812'; c.beginPath(); c.ellipse(63 + lean, y0 + 40, 4, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(64 + lean, y0 + 36.5, 2, 2);
  c.strokeStyle = P.HAIR; c.lineWidth = 2; c.beginPath(); c.moveTo(57 + lean, y0 + 33); c.lineTo(69 + lean, y0 + 34); c.stroke();
}
