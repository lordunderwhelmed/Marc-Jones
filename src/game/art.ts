// Procedural pixel art for The Moosh — 384×216 kitchen at 02:07am.
// Everything drawn in-palette with ordered dithering (RESEARCH.md §2:
// "remembered VGA" = painterly gradients + dither grain + one dynamic light).

export const W = 384, H = 216;
export const FLOOR_Y = 150;          // wall/floor junction
export const WALK_MIN_Y = 166, WALK_MAX_Y = 204;

export const PAL = {
  wallD: '#1b1830', wallL: '#2f2a4f', wallEdge: '#141126',
  floorD: '#0e0c1a', floorL: '#1d1936', board: '#262048',
  sky: '#0a0920', city: '#161334', cityLit: '#2a2450',
  neon: '#ff4f9e', neonDim: '#a03468', frame: '#3a3358', glass: '#121028',
  fridge: '#767b96', fridgeL: '#9aa0bc', fridgeD: '#4d5170', fridgeHandle: '#c9cede',
  counter: '#565d80', counterD: '#3a3452', cabinet: '#2c2749', cabinetD: '#221e3c',
  metal: '#7d84a0', metalD: '#4d5170',
  hatch: '#555c78', hatchD: '#363c54', hatchSlot: '#0d0b18',
  poster: '#c9b98a', posterInk: '#443a2e', posterRed: '#c0503c',
  wood: '#6b4a34', woodL: '#83583d', woodD: '#4c3324', leg: '#3a2718',
  pot: '#8a4a3a', potD: '#5e3227', leaf: '#3f7a45', leafL: '#58a35c',
  moosh: '#9aa46b', mooshL: '#b8c084', mooshD: '#6f7549', mooshPink: '#c98a96',
  hair: '#2b2136', skin: '#d8a183', sweater: '#3f7a78', sweaterD: '#2c5a58',
  pants: '#2c2749', shoe: '#17131f',
  clock: '#c9c4b0', clockD: '#8a8676',
  screen: '#9fd8ff', warm: '#ffb64c',
};

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function px(c: CanvasRenderingContext2D, x: number, y: number, col: string) {
  c.fillStyle = col; c.fillRect(x | 0, y | 0, 1, 1);
}

/** Vertical (or horizontal) dithered gradient between two colors. */
function dither(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  c1: string, c2: string, horizontal = false) {
  c.fillStyle = c1; c.fillRect(x, y, w, h);
  c.fillStyle = c2;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const t = horizontal ? i / w : j / h;
      if (t * 16 > BAYER[(y + j) % 4][(x + i) % 4] + 0.5) c.fillRect(x + i, y + j, 1, 1);
    }
  }
}

function speckle(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, density: number, seed = 7) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  c.fillStyle = col;
  const count = w * h * density;
  for (let i = 0; i < count; i++) c.fillRect((x + rnd() * w) | 0, (y + rnd() * h) | 0, 1, 1);
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d')!;
  cx.imageSmoothingEnabled = false;
  return [cv, cx];
}

// ---------------------------------------------------------------- the room
export function drawRoom(): HTMLCanvasElement {
  const [cv, c] = canvas(W, H);

  // wall: darker left, lighter toward window (right)
  dither(c, 0, 0, W, FLOOR_Y, PAL.wallD, PAL.wallL, true);
  speckle(c, 0, 0, W, FLOOR_Y, PAL.wallEdge, 0.02, 3);
  // skirting
  c.fillStyle = PAL.wallEdge; c.fillRect(0, FLOOR_Y - 3, W, 3);

  // floor: dithered depth + boards
  dither(c, 0, FLOOR_Y, W, H - FLOOR_Y, PAL.floorL, PAL.floorD);
  c.fillStyle = PAL.board;
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const xTop = 40 + t * (W - 80), xBot = -40 + t * (W + 80);
    for (let y = FLOOR_Y; y < H; y++) {
      const k = (y - FLOOR_Y) / (H - FLOOR_Y);
      px(c, xTop + (xBot - xTop) * k, y, PAL.board);
    }
  }
  speckle(c, 0, FLOOR_Y, W, H - FLOOR_Y, '#08070f', 0.015, 11);

  // ---- window (212,28 92x82) with night city + neon
  const wx = 212, wy = 28, ww = 92, wh = 82;
  c.fillStyle = PAL.frame; c.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
  dither(c, wx, wy, ww, wh, PAL.sky, PAL.glass);
  // city silhouettes
  c.fillStyle = PAL.city;
  const bx = [0, 14, 26, 40, 52, 66, 78];
  const bh = [30, 44, 24, 52, 34, 46, 28];
  bx.forEach((b, i) => c.fillRect(wx + b, wy + wh - bh[i], 13, bh[i]));
  // a few lit windows (the ones who haven't opted out yet)
  c.fillStyle = PAL.cityLit;
  [[6, 40], [18, 22], [44, 30], [46, 44], [70, 26], [58, 38]].forEach(([a, b]) => c.fillRect(wx + a, wy + wh - b, 2, 3));
  // neon sign: NOODL∞ block
  c.fillStyle = PAL.neonDim; c.fillRect(wx + 16, wy + 14, 60, 14);
  c.fillStyle = PAL.neon;
  c.font = '7px monospace'; c.textBaseline = 'top';
  c.fillText('NOODL∞', wx + 22, wy + 18);
  // crossbars
  c.fillStyle = PAL.frame;
  c.fillRect(wx + ww / 2 - 1, wy, 2, wh); c.fillRect(wx, wy + wh / 2 - 1, ww, 2);
  // sill
  c.fillStyle = PAL.frame; c.fillRect(wx - 8, wy + wh + 4, ww + 16, 5);

  // window light pool on floor (dithered, angled)
  const [lp, lc] = canvas(120, 60);
  dither(lc, 0, 0, 120, 60, 'rgba(159,216,255,0.16)', 'rgba(159,216,255,0.0)');
  c.save(); c.globalAlpha = 0.7;
  c.setTransform(1, 0, -0.5, 1, wx + 36, FLOOR_Y);
  c.drawImage(lp, 0, 0); c.restore(); c.setTransform(1, 0, 0, 0 + 1, 0, 0);

  // ---- delivery hatch (20,58 52x56)
  c.fillStyle = PAL.hatchD; c.fillRect(18, 56, 56, 60);
  dither(c, 22, 60, 48, 48, PAL.hatch, PAL.hatchD);
  c.fillStyle = PAL.hatchSlot; c.fillRect(28, 92, 36, 8);         // slot
  c.fillStyle = PAL.metal; c.fillRect(26, 66, 40, 3);             // vent lines
  c.fillRect(26, 72, 40, 3); c.fillRect(26, 78, 40, 3);
  c.fillStyle = PAL.clock; c.font = '5px monospace';
  c.fillText('NOURLY', 32, 108);
  // stars rating scratched in
  c.fillStyle = PAL.warm; c.fillText('*****', 34, 84);

  // ---- fridge (84,50 48x102) — window is to the right, so light hits the right face
  dither(c, 84, 50, 48, 102, PAL.fridge, PAL.fridgeL, true);
  c.fillStyle = PAL.fridgeD; c.fillRect(84, 50, 3, 102); c.fillRect(84, 98, 48, 3);
  c.fillStyle = PAL.fridgeHandle; c.fillRect(124, 60, 3, 26); c.fillRect(124, 106, 3, 30);
  // stickers
  c.fillStyle = PAL.poster; c.fillRect(92, 112, 26, 14);
  c.fillStyle = PAL.posterInk; c.font = '5px monospace';
  c.fillText('SMART', 95, 115); c.fillText('FRIDGE', 95, 121);
  c.fillStyle = PAL.neon; c.fillRect(94, 66, 8, 8); // magnet
  c.fillStyle = PAL.leafL; c.fillRect(106, 70, 6, 6); // magnet

  // ---- counter + sink (0..84)
  c.fillStyle = PAL.counter; c.fillRect(0, 116, 84, 6);
  dither(c, 0, 122, 84, 28, PAL.cabinet, PAL.cabinetD);
  c.fillStyle = PAL.cabinetD; c.fillRect(40, 126, 2, 20);
  c.fillStyle = PAL.metal; c.fillRect(38, 128, 6, 2); c.fillRect(20, 128, 6, 2); c.fillRect(56, 128, 6, 2);
  // sink basin + tap
  c.fillStyle = PAL.metalD; c.fillRect(12, 114, 34, 4);
  c.fillStyle = PAL.metal; c.fillRect(24, 100, 3, 14); c.fillRect(24, 100, 12, 3); c.fillRect(33, 100, 3, 6);
  c.fillStyle = PAL.screen; c.fillRect(25, 96, 10, 3); // smart tap display

  // ---- poster (148,36 46x60)
  c.fillStyle = PAL.posterInk; c.fillRect(146, 34, 50, 64);
  c.fillStyle = PAL.poster; c.fillRect(148, 36, 46, 60);
  c.fillStyle = PAL.posterRed; c.font = '7px monospace';
  c.fillText('EAT.', 156, 44); c.fillText('RATE.', 156, 56);
  c.fillText('REPEAT.', 152, 68);
  c.fillStyle = PAL.posterInk; c.font = '5px monospace';
  c.fillText('nourly+', 158, 84);
  // bowl icon
  c.fillStyle = PAL.posterInk; c.fillRect(164, 74, 14, 4);

  // ---- wall clock (330,40 22x22)
  c.fillStyle = PAL.clockD; c.fillRect(329, 39, 24, 24);
  c.fillStyle = PAL.clock; c.fillRect(331, 41, 20, 20);
  // hands at ~02:07
  c.fillStyle = PAL.wallEdge;
  c.fillRect(341, 47, 1, 5); c.fillRect(342, 46, 1, 2);          // hour → 2ish
  c.fillRect(341, 51, 1, 6); c.fillRect(340, 56, 1, 2);          // minute → 7ish
  c.fillRect(340, 50, 3, 2);                                      // hub

  // ---- table (160,146 110x30) with legs
  c.fillStyle = PAL.woodD; c.fillRect(158, 144, 114, 4);
  dither(c, 158, 148, 114, 8, PAL.woodL, PAL.wood, true);
  c.fillStyle = PAL.leg;
  c.fillRect(164, 156, 5, 26); c.fillRect(260, 156, 5, 26);
  c.fillRect(176, 156, 4, 22); c.fillRect(250, 156, 4, 22);

  // mug on table (244,132)
  c.fillStyle = PAL.posterRed; c.fillRect(244, 132, 12, 12);
  c.fillStyle = '#d86a54'; c.fillRect(244, 132, 12, 3);
  c.fillStyle = PAL.posterRed; c.fillRect(256, 135, 3, 6);
  c.fillStyle = PAL.clock; c.font = '4px monospace'; c.fillText('OK', 247, 137);

  // phone propped against mug (222,128 18x24) — screen drawn as glow layer
  c.fillStyle = '#0a0a12'; c.fillRect(224, 124, 15, 22);
  c.fillStyle = PAL.screen; c.fillRect(226, 126, 11, 18);
  c.fillStyle = '#4a90b8'; c.fillRect(226, 138, 11, 6);

  // ---- windowsill plant (288,84 30x30)
  c.fillStyle = PAL.potD; c.fillRect(292, 104, 20, 4);
  c.fillStyle = PAL.pot; c.fillRect(294, 96, 16, 9);
  // fern leaves + parsley sprigs drawn in separate sprite (plant.ts) so pickup can alter it

  // ---- ambient shadows / vignette
  const vg = c.createLinearGradient(0, 0, 0, H);
  vg.addColorStop(0, 'rgba(4,3,10,0.35)'); vg.addColorStop(0.35, 'rgba(4,3,10,0)');
  vg.addColorStop(0.8, 'rgba(4,3,10,0)'); vg.addColorStop(1, 'rgba(4,3,10,0.45)');
  c.fillStyle = vg; c.fillRect(0, 0, W, H);
  const vg2 = c.createLinearGradient(0, 0, W, 0);
  vg2.addColorStop(0, 'rgba(4,3,10,0.4)'); vg2.addColorStop(0.25, 'rgba(4,3,10,0)');
  vg2.addColorStop(0.85, 'rgba(4,3,10,0)'); vg2.addColorStop(1, 'rgba(4,3,10,0.35)');
  c.fillStyle = vg2; c.fillRect(0, 0, W, H);

  return cv;
}

// ------------------------------------------------------------- plant sprite
export function drawPlant(hasParsley: boolean): HTMLCanvasElement {
  const [cv, c] = canvas(30, 26);
  // fern
  c.fillStyle = PAL.leaf;
  c.fillRect(8, 12, 3, 10); c.fillRect(14, 8, 3, 14); c.fillRect(20, 12, 3, 10);
  c.fillRect(5, 16, 3, 6); c.fillRect(23, 16, 3, 6);
  c.fillStyle = PAL.leafL;
  c.fillRect(9, 12, 1, 8); c.fillRect(15, 8, 1, 10); c.fillRect(21, 12, 1, 8);
  if (hasParsley) {
    // the immortal parsley: brighter, curlier
    c.fillStyle = PAL.leafL;
    c.fillRect(11, 4, 2, 2); c.fillRect(13, 2, 2, 2); c.fillRect(15, 4, 2, 2);
    c.fillRect(12, 6, 4, 3);
    c.fillStyle = '#8ad48e'; c.fillRect(13, 3, 2, 2);
  }
  return cv;
}

// ------------------------------------------------------------- moosh sprite
export function drawMoosh(garnished: boolean): HTMLCanvasElement {
  const [cv, c] = canvas(44, 26);
  // takeout container
  c.fillStyle = '#d8d4c8'; c.fillRect(2, 16, 40, 8);
  c.fillStyle = '#b8b4a8'; c.fillRect(2, 22, 40, 2);
  c.fillStyle = '#efeadd'; c.fillRect(2, 16, 40, 1);
  // the moosh: a grey-green mound, gelatinous, slightly wrong
  const g1 = '#7a7f63', g2 = '#93987b', g3 = '#aab088', shadow = '#585c44';
  c.fillStyle = shadow; c.fillRect(7, 12, 31, 6);
  c.fillStyle = g1;
  c.fillRect(8, 9, 29, 7); c.fillRect(11, 6, 20, 5); c.fillRect(16, 4, 9, 3);
  c.fillStyle = g2;
  c.fillRect(12, 7, 14, 4); c.fillRect(18, 5, 6, 3); c.fillRect(28, 8, 6, 4);
  c.fillStyle = g3;
  c.fillRect(14, 6, 5, 2); c.fillRect(20, 5, 3, 1);
  // it is... glistening
  c.fillStyle = PAL.mooshPink; c.fillRect(22, 8, 5, 3); c.fillRect(30, 10, 3, 2); c.fillRect(13, 10, 2, 2);
  c.fillStyle = '#efe4e0'; c.fillRect(23, 8, 2, 1); c.fillRect(31, 10, 1, 1);
  // a drip escaping the container
  c.fillStyle = g1; c.fillRect(36, 16, 2, 5); c.fillRect(37, 21, 1, 2);
  // one (1) bubble
  c.fillStyle = g3; c.fillRect(19, 3, 2, 2);
  if (garnished) {
    c.fillStyle = PAL.leafL;
    c.fillRect(18, 0, 3, 3); c.fillRect(23, 1, 3, 2); c.fillRect(14, 2, 3, 2);
    c.fillStyle = '#8ad48e'; c.fillRect(19, 0, 2, 2); c.fillRect(24, 1, 1, 1);
  }
  return cv;
}

// ------------------------------------------------------------ Zosia frames
// 20×42 each: [idle, blink, walk0, walk1, walk2, walk3]
export function drawZosia(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 6; f++) {
    const [cv, c] = canvas(20, 42);
    const walk = f >= 2;
    const wf = f - 2; // 0..3
    const legSpread = walk ? [3, 1, -3, -1][wf] : 0;
    const bob = walk ? (wf % 2 === 0 ? 1 : 0) : 0;

    const y0 = bob;
    // hair: plum bob
    c.fillStyle = PAL.hair;
    c.fillRect(5, y0 + 0, 10, 9);
    c.fillRect(4, y0 + 3, 12, 7);
    // face
    c.fillStyle = PAL.skin; c.fillRect(7, y0 + 4, 7, 6);
    // fringe
    c.fillStyle = PAL.hair; c.fillRect(7, y0 + 3, 7, 2); c.fillRect(13, y0 + 4, 2, 3);
    // eyes (blink on f==1)
    c.fillStyle = f === 1 ? PAL.skin : '#241c2c';
    c.fillRect(8, y0 + 6, 2, 2); c.fillRect(12, y0 + 6, 2, 2);
    // sweater
    c.fillStyle = PAL.sweater;
    c.fillRect(5, y0 + 10, 11, 12);
    c.fillStyle = PAL.sweaterD;
    c.fillRect(5, y0 + 20, 11, 2);
    // arms (swing when walking)
    const armSwing = walk ? [2, 0, -2, 0][wf] : 0;
    c.fillStyle = PAL.sweater;
    c.fillRect(3, y0 + 11 + armSwing, 3, 9);
    c.fillRect(15, y0 + 11 - armSwing, 3, 9);
    c.fillStyle = PAL.skin;
    c.fillRect(3, y0 + 20 + armSwing, 3, 3);
    c.fillRect(15, y0 + 20 - armSwing, 3, 3);
    // pants
    c.fillStyle = PAL.pants;
    c.fillRect(6, 22 + y0, 4, 14 - bob); c.fillRect(11, 22 + y0, 4, 14 - bob);
    if (walk) {
      c.clearRect(6, 30, 4, 8); c.clearRect(11, 30, 4, 8);
      c.fillRect(6 - legSpread, 28, 4, 10); c.fillRect(11 + legSpread, 28, 4, 10);
      c.fillStyle = PAL.shoe;
      c.fillRect(5 - legSpread, 38, 6, 3); c.fillRect(11 + legSpread, 38, 6, 3);
    } else {
      c.fillStyle = PAL.shoe;
      c.fillRect(5, 36, 6, 3); c.fillRect(11, 36, 6, 3);
    }
    frames.push(cv);
  }
  return frames;
}

// ------------------------------------------------------------- glow sprite
export function drawGlow(size = 64): HTMLCanvasElement {
  const [cv, c] = canvas(size, size);
  const g = c.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  return cv;
}
