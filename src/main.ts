import { Application, Container, Sprite, Texture, Graphics } from 'pixi.js';
import { haptics } from './engine/haptics';
import { audio } from './engine/audio';
import {
  ROOMW, H, WALK_MIN_Y, WALK_MAX_Y, WIN, GLOW, applyTheme,
  drawRoom, drawCity, drawForeground, drawShaft, drawPlant, drawMoosh, drawZosia, drawGlow, drawGrain, PAL,
} from './game/art';

// theme must apply before any draw calls
const THEME = (new URLSearchParams(location.search).get('theme') || localStorage.getItem('bg-theme') || 'a').toLowerCase();
applyTheme(THEME);
const SCENE_SEL = (new URLSearchParams(location.search).get('scene') || localStorage.getItem('bg-scene') || 'moosh').toLowerCase();
import { HOTSPOTS, PARSLEY, CUES, CHAT, END_LINE, HotspotDef } from './game/content';

// ----------------------------------------------------------------- helpers
const $ = (id: string) => document.getElementById(id)!;
const tex = (cv: HTMLCanvasElement, smooth = false) => {
  const t = Texture.from(cv);
  t.source.scaleMode = smooth ? 'linear' : 'nearest';
  return t;
};

// ----------------------------------------------------------------- state
type Phase = 'explore' | 'wantPhoto' | 'approved' | 'settings' | 'confirm' | 'done';
const state = {
  phase: 'explore' as Phase,
  hasParsley: false,
  garnished: false,
  photoFails: 0,
  examined: new Set<string>(),
  cuesShown: new Set<string>(),
  chatSeen: false,
};

// ----------------------------------------------------------------- stage
const app = new Application();
let viewW = 384;               // world units visible
let sceneScale = 1;            // world → CSS px
let camX = 0, camTargetX = 0;
const world = new Container();

// parallax planes
let citySpr: Sprite, fgSpr: Sprite, shaftSpr: Sprite;
let zosia: Sprite, plantSpr: Sprite, mooshSpr: Sprite;
let zosiaFrames: Texture[] = [];
let phoneGlow: Sprite, lampGlow: Sprite, neonGlow: Sprite;
let rainG: Graphics, motesG: Graphics, revealG: Graphics;
let inkA: Sprite | null = null, inkB: Sprite | null = null;

const ZSCALE = 0.2; // 100×210 smooth frames → 20×42 world units
const Z = { x: 280, y: 190, tx: 280, ty: 190, walking: false, flip: false, frame: 0, ft: 0 };
let queuedAction: (() => void) | null = null;
let lastInput = performance.now();
let idleShown = false;
let camFollow: 'zosia' | 'moosh' | 'free' = 'zosia';

// dust motes in the sodium shaft
const MOTES = Array.from({ length: 14 }, (_, i) => ({
  x: 385 + (i * 37) % 130, y: 115 + (i * 53) % 90, v: 2.5 + (i % 4), ph: i * 0.7,
}));

async function boot() {
  await app.init({
    width: viewW, height: H, background: '#070905', antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 3), autoDensity: true,
  });
  ($('sceneWrap') as HTMLElement).prepend(app.canvas);
  app.canvas.id = 'game';

  citySpr = new Sprite(tex(drawCity()));
  world.addChild(citySpr);
  const roomT = tex(drawRoom());
  world.addChild(new Sprite(roomT));
  if (PAL.print) {
    // misregistered ink plates: the print is alive under the loupe
    inkA = new Sprite(roomT); inkA.tint = 0xff6a3d; inkA.alpha = 0.16; inkA.blendMode = 'add'; inkA.position.set(-1, 0);
    inkB = new Sprite(roomT); inkB.tint = 0x3d9dbf; inkB.alpha = 0.14; inkB.blendMode = 'add'; inkB.position.set(1, 1);
    world.addChild(inkA); world.addChild(inkB);
  }

  const glowT = tex(drawGlow(64), true);
  lampGlow = new Sprite(glowT); lampGlow.tint = GLOW.lamp; lampGlow.alpha = GLOW.lampA;
  lampGlow.blendMode = 'add';
  lampGlow.width = 190; lampGlow.height = 140;
  lampGlow.position.set(WIN.x + WIN.w / 2 - 95, WIN.y + WIN.h / 2 - 62);
  world.addChild(lampGlow);

  neonGlow = new Sprite(glowT); neonGlow.tint = GLOW.neon; neonGlow.alpha = GLOW.neonA;
  neonGlow.blendMode = 'add';
  neonGlow.width = 84; neonGlow.height = 40;
  world.addChild(neonGlow);

  shaftSpr = new Sprite(tex(drawShaft()));
  shaftSpr.position.set(WIN.x - 60, WIN.y + WIN.h - 6);
  world.addChild(shaftSpr);

  phoneGlow = new Sprite(glowT); phoneGlow.tint = GLOW.phone; phoneGlow.alpha = GLOW.phoneA;
  phoneGlow.blendMode = 'add';
  phoneGlow.width = 88; phoneGlow.height = 68;
  phoneGlow.position.set(393 - 44, 133 - 34);
  world.addChild(phoneGlow);

  rainG = new Graphics(); world.addChild(rainG);
  motesG = new Graphics(); world.addChild(motesG);

  plantSpr = new Sprite(tex(drawPlant(true))); plantSpr.position.set(506, 83); world.addChild(plantSpr);
  mooshSpr = new Sprite(tex(drawMoosh(false))); mooshSpr.anchor.set(0.5, 1); mooshSpr.position.set(352, 144); world.addChild(mooshSpr);

  zosiaFrames = drawZosia().map(c => tex(c, true));
  zosia = new Sprite(zosiaFrames[0]); zosia.anchor.set(0.5, 1);
  zosia.scale.set(ZSCALE); zosia.position.set(Z.x, Z.y);
  world.addChild(zosia);

  fgSpr = new Sprite(tex(drawForeground())); world.addChild(fgSpr);
  if (PAL.print) {
    const grain = new Sprite(tex(drawGrain(ROOMW, H)));
    grain.alpha = 0.8;
    world.addChild(grain);
  }
  revealG = new Graphics(); world.addChild(revealG);

  app.stage.addChild(world);
  app.ticker.add(tick);

  layout();
  window.addEventListener('resize', layout);
  bindInput();
  bindUI();
}

// ------------------------------------------------------------- layout/camera
function layout() {
  const portrait = innerHeight > innerWidth;
  document.body.classList.toggle('portrait', portrait);
  document.body.classList.toggle('landscape', !portrait);
  requestAnimationFrame(() => {
    const wrap = $('sceneWrap');
    const rw = wrap.clientWidth, rh = wrap.clientHeight;
    viewW = portrait ? Math.max(120, Math.min(ROOMW, Math.round((rw / rh) * H))) : 384;
    sceneScale = Math.min(rw / viewW, rh / H);
    app.renderer.resize(Math.floor(viewW * sceneScale), Math.floor(H * sceneScale));
    world.scale.set(sceneScale);
    clampCam();
  });
}
function clampCam() {
  camTargetX = Math.max(0, Math.min(ROOMW - viewW, camTargetX));
  camX = Math.max(0, Math.min(ROOMW - viewW, camX));
}
function focusCam(x: number) { camTargetX = x - viewW / 2; clampCam(); }

// ------------------------------------------------------------------ ticker
let t = 0;
function tick(ticker: { deltaMS: number }) {
  const dt = ticker.deltaMS / 1000; t += dt;

  if (camFollow === 'moosh') focusCam(352);
  else if (camFollow === 'zosia') focusCam(Z.x);
  camX += (camTargetX - camX) * Math.min(1, dt * 5);

  // parallax: city drags behind (0.85), room 1.0, foreground leads (1.18)
  const cx = Math.round(camX);
  world.x = -Math.round(camX * sceneScale);
  citySpr.position.set(WIN.x - 30 + cx * 0.15, WIN.y - 8);
  fgSpr.x = -cx * 0.18;

  // Zosia
  if (Z.walking) {
    const dx = Z.tx - Z.x, dy = Z.ty - Z.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2.5) {
      Z.walking = false; Z.frame = 0;
      if (queuedAction) { const a = queuedAction; queuedAction = null; a(); }
    } else {
      const speed = 66;
      Z.x += (dx / dist) * speed * dt; Z.y += (dy / dist) * speed * dt;
      Z.flip = dx < 0;
      Z.ft += dt;
      if (Z.ft > 0.13) { Z.ft = 0; Z.frame = (Z.frame + 1) % 4; }
      zosia.texture = zosiaFrames[2 + Z.frame];
    }
  } else {
    zosia.texture = zosiaFrames[Math.floor(t * 0.8) % 7 === 3 ? 1 : 0];
  }
  zosia.position.set(Z.x, Z.y);
  zosia.scale.x = Z.flip ? -ZSCALE : ZSCALE;
  zosia.scale.y = ZSCALE;

  // moosh settles. food settles. this is food. this is fine.
  mooshSpr.scale.y = 1 + Math.sin(t * 2.1) * 0.03;
  mooshSpr.scale.x = 1 - Math.sin(t * 2.1) * 0.02;

  if (inkA && inkB) {
    inkA.position.set(-1 + Math.sin(t * 0.43) * 0.6, Math.cos(t * 0.31) * 0.4);
    inkB.position.set(1 + Math.sin(t * 0.37 + 2) * 0.6, 1 + Math.cos(t * 0.29 + 1) * 0.4);
  }
  phoneGlow.alpha = GLOW.phoneA - 0.1 + Math.sin(t * 1.7) * 0.1;
  lampGlow.alpha = Math.random() < 0.006 ? GLOW.lampA * 0.5 : GLOW.lampA + Math.sin(t * 0.7) * 0.05; // lamp hum
  neonGlow.position.set(WIN.x - 30 + cx * 0.15 + 24, WIN.y + 4);
  neonGlow.alpha = Math.random() < 0.012 ? GLOW.neonA * 0.35 : GLOW.neonA + Math.sin(t * 2.3) * 0.07; // dying neon

  // rain behind the glass
  rainG.clear();
  for (let i = 0; i < 24; i++) {
    const seed = i * 41.3;
    const rx = WIN.x + 2 + ((seed * 13 + t * 55 * (0.7 + (i % 3) * 0.2)) % (WIN.w - 4));
    const ry = WIN.y + 2 + ((seed * 7 + t * 120 * (0.8 + (i % 4) * 0.15)) % (WIN.h - 6));
    rainG.moveTo(rx, ry).lineTo(rx - 1.5, ry + 5).stroke({ color: GLOW.rain, alpha: 0.3, width: 1 });
  }

  // dust motes rising through the shaft
  motesG.clear();
  for (const m of MOTES) {
    const my = 205 - ((m.y + t * m.v) % 92);
    const mx = m.x + Math.sin(t * 0.6 + m.ph) * 3 - (205 - my) * 0.35;
    const a = 0.12 + 0.1 * Math.sin(t * 1.3 + m.ph);
    motesG.rect(mx, my, 1, 1).fill({ color: GLOW.mote, alpha: Math.max(0.04, a) });
  }

  if (!idleShown && performance.now() - lastInput > 60000 && state.phase !== 'done') {
    idleShown = true; cue(CUES.idle);
  }
}

// -------------------------------------------------------------------- input
function bindInput() {
  let downAt = 0, downX = 0, downY = 0, longFired = false, lpTimer: number | null = null;
  let lastTapTime = 0, lastTapHs: string | null = null;
  let isDown = false, downClientX = 0, panBase = 0, camDragging = false;

  const toWorld = (e: PointerEvent) => {
    const r = app.canvas.getBoundingClientRect();
    return { x: camX + (e.clientX - r.left) / (r.width / viewW), y: (e.clientY - r.top) / (r.height / H) };
  };

  app.canvas.addEventListener('pointerdown', (e) => {
    lastInput = performance.now();
    downAt = performance.now(); longFired = false;
    isDown = true; downClientX = e.clientX; panBase = camTargetX; camDragging = false;
    const p = toWorld(e); downX = p.x; downY = p.y;
    if (camMode) return; // in drone-cam: drag pans, tap classifies — no long-press
    lpTimer = window.setTimeout(() => {
      longFired = true;
      const hs = hitTest(downX, downY);
      if (hs) { haptics.play('tick'); examine(hs); } else { showReveal(); }
    }, 480);
  });
  app.canvas.addEventListener('pointerup', (e) => {
    isDown = false;
    if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
    if (longFired) return;
    if (camMode) {
      if (!camDragging) { const p = toWorld(e); camTap(p.x, p.y); }
      camDragging = false;
      return;
    }
    if (performance.now() - downAt > 480) return;
    const p = toWorld(e);
    const hs = hitTest(p.x, p.y);
    const now = performance.now();
    const doubleTap = !!hs && lastTapHs === hs.id && now - lastTapTime < 350;
    lastTapTime = now; lastTapHs = hs?.id ?? null;
    if (hs && hs.id !== 'floor') {
      haptics.play('tick'); audio.sfx('blip');
      walkTo(hs.walkX, Math.max(WALK_MIN_Y, Math.min(WALK_MAX_Y, p.y)), () => interact(hs), doubleTap);
    } else {
      walkTo(p.x, Math.max(WALK_MIN_Y, Math.min(WALK_MAX_Y, p.y)), null, doubleTap);
    }
  });
  app.canvas.addEventListener('pointermove', (e) => {
    if (camMode && isDown) {
      const r = app.canvas.getBoundingClientRect();
      const dxWorld = (e.clientX - downClientX) / (r.width / viewW);
      if (Math.abs(dxWorld) > 4) {
        camDragging = true;
        camFollow = 'free';                       // free look while framing the shot
        camTargetX = panBase - dxWorld;
        clampCam();
        camChip?.remove(); camChip = null;         // stale label would mislead the shutter
        camFocusId = null;
      }
      return;
    }
    const p = toWorld(e);
    if (Math.hypot(p.x - downX, p.y - downY) > 6 && lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
  });
}

function hitTest(x: number, y: number): HotspotDef | null {
  let best: HotspotDef | null = null, bestArea = Infinity;
  for (const h of HOTSPOTS) {
    if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
      const a = h.w * h.h;
      if (a < bestArea) { best = h; bestArea = a; }
    }
  }
  return best;
}

function walkTo(x: number, y: number, then: (() => void) | null, instant = false) {
  Z.tx = Math.max(14, Math.min(ROOMW - 14, x));
  Z.ty = Math.max(WALK_MIN_Y, Math.min(WALK_MAX_Y, y));
  queuedAction = then;
  if (instant) { // double-tap: walking is never waiting (DESIGN.md §3.5)
    Z.x = Z.tx; Z.y = Z.ty; Z.walking = false;
    if (queuedAction) { const a = queuedAction; queuedAction = null; a(); }
    return;
  }
  Z.walking = true;
}

// -------------------------------------------------------- captions/narrator
let capTimer: number | null = null;
function showCap(text: string, who: string | null, inner = false, ms = 4600) {
  for (const id of ['capBox', 'capBoxP']) {
    const el = $(id);
    el.innerHTML = (who ? `<span class="who">${who}</span>` : '') + text;
    el.classList.toggle('inner', inner);
    el.classList.add('show');
  }
  if (capTimer) clearTimeout(capTimer);
  capTimer = window.setTimeout(() => {
    $('capBox').classList.remove('show'); $('capBoxP').classList.remove('show');
  }, ms);
}
function cue(c: { id: string; who: string; text: string }) {
  if (state.cuesShown.has(c.id)) return;
  state.cuesShown.add(c.id);
  showCap(c.text, c.who, false, 5200);
}

// ------------------------------------------------------------- interactions
function examine(hs: HotspotDef) {
  const second = state.examined.has(hs.id) && hs.examine2;
  state.examined.add(hs.id);
  let line = second ? hs.examine2! : hs.examine;
  if (hs.id === 'moosh') {
    if (state.garnished) line = PARSLEY.mooshGarnishedExamine;
    if (!state.cuesShown.has(CUES.mooshFirstLook.id)) {
      showCap(line, 'zosia', true);
      window.setTimeout(() => cue(CUES.mooshFirstLook), 5000);
      return;
    }
  }
  showCap(line, 'zosia', true);
}

function interact(hs: HotspotDef) {
  switch (hs.id) {
    case 'phone': openPhone(); return;
    case 'plant':
      if (!state.hasParsley) {
        state.hasParsley = true;
        plantSpr.texture = tex(drawPlant(false));
        $('chipParsley').classList.add('show');
        haptics.play('pickup'); audio.sfx('pickup');
        showCap(PARSLEY.pickupLine, 'zosia', true);
      } else examine(hs);
      return;
    case 'moosh':
      if (state.hasParsley && !state.garnished) {
        state.garnished = true;
        $('chipParsley').classList.remove('show');
        mooshSpr.texture = tex(drawMoosh(true));
        haptics.play('squelch'); audio.sfx('garnish');
        showCap(PARSLEY.garnishLine, 'zosia', true);
      } else {
        haptics.play('squelch');
        examine(hs);
      }
      return;
    default: examine(hs);
  }
}

// ------------------------------------------------------------ reveal markers
let chipEls: HTMLElement[] = [];
function worldToScreen(wx: number, wy: number) {
  const r = app.canvas.getBoundingClientRect();
  return { x: r.left + (wx - camX) * (r.width / viewW), y: r.top + wy * (r.height / H) };
}
function showReveal() {
  haptics.play('tick'); audio.sfx('reveal');
  revealG.clear();
  clearChips();
  for (const h of HOTSPOTS) {
    if (h.id === 'floor') continue;
    const cx2 = h.x + h.w / 2, cy = h.y + h.h / 2;
    if (cx2 < camX - 10 || cx2 > camX + viewW + 10) continue;
    revealG.moveTo(cx2, cy - 5).lineTo(cx2 + 5, cy).lineTo(cx2, cy + 5).lineTo(cx2 - 5, cy).closePath()
      .fill({ color: 0xffb14a, alpha: 0.9 });
    const s = worldToScreen(cx2, cy);
    const chip = document.createElement('div');
    chip.textContent = h.label;
    chip.style.cssText = `position:fixed;left:${s.x}px;top:${s.y - 26}px;transform:translateX(-50%);
      background:rgba(10,12,6,.92);color:#e8d9b0;font:11px 'Courier New',monospace;padding:3px 7px;
      border:1px solid #4a3a20;border-radius:6px;z-index:45;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(chip); chipEls.push(chip);
  }
  window.setTimeout(() => { revealG.clear(); clearChips(); }, 2200);
}
function clearChips() { chipEls.forEach(c => c.remove()); chipEls = []; }

// -------------------------------------------------------------- phone / chat
const phoneEl = $('phone'), chatEl = $('chat'), choicesEl = $('choices');
function openPhone() {
  phoneEl.classList.add('show');
  audio.holdMusic(true);
  haptics.play('tick');
  if (!state.chatSeen) {
    state.chatSeen = true;
    chatEl.innerHTML = '';
    sys('tonight · 02:07');
    bot(CHAT.hello[0]);
    setChoices(CHAT.helloChoices.map(c => ({
      label: c.t,
      fn: () => { me(c.t); if (c.r) { botDelayed(c.r); } else advanceToPhoto(); },
    })));
  }
}
function closePhone() { phoneEl.classList.remove('show'); audio.holdMusic(false); }

function bot(text: string) {
  const d = document.createElement('div'); d.className = 'msg bot';
  d.innerHTML = `<span class="tag">${CHAT.botTag}</span>` + text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight;
}
function botDelayed(text: string, ms = 600) {
  const d = document.createElement('div'); d.className = 'msg sys'; d.textContent = 'GRAVY is typing…';
  chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight;
  window.setTimeout(() => { d.remove(); bot(text); haptics.play('tick'); }, ms);
}
function me(text: string) {
  const d = document.createElement('div'); d.className = 'msg me'; d.textContent = text;
  chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight;
}
function sys(text: string) {
  const d = document.createElement('div'); d.className = 'msg sys'; d.textContent = text;
  chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight;
}
function setChoices(list: { label: string; danger?: boolean; fn: () => void }[]) {
  choicesEl.innerHTML = '';
  for (const c of list) {
    const b = document.createElement('button');
    b.className = 'choice' + (c.danger ? ' danger' : '');
    b.textContent = c.label;
    b.onclick = () => { audio.sfx('blip'); c.fn(); };
    choicesEl.appendChild(b);
  }
}

function advanceToPhoto() {
  state.phase = 'wantPhoto';
  botDelayed(CHAT.wantPhoto, 700);
  setChoices([{ label: 'Open drone-cam 📸', fn: () => { closePhone(); openCam(); } }]);
}

// ------------------------------------------------------------------ camera
let camMode = false;
let camFocusId: string | null = null;
let camChip: HTMLElement | null = null;
function openCam() {
  camMode = true; camFocusId = null;
  $('cam').classList.add('show');
  document.body.classList.add('cammode');
  camFollow = 'moosh';
  haptics.play('tick');
}
function closeCam() {
  camMode = false; camFollow = 'zosia';
  $('cam').classList.remove('show');
  document.body.classList.remove('cammode');
  camChip?.remove(); camChip = null;
}
function camTap(x: number, y: number) {
  const hs = hitTest(x, y);
  camChip?.remove(); camChip = null;
  if (!hs) { camFocusId = null; return; }
  camFocusId = hs.id;
  haptics.play('tick'); audio.sfx('blip');
  const label = (hs.id === 'moosh' && state.garnished) ? PARSLEY.mooshGarnishedCam : hs.camLabel;
  const ok = hs.id === 'moosh' && state.garnished;
  const s = worldToScreen(hs.x + hs.w / 2, hs.y);
  camChip = document.createElement('div');
  camChip.textContent = '⌖ ' + label;
  camChip.style.cssText = `position:fixed;left:${Math.max(80, Math.min(innerWidth - 80, s.x))}px;top:${Math.max(50, s.y - 30)}px;
    transform:translateX(-50%);background:rgba(8,10,5,.92);color:${ok ? '#a4c85e' : (hs.id === 'moosh' ? '#ff8a5e' : '#e8d9b0')};
    font:12px 'Courier New',monospace;padding:5px 9px;border:1px solid ${ok ? '#4a6a2e' : '#4a3a20'};border-radius:6px;z-index:75;
    pointer-events:none;white-space:nowrap;max-width:86vw;`;
  document.body.appendChild(camChip);
}
function shutter() {
  if (!camMode) return;
  haptics.play('shutter'); audio.sfx('shutter');
  const id = camFocusId;
  closeCam();
  openPhoneBare();
  if (id === 'moosh') {
    if (state.garnished) return approve();
    state.photoFails++;
    audio.sfx('reject'); haptics.play('error');
    const line = CHAT.failLines[Math.min(state.photoFails - 1, CHAT.failLines.length - 1)];
    me('[photo of the item]'); botDelayed(line, 800);
    if (state.photoFails === 4) window.setTimeout(() => { closePhone(); cue(CUES.nudge); }, 3400);
    setChoices([
      { label: 'Try another photo 📸', fn: () => { closePhone(); openCam(); } },
      { label: 'Put the phone down', fn: () => closePhone() },
    ]);
  } else {
    const hs = HOTSPOTS.find(h => h.id === id);
    me('[photo]');
    botDelayed(CHAT.notFood(hs ? hs.camLabel : ''), 700);
    setChoices([
      { label: 'Try again 📸', fn: () => { closePhone(); openCam(); } },
      { label: 'Put the phone down', fn: () => closePhone() },
    ]);
  }
}
function openPhoneBare() { phoneEl.classList.add('show'); audio.holdMusic(true); }

// ----------------------------------------------------------- refund + endgame
function approve() {
  state.phase = 'approved';
  audio.sfx('refund'); haptics.play('success');
  me('[photo of one (1) plated entrée]');
  botDelayed(CHAT.approved, 900);
  setChoices(CHAT.approvedChoices.map(c => ({
    label: c.t,
    fn: () => { me(c.t); if (c.r) botDelayed(c.r); else settings(); },
  })));
}
function settings() {
  state.phase = 'settings';
  botDelayed(CHAT.settings, 500);
  setChoices(CHAT.settingsChoices.map(c => ({
    label: c.t, danger: c.t.startsWith('TERMINATE'),
    fn: () => { me(c.t); if (c.r) botDelayed(c.r); else confirmEnd(); },
  })));
}
function confirmEnd() {
  state.phase = 'confirm';
  botDelayed(CHAT.confirm, 700);
  setChoices(CHAT.confirmChoices.map(c => ({
    label: c.t, danger: c.t.startsWith('TERMINATE'),
    fn: () => { me(c.t); if (c.r) botDelayed(c.r); else holdToEnd(); },
  })));
}
function holdToEnd() {
  botDelayed(CHAT.holdToEnd, 600);
  choicesEl.innerHTML = '';
  const b = document.createElement('button');
  b.className = 'choice danger';
  b.style.cssText = 'text-align:center;font-weight:bold;letter-spacing:1px;padding:16px;';
  b.textContent = 'HOLD TO TERMINATE';
  let hold: number | null = null, prog = 0;
  const start = (ev: Event) => {
    ev.preventDefault();
    prog = 0;
    hold = window.setInterval(() => {
      prog += 90;
      haptics.play('tick');
      b.textContent = 'HOLDING ' + '▓'.repeat(Math.ceil(prog / 130)) + '░'.repeat(Math.max(0, 7 - Math.ceil(prog / 130)));
      if (prog >= 900) { if (hold) clearInterval(hold); terminate(); }
    }, 90);
  };
  const stop = () => { if (hold) { clearInterval(hold); hold = null; b.textContent = 'HOLD TO TERMINATE'; } };
  b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop);
  choicesEl.appendChild(b);
}
function terminate() {
  state.phase = 'done';
  haptics.play('terminate'); audio.sfx('terminate');
  closePhone();
  const end = $('endPage');
  end.style.display = 'flex';
  const big = $('counterBig'); big.textContent = '0';
  window.setTimeout(() => { big.textContent = '1'; haptics.play('impact'); }, 900);
  window.setTimeout(() => {
    $('endLine').innerHTML = `<i>“${CUES.terminate.text}”</i><br/><br/>` + END_LINE;
  }, 1800);
}

// ---------------------------------------------------------------------- UI
function bindUI() {
  document.querySelectorAll('.themeBtn').forEach((b) => {
    const el = b as HTMLElement;
    if (el.dataset.theme === THEME) el.classList.add('sel');
    el.addEventListener('click', () => {
      if (el.dataset.theme === THEME) return;
      localStorage.setItem('bg-theme', el.dataset.theme!);
      const u = new URL(location.href); u.searchParams.delete('theme');
      location.href = u.toString();
    });
  });
  $('btnStart').addEventListener('click', () => {
    audio.unlock(); audio.sfx('page'); haptics.play('page');
    $('startPage').style.display = 'none';
    window.setTimeout(() => cue(CUES.entry), 700);
  });
  $('btnAgain').addEventListener('click', () => location.reload());
  $('btnReveal').addEventListener('click', () => { lastInput = performance.now(); showReveal(); });
  $('btnPhone').addEventListener('click', () => {
    lastInput = performance.now();
    if (state.phase === 'done') return;
    if (phoneEl.classList.contains('show')) closePhone();
    else walkTo(HOTSPOTS.find(h => h.id === 'phone')!.walkX, 190, () => openPhone(), true);
  });
  $('shutter').addEventListener('click', shutter);
  $('camClose').addEventListener('click', () => { closeCam(); openPhoneBare(); });
  phoneEl.addEventListener('click', (e) => { if (e.target === phoneEl) closePhone(); });
  $('phoneClose').addEventListener('click', () => closePhone());
}

// ---- scene routing: 'moosh' = the styled hand-built slice; anything else
// boots the GLITCHKIT blockout renderer with that scene's JSON (ENGINE.md).
if (SCENE_SEL === 'moosh') {
  boot();
  (window as any).__bg = { view: () => ({ camX, viewW }) };
} else {
  import('./kit/blockout').then(async ({ bootBlockout }) => {
    const data = (await import(`./game/scenes/${SCENE_SEL}.json`)).default;
    bootBlockout(data);
  }).catch(() => { localStorage.removeItem('bg-scene'); location.reload(); });
}

// scene picker on the start page (styled slice + blockout playtests)
const SCENE_LIST: [string, string][] = [
  ['moosh', 'The Moosh · styled'],
  ['mushroom', '▦ The Mushroom'],
  ['ticket', '▦ The Ticket'],
  ['date', '▦ The Date'],
  ['ghost', '▦ The Ghost'],
];
const pick = document.getElementById('btnBlockout');
if (pick) {
  pick.style.display = 'none';
  const row = document.createElement('div');
  row.id = 'scenePick';
  row.style.cssText = 'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:90vw;';
  for (const [id, label] of SCENE_LIST) {
    const b2 = document.createElement('button');
    b2.className = 'themeBtn' + (id === SCENE_SEL ? ' sel' : '');
    b2.textContent = label;
    b2.addEventListener('click', () => {
      if (id === SCENE_SEL) return;
      if (id === 'moosh') localStorage.removeItem('bg-scene');
      else localStorage.setItem('bg-scene', id);
      const u = new URL(location.href); u.searchParams.delete('scene');
      location.href = u.toString();
    });
    row.appendChild(b2);
  }
  pick.parentElement!.insertBefore(row, pick);
}
