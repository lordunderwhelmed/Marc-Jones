// Art direction v2 — "sodium-vapor night" (Thimbleweed-school mixels).
// Wide room (560×216) rendered as chunky dithered pixels; characters drawn
// smooth at 5× and scaled down (the deliberate mixel move); three parallax
// planes: city (0.85) < room (1.0) < foreground silhouettes (1.18).
// Palette thesis: the world is amber sodium-lamp + green-black shadow;
// the ONLY cold color in the room is the phone.

export const ROOMW = 560, H = 216;
export const FLOOR_Y = 150;
export const WALK_MIN_Y = 166, WALK_MAX_Y = 204;

export const PAL = {
  // grounds
  shadow: '#0b0f0a', wallFar: '#161d12', wallNear: '#232517', wallWash: '#3d3018',
  floorD: '#0a0d08', floorL: '#26241458', board: '#1c1c0f',
  // sodium light
  amber: '#ffb14a', amberDeep: '#b06a20', amberDim: '#6e451a',
  // the one cold thing
  phoneCyan: '#7adfff', phoneCyanDeep: '#2e6a8a',
  // sky is light-polluted, not blue
  skyHi: '#1f1608', skyLo: '#5a3512', cityInk: '#12100a', cityLit: '#e8a04c', citySalmon: '#ff8a5e',
  // props
  metal: '#8a7a54', metalD: '#4a4430', hatch: '#3c3a24', hatchD: '#26241a',
  fridge: '#5a6142', fridgeL: '#8a8f60', fridgeD: '#3a4028',
  counter: '#6a5a36', counterD: '#3c3420', cabinet: '#2c2818', cabinetD: '#1e1c10',
  wood: '#6a4526', woodL: '#8f6135', woodD: '#452b16', leg: '#301e0e',
  poster: '#cfa963', posterInk: '#3c2c16', posterRed: '#c05a30',
  pot: '#8a4a2e', potD: '#5c2f1c', leaf: '#4a6a2e', leafL: '#7a9a44', parsley: '#a4c85e',
  clockFace: '#d8c090', clockD: '#8a7350',
  moosh: '#7a7f63', mooshL: '#a3a882', mooshD: '#52563e', mooshPink: '#c98a80',
  glassNight: '#160f06',
};

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function dither(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  c1: string, c2: string, horizontal = false) {
  c.fillStyle = c1; c.fillRect(x, y, w, h);
  c.fillStyle = c2;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const t = horizontal ? i / w : j / h;
    if (t * 16 > BAYER[(y + j) & 3][(x + i) & 3] + 0.5) c.fillRect(x + i, y + j, 1, 1);
  }
}
function speckle(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, density: number, seed = 7) {
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  c.fillStyle = col;
  for (let i = 0; i < w * h * density; i++) c.fillRect((x + rnd() * w) | 0, (y + rnd() * h) | 0, 1, 1);
}
function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d')!; cx.imageSmoothingEnabled = false;
  return [cv, cx];
}

// Window geometry (shared between layers)
export const WIN = { x: 430, y: 26, w: 100, h: 86 };

// ------------------------------------------------------- city (parallax 0.85)
export function drawCity(): HTMLCanvasElement {
  const [cv, c] = canvas(160, 100);
  // light-polluted amber sky
  dither(c, 0, 0, 160, 100, PAL.skyHi, PAL.skyLo);
  // skyline in black-olive ink
  c.fillStyle = PAL.cityInk;
  const bs = [[0, 34, 18], [16, 52, 16], [30, 40, 20], [48, 66, 14], [60, 46, 22], [80, 58, 18], [96, 38, 16], [110, 62, 20], [128, 44, 18], [144, 52, 16]];
  for (const [bx, bh, bw] of bs) c.fillRect(bx, 100 - bh, bw, bh);
  // a few windows still lit — the ones who haven't opted out
  c.fillStyle = PAL.cityLit;
  [[6, 26], [20, 44], [52, 58], [64, 38], [84, 50], [113, 54], [116, 40], [132, 36]].forEach(([a, b]) => c.fillRect(a, 100 - b, 2, 3));
  c.fillStyle = PAL.citySalmon;
  [[34, 32], [100, 30], [146, 44]].forEach(([a, b]) => c.fillRect(a, 100 - b, 2, 3));
  // the sodium streetlamp itself, just off-frame low: a hot smear
  dither(c, 0, 78, 160, 22, 'rgba(255,177,74,0.28)', 'rgba(255,177,74,0)');
  // NOODL∞ sign on the opposite roof — salmon, half-dead
  c.fillStyle = '#7a3520'; c.fillRect(36, 18, 58, 13);
  c.fillStyle = PAL.citySalmon; c.font = 'bold 8px monospace'; c.textBaseline = 'top';
  c.fillText('NOODL', 40, 21);
  // the infinity sign, drawn by hand because neon benders don't do fonts
  c.strokeStyle = PAL.citySalmon; c.lineWidth = 1;
  c.strokeRect(74.5, 22.5, 4, 4); c.strokeRect(79.5, 22.5, 4, 4);
  c.fillStyle = 'rgba(255,138,94,0.30)'; c.fillRect(34, 16, 62, 17);
  return cv;
}

// ---------------------------------------------------------- room (parallax 1)
export function drawRoom(): HTMLCanvasElement {
  const [cv, c] = canvas(ROOMW, H);

  // wall: cold olive far-left → amber-washed near the window
  dither(c, 0, 0, ROOMW, FLOOR_Y, PAL.wallFar, PAL.wallNear, true);
  dither(c, 380, 0, 180, FLOOR_Y, PAL.wallNear, PAL.wallWash, true);
  speckle(c, 0, 0, ROOMW, FLOOR_Y, '#10120a', 0.006, 3);
  c.fillStyle = PAL.shadow; c.fillRect(0, FLOOR_Y - 3, ROOMW, 3);

  // floor
  dither(c, 0, FLOOR_Y, ROOMW, H - FLOOR_Y, '#242414', PAL.floorD);
  c.fillStyle = PAL.board;
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const xTop = 40 + t * (ROOMW - 80), xBot = -60 + t * (ROOMW + 120);
    for (let y = FLOOR_Y; y < H; y++) {
      const k = (y - FLOOR_Y) / (H - FLOOR_Y);
      c.fillRect((xTop + (xBot - xTop) * k) | 0, y, 1, 1);
    }
  }
  speckle(c, 0, FLOOR_Y, ROOMW, H - FLOOR_Y, '#060804', 0.005, 11);

  // ---- delivery hatch (20..76, 56..116)
  c.fillStyle = PAL.hatchD; c.fillRect(18, 54, 60, 64);
  dither(c, 22, 58, 52, 52, PAL.hatch, PAL.hatchD);
  c.fillStyle = '#0a0906'; c.fillRect(30, 92, 36, 9);
  c.fillStyle = PAL.metalD; c.fillRect(26, 64, 44, 3); c.fillRect(26, 70, 44, 3); c.fillRect(26, 76, 44, 3);
  c.fillStyle = PAL.amber; c.font = '5px monospace'; c.textBaseline = 'top';
  c.fillText('*****', 36, 84);
  c.fillStyle = PAL.clockD; c.fillText('NOURLY', 33, 108);

  // ---- counter + sink (84..168)
  c.fillStyle = PAL.counter; c.fillRect(84, 114, 84, 6);
  c.fillStyle = PAL.counterD; c.fillRect(84, 120, 84, 2);
  dither(c, 84, 122, 84, 28, PAL.cabinet, PAL.cabinetD);
  c.fillStyle = PAL.cabinetD; c.fillRect(124, 126, 2, 20);
  c.fillStyle = PAL.metalD; c.fillRect(100, 128, 8, 2); c.fillRect(140, 128, 8, 2);
  c.fillStyle = PAL.metalD; c.fillRect(108, 110, 30, 4);
  c.fillStyle = PAL.cabinetD; c.fillRect(88, 100, 4, 14); c.fillRect(94, 104, 4, 10); c.fillRect(148, 98, 6, 16);
  c.fillStyle = PAL.amberDim; c.fillRect(88, 100, 4, 1); c.fillRect(148, 98, 6, 1);
  c.fillStyle = PAL.metal; c.fillRect(120, 96, 3, 14); c.fillRect(120, 96, 12, 3); c.fillRect(129, 96, 3, 6);
  c.fillStyle = PAL.phoneCyan; c.fillRect(121, 92, 10, 3); // the tap's little cold screen

  // ---- fridge (176..228, 48..152) — amber rim on the window side
  dither(c, 176, 48, 52, 104, PAL.fridge, PAL.fridgeL, true);
  c.fillStyle = PAL.fridgeD; c.fillRect(176, 48, 3, 104); c.fillRect(176, 98, 52, 3);
  c.fillStyle = PAL.amber; c.fillRect(226, 50, 2, 100); // sodium rim light
  c.fillStyle = PAL.metal; c.fillRect(218, 58, 3, 28); c.fillRect(218, 106, 3, 30);
  c.fillStyle = PAL.poster; c.fillRect(184, 112, 28, 14);
  c.fillStyle = PAL.posterInk; c.font = '5px monospace';
  c.fillText('SMART', 188, 115); c.fillText('FRIDGE', 188, 121);
  c.fillStyle = PAL.posterRed; c.fillRect(186, 62, 8, 8);
  c.fillStyle = PAL.leafL; c.fillRect(198, 66, 6, 6);

  // ---- poster (240..290, 36..98)
  c.fillStyle = PAL.posterInk; c.fillRect(238, 34, 54, 68);
  c.fillStyle = PAL.poster; c.fillRect(240, 36, 50, 64);
  dither(c, 240, 36, 50, 20, 'rgba(255,177,74,0.18)', 'rgba(255,177,74,0)');
  c.fillStyle = PAL.posterRed; c.font = '7px monospace';
  c.fillText('EAT.', 250, 44); c.fillText('RATE.', 250, 56); c.fillText('REPEAT.', 246, 68);
  c.fillStyle = PAL.posterInk; c.font = '5px monospace'; c.fillText('nourly+', 252, 86);
  c.fillRect(258, 76, 14, 4);

  // ---- wall clock (396..420, 34..58)
  c.fillStyle = PAL.clockD; c.fillRect(395, 33, 26, 26);
  c.fillStyle = PAL.clockFace; c.fillRect(397, 35, 22, 22);
  c.fillStyle = '#2a2214';
  c.fillRect(408, 40, 2, 6);                                // minute up (:07-ish)
  c.fillRect(410, 45, 5, 2);                                // hour toward 2
  c.fillRect(407, 44, 4, 4);                                // hub
  c.fillStyle = '#8a7350';
  c.fillRect(407, 36, 2, 2); c.fillRect(407, 54, 2, 2); c.fillRect(398, 45, 2, 2); c.fillRect(416, 45, 2, 2);

  // ---- window (430..530, 26..112): glass is TRANSPARENT (city layer behind)
  c.fillStyle = PAL.woodD; c.fillRect(WIN.x - 6, WIN.y - 6, WIN.w + 12, WIN.h + 12);
  c.fillStyle = PAL.wood; c.fillRect(WIN.x - 4, WIN.y - 4, WIN.w + 8, WIN.h + 8);
  c.clearRect(WIN.x, WIN.y, WIN.w, WIN.h);
  // mullions drawn after clear
  c.fillStyle = PAL.wood;
  c.fillRect(WIN.x + WIN.w / 2 - 1, WIN.y, 3, WIN.h); c.fillRect(WIN.x, WIN.y + WIN.h / 2 - 1, WIN.w, 3);
  // sill, amber-lit
  c.fillStyle = PAL.woodL; c.fillRect(WIN.x - 10, WIN.y + WIN.h + 6, WIN.w + 20, 5);
  c.fillStyle = PAL.amberDeep; c.fillRect(WIN.x - 10, WIN.y + WIN.h + 6, WIN.w + 20, 1);

  // ---- plant pot on sill (505..535)
  c.fillStyle = PAL.potD; c.fillRect(506, 114, 22, 5);
  c.fillStyle = PAL.pot; c.fillRect(508, 105, 18, 10);
  c.fillStyle = PAL.amber; c.fillRect(524, 106, 2, 8); // rim

  // ---- table (300..420, 144..182)
  c.fillStyle = PAL.woodD; c.fillRect(298, 142, 124, 4);
  dither(c, 298, 146, 124, 9, PAL.woodL, PAL.wood, true);
  c.fillStyle = PAL.amberDeep; c.fillRect(298, 142, 124, 1);
  c.fillStyle = PAL.leg;
  c.fillRect(306, 155, 5, 27); c.fillRect(410, 155, 5, 27);
  c.fillRect(318, 155, 4, 23); c.fillRect(398, 155, 4, 23);

  // mug (404..418, 130..146)
  c.fillStyle = PAL.posterRed; c.fillRect(402, 128, 13, 14);
  c.fillStyle = '#d87a4a'; c.fillRect(402, 128, 13, 3);
  c.fillStyle = PAL.posterRed; c.fillRect(415, 132, 3, 6);
  c.fillStyle = PAL.clockFace; c.font = '4px monospace'; c.fillText('OK', 405, 133);

  // phone propped against mug (385..400, 122..146) — cyan, the cold object
  c.fillStyle = '#05070a'; c.fillRect(386, 120, 15, 24);
  c.fillStyle = PAL.phoneCyan; c.fillRect(388, 122, 11, 20);
  c.fillStyle = PAL.phoneCyanDeep; c.fillRect(388, 135, 11, 7);

  // baseboard sockets, one sock nearby (where ARE they)
  c.fillStyle = PAL.metalD; c.fillRect(140, 142, 8, 6); c.fillRect(460, 142, 8, 6);
  c.fillStyle = '#8a8266'; c.fillRect(96, 168, 10, 4); c.fillRect(99, 166, 5, 3); // one (1) sock

  // vignette
  const vg = c.createLinearGradient(0, 0, 0, H);
  vg.addColorStop(0, 'rgba(4,5,3,0.4)'); vg.addColorStop(0.3, 'rgba(4,5,3,0)');
  vg.addColorStop(0.82, 'rgba(4,5,3,0)'); vg.addColorStop(1, 'rgba(4,5,3,0.5)');
  c.fillStyle = vg; c.fillRect(0, 0, ROOMW, H);
  return cv;
}

// --------------------------------------------- foreground plane (parallax 1.18)
export function drawForeground(): HTMLCanvasElement {
  const [cv, c] = canvas(ROOMW, H);
  const ink = '#050703', rim = 'rgba(255,177,74,0.35)';
  // stack of Nourly return crates, bottom-left
  c.fillStyle = ink;
  c.fillRect(-10, 158, 96, 60); c.fillRect(4, 132, 70, 30); c.fillRect(14, 112, 46, 24);
  c.fillStyle = rim;
  c.fillRect(4, 132, 70, 1); c.fillRect(14, 112, 46, 1); c.fillRect(72, 133, 2, 28);
  c.fillStyle = 'rgba(255,177,74,0.16)'; c.font = '6px monospace'; c.textBaseline = 'top';
  c.fillText('RETURN', 20, 118); c.fillText('TO SENDER', 12, 140);
  // hanging cable + bare bulb (dead), top center-left
  c.fillStyle = ink; c.fillRect(250, 0, 2, 34);
  c.fillRect(246, 34, 10, 12);
  c.fillStyle = rim; c.fillRect(246, 34, 10, 1);
  c.fillStyle = 'rgba(255,177,74,0.5)'; c.fillRect(250, 42, 2, 2);
  return cv;
}

// ------------------------------------------------------- light shaft + motes
export function drawShaft(): HTMLCanvasElement {
  const [cv, c] = canvas(200, 110);
  // slanted sodium shaft from the window onto the floor
  for (let j = 0; j < 110; j++) {
    const t = j / 110;
    const x0 = 60 - t * 60, wdt = 110 + t * 80;
    for (let i = 0; i < wdt; i += 1) {
      if ((BAYER[j & 3][(i + j) & 3]) > 9 + t * 5.5) continue;
      c.fillStyle = `rgba(255,177,74,${0.16 * (1 - t * 0.75)})`;
      c.fillRect((x0 + i) | 0, j, 1, 1);
    }
  }
  return cv;
}

// ------------------------------------------------------------- plant / moosh
export function drawPlant(hasParsley: boolean): HTMLCanvasElement {
  const [cv, c] = canvas(30, 26);
  c.fillStyle = PAL.leaf;
  c.fillRect(8, 12, 3, 10); c.fillRect(14, 8, 3, 14); c.fillRect(20, 12, 3, 10);
  c.fillRect(5, 16, 3, 6); c.fillRect(23, 16, 3, 6);
  c.fillStyle = PAL.leafL;
  c.fillRect(9, 12, 1, 8); c.fillRect(15, 8, 1, 10); c.fillRect(21, 12, 1, 8);
  if (hasParsley) {
    c.fillStyle = PAL.leafL;
    c.fillRect(11, 4, 2, 2); c.fillRect(13, 2, 2, 2); c.fillRect(15, 4, 2, 2); c.fillRect(12, 6, 4, 3);
    c.fillStyle = PAL.parsley; c.fillRect(13, 3, 2, 2);
  }
  return cv;
}

export function drawMoosh(garnished: boolean): HTMLCanvasElement {
  const [cv, c] = canvas(44, 26);
  c.fillStyle = '#c9bfa0'; c.fillRect(2, 16, 40, 8);
  c.fillStyle = '#a3997c'; c.fillRect(2, 22, 40, 2);
  c.fillStyle = '#e0d6b8'; c.fillRect(2, 16, 40, 1);
  const g1 = PAL.moosh, g2 = '#93987b', g3 = PAL.mooshL, shadowc = PAL.mooshD;
  c.fillStyle = shadowc; c.fillRect(7, 12, 31, 6);
  c.fillStyle = g1; c.fillRect(8, 9, 29, 7); c.fillRect(11, 6, 20, 5); c.fillRect(16, 4, 9, 3);
  c.fillStyle = g2; c.fillRect(12, 7, 14, 4); c.fillRect(18, 5, 6, 3); c.fillRect(28, 8, 6, 4);
  c.fillStyle = g3; c.fillRect(14, 6, 5, 2); c.fillRect(20, 5, 3, 1);
  c.fillStyle = PAL.mooshPink; c.fillRect(22, 8, 5, 3); c.fillRect(30, 10, 3, 2); c.fillRect(13, 10, 2, 2);
  c.fillStyle = '#e8ded2'; c.fillRect(23, 8, 2, 1); c.fillRect(31, 10, 1, 1);
  c.fillStyle = g1; c.fillRect(36, 16, 2, 5); c.fillRect(37, 21, 1, 2);
  c.fillStyle = g3; c.fillRect(19, 3, 2, 2);
  if (garnished) {
    c.fillStyle = PAL.leafL; c.fillRect(18, 0, 3, 3); c.fillRect(23, 1, 3, 2); c.fillRect(14, 2, 3, 2);
    c.fillStyle = PAL.parsley; c.fillRect(19, 0, 2, 2); c.fillRect(24, 1, 1, 1);
  }
  return cv;
}

// ------------------------------------------------- Zosia, the smooth mixel
// Drawn at 5× (100×210) with curves and soft shading, rendered with linear
// filtering at 20×42 world units — a Thimbleweed-school character: crisp,
// rounded, deliberately NOT on the background's pixel grid.
export function drawZosia(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  const SKIN = '#eab48c', SKIN_SH = '#c98f68';
  const HAIR = '#2a1e18', HAIR_RIM = '#8a5326';
  const SWTR = '#d96a4a', SWTR_SH = '#a84a32';
  const PANT = '#33382a', SHOE = '#14170e';

  for (let f = 0; f < 6; f++) {
    const cv = document.createElement('canvas'); cv.width = 100; cv.height = 210;
    const c = cv.getContext('2d')!;
    c.imageSmoothingEnabled = true;
    const walk = f >= 2; const wf = f - 2;
    const swing = walk ? [1, 0, -1, 0][wf] : 0;      // -1..1
    const bob = walk ? (wf % 2 === 0 ? 4 : 0) : 0;
    const y0 = bob;

    const rr = (x: number, y: number, w: number, h: number, r: number, col: string) => {
      c.fillStyle = col; c.beginPath();
      // @ts-ignore roundRect exists in modern canvas
      c.roundRect(x, y, w, h, r); c.fill();
    };

    // legs
    if (walk) {
      const s = swing * 14;
      rr(30 - s, 140, 16, 58, 8, PANT); rr(54 + s, 140, 16, 58, 8, PANT);
      rr(26 - s, 192, 24, 14, 6, SHOE); rr(52 + s, 192, 24, 14, 6, SHOE);
    } else {
      rr(31, 140, 16, 58, 8, PANT); rr(53, 140, 16, 58, 8, PANT);
      rr(27, 194, 24, 12, 6, SHOE); rr(51, 194, 24, 12, 6, SHOE);
    }

    // torso — boxy oversized sweater
    rr(24, y0 + 62, 52, 88, 14, SWTR);
    c.fillStyle = SWTR_SH; c.beginPath();
    // @ts-ignore
    c.roundRect(24, y0 + 132, 52, 18, { bl: 14, br: 14 } as any); c.fill();
    // arms
    const armY = y0 + 70;
    rr(12, armY + swing * 8, 15, 62, 8, SWTR_SH);
    rr(73, armY - swing * 8, 15, 62, 8, SWTR_SH);
    // hands
    rr(14, armY + 54 + swing * 8, 11, 12, 6, SKIN);
    rr(75, armY + 54 - swing * 8, 11, 12, 6, SKIN);
    // sweater rim catching sodium light (right side)
    c.fillStyle = 'rgba(255,177,74,0.5)'; c.fillRect(74, y0 + 66, 2, 78);

    // head — big, round, Thimbleweed proportions
    c.fillStyle = SKIN; c.beginPath(); c.arc(50, y0 + 36, 25, 0, Math.PI * 2); c.fill();
    c.fillStyle = SKIN_SH; c.beginPath(); c.arc(50, y0 + 40, 25, 0.35 * Math.PI, 0.75 * Math.PI); c.fill();
    // hair: bob with fringe
    c.fillStyle = HAIR; c.beginPath();
    c.arc(50, y0 + 32, 26, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    c.fillRect(24, y0 + 30, 12, 30); c.fillRect(64, y0 + 30, 12, 30);
    c.beginPath(); c.moveTo(30, y0 + 22); c.quadraticCurveTo(56, y0 + 10, 72, y0 + 26);
    c.quadraticCurveTo(60, y0 + 22, 46, y0 + 26); c.quadraticCurveTo(38, y0 + 28, 30, y0 + 22); c.fill();
    // amber rim on the hair, window side
    c.strokeStyle = HAIR_RIM; c.lineWidth = 2.5; c.beginPath();
    c.arc(50, y0 + 32, 24.5, -Math.PI * 0.28, Math.PI * 0.12); c.stroke();
    // eyes (blink on frame 1)
    c.fillStyle = '#221812';
    if (f === 1) { c.fillRect(36, y0 + 38, 11, 3.5); c.fillRect(54, y0 + 38, 11, 3.5); }
    else {
      c.beginPath(); c.ellipse(41, y0 + 39, 5, 6, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(60, y0 + 39, 5, 6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.fillRect(42.5, y0 + 35.5, 2.4, 2.4); c.fillRect(61.5, y0 + 35.5, 2.4, 2.4);
    }
    // brows: mildly unimpressed at 2am
    c.strokeStyle = HAIR; c.lineWidth = 2;
    c.beginPath(); c.moveTo(37, y0 + 31); c.lineTo(47, y0 + 30); c.stroke();
    c.beginPath(); c.moveTo(55, y0 + 30); c.lineTo(65, y0 + 31); c.stroke();
    // mouth: a flat line of infinite patience
    c.strokeStyle = '#a06a48'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(44, y0 + 51); c.lineTo(58, y0 + 51); c.stroke();

    frames.push(cv);
  }
  return frames;
}

// glow
export function drawGlow(size = 64): HTMLCanvasElement {
  const [cv, c] = canvas(size, size);
  const g = c.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.4, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  return cv;
}
