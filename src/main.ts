import { Application, Container, Sprite, Texture, Graphics, TilingSprite } from 'pixi.js';
import { haptics } from './engine/haptics';
import { audio } from './engine/audio';
import { W, H, WALK_MIN_Y, WALK_MAX_Y, drawRoom, drawPlant, drawMoosh, drawZosia, drawGlow, PAL } from './game/art';
import { HOTSPOTS, PARSLEY, CUES, CHAT, END_LINE, HotspotDef } from './game/content';

// ----------------------------------------------------------------- helpers
const $ = (id: string) => document.getElementById(id)!;
const tex = (cv: HTMLCanvasElement) => { const t = Texture.from(cv); t.source.scaleMode = 'nearest'; return t; };

// ----------------------------------------------------------------- state
type Phase = 'explore' | 'wantPhoto' | 'approved' | 'settings' | 'confirm' | 'done';
const state = {
  phase: 'explore' as Phase,
  chatStage: 'hello' as 'hello' | 'post',
  hasParsley: false,
  garnished: false,
  photoFails: 0,
  examined: new Set<string>(),
  cuesShown: new Set<string>(),
  chatSeen: false,
  refunded: false,
};

// ----------------------------------------------------------------- boot
const app = new Application();
let viewW = W; // portrait crop width
let camX = 0, camTargetX = 0;
let sceneScale = 1;
const world = new Container();

let zosia: Sprite, plantSpr: Sprite, mooshSpr: Sprite;
let zosiaFrames: Texture[] = [];
let phoneGlow: Sprite, neonGlow: Sprite;
let rainG: Graphics;
let revealG: Graphics;

const Z = { x: 120, y: 190, tx: 120, ty: 190, walking: false, flip: false, frame: 0, ft: 0 };
let queuedAction: (() => void) | null = null;
let lastInput = performance.now();
let idleShown = false;

async function boot() {
  await app.init({ width: W, height: H, background: '#06050c', antialias: false, resolution: 1 });
  ($('sceneWrap') as HTMLElement).prepend(app.canvas);
  app.canvas.id = 'game';

  // --- static room
  world.addChild(new Sprite(tex(drawRoom())));

  // --- glows (additive-ish via alpha)
  const glowT = tex(drawGlow(64));
  neonGlow = new Sprite(glowT); neonGlow.tint = 0xff4f9e; neonGlow.alpha = 0.35;
  neonGlow.width = 90; neonGlow.height = 40; neonGlow.position.set(212 + 45 - 45, 42 - 20 + 0); neonGlow.x = 222; neonGlow.y = 26;
  world.addChild(neonGlow);
  phoneGlow = new Sprite(glowT); phoneGlow.tint = 0x9fd8ff; phoneGlow.alpha = 0.5;
  phoneGlow.width = 70; phoneGlow.height = 54; phoneGlow.position.set(231 - 35, 135 - 27);
  world.addChild(phoneGlow);

  // --- rain inside window
  rainG = new Graphics(); world.addChild(rainG);

  // --- plant & moosh
  plantSpr = new Sprite(tex(drawPlant(true))); plantSpr.position.set(290, 74); world.addChild(plantSpr);
  mooshSpr = new Sprite(tex(drawMoosh(false))); mooshSpr.anchor.set(0.5, 1); mooshSpr.position.set(196, 146); world.addChild(mooshSpr);

  // --- Zosia
  zosiaFrames = drawZosia().map(tex);
  zosia = new Sprite(zosiaFrames[0]); zosia.anchor.set(0.5, 1); zosia.position.set(Z.x, Z.y);
  world.addChild(zosia);

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
  const wrap = $('sceneWrap');
  // allow flex to settle
  requestAnimationFrame(() => {
    const rw = wrap.clientWidth, rh = wrap.clientHeight;
    if (portrait) {
      viewW = Math.max(140, Math.min(W, Math.round((rw / rh) * H)));
    } else {
      viewW = W;
    }
    app.renderer.resize(viewW, H);
    sceneScale = Math.min(rw / viewW, rh / H);
    const cw = Math.floor(viewW * sceneScale), ch = Math.floor(H * sceneScale);
    app.canvas.style.width = cw + 'px'; app.canvas.style.height = ch + 'px';
    clampCam();
  });
}
function clampCam() {
  camTargetX = Math.max(0, Math.min(W - viewW, camTargetX));
  camX = Math.max(0, Math.min(W - viewW, camX));
}
function focusCam(x: number) { camTargetX = x - viewW / 2; clampCam(); }

// ------------------------------------------------------------------ ticker
let t = 0;
function tick(ticker: { deltaMS: number }) {
  const dt = ticker.deltaMS / 1000; t += dt;

  // camera follows Zosia (or stays)
  focusCamSoft();
  camX += (camTargetX - camX) * Math.min(1, dt * 5);
  world.x = -Math.round(camX);

  // Zosia movement
  if (Z.walking) {
    const dx = Z.tx - Z.x, dy = Z.ty - Z.y;
    const dist = Math.hypot(dx, dy);
    const speed = 62;
    if (dist < 2.5) {
      Z.walking = false; Z.frame = 0;
      if (queuedAction) { const a = queuedAction; queuedAction = null; a(); }
    } else {
      Z.x += (dx / dist) * speed * dt; Z.y += (dy / dist) * speed * dt;
      Z.flip = dx < 0;
      Z.ft += dt;
      if (Z.ft > 0.12) { Z.ft = 0; Z.frame = (Z.frame + 1) % 4; }
      zosia.texture = zosiaFrames[2 + Z.frame];
    }
  } else {
    // idle blink
    zosia.texture = zosiaFrames[Math.floor(t * 0.8) % 7 === 3 ? 1 : 0];
  }
  zosia.position.set(Math.round(Z.x), Math.round(Z.y));
  zosia.scale.x = Z.flip ? -1 : 1;

  // moosh wobble (it settles. food settles.)
  mooshSpr.scale.y = 1 + Math.sin(t * 2.1) * 0.03;
  mooshSpr.scale.x = (1 - Math.sin(t * 2.1) * 0.02);

  // glows
  phoneGlow.alpha = 0.38 + Math.sin(t * 1.7) * 0.1;
  const flicker = Math.random() < 0.01 ? 0.1 : 0.35 + Math.sin(t * 0.9) * 0.08;
  neonGlow.alpha = flicker;

  // rain in window (212..304, 28..110)
  rainG.clear();
  for (let i = 0; i < 26; i++) {
    const seed = i * 37.3;
    const rx = 213 + ((seed * 13 + t * 60 * (0.7 + (i % 3) * 0.2)) % 90);
    const ry = 29 + ((seed * 7 + t * 130 * (0.8 + (i % 4) * 0.15)) % 80);
    rainG.moveTo(rx, ry).lineTo(rx - 1.5, ry + 5).stroke({ color: 0x8fb8d8, alpha: 0.35, width: 1 });
  }

  // idle narrator
  if (!idleShown && performance.now() - lastInput > 60000 && state.phase !== 'done') {
    idleShown = true; cue(CUES.idle);
  }
}
let camFocusMoosh = false;
function focusCamSoft() {
  if (camFocusMoosh) focusCam(196); else focusCam(Z.x);
}

// -------------------------------------------------------------------- input
function bindInput() {
  let downAt = 0, downX = 0, downY = 0, longFired = false, lpTimer: number | null = null;
  let lastTapTime = 0, lastTapHs: string | null = null;

  const toWorld = (e: PointerEvent) => {
    const r = app.canvas.getBoundingClientRect();
    return { x: camX + (e.clientX - r.left) / (r.width / viewW), y: (e.clientY - r.top) / (r.height / H) };
  };

  app.canvas.addEventListener('pointerdown', (e) => {
    lastInput = performance.now();
    downAt = performance.now(); longFired = false;
    const p = toWorld(e); downX = p.x; downY = p.y;
    lpTimer = window.setTimeout(() => {
      longFired = true;
      const hs = hitTest(downX, downY);
      if (hs) { haptics.play('tick'); examine(hs); } else { showReveal(); }
    }, 480);
  });
  app.canvas.addEventListener('pointerup', (e) => {
    if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
    if (longFired) return;
    if (performance.now() - downAt > 480) return;
    const p = toWorld(e);
    if (camMode) { camTap(p.x, p.y); return; }
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
  Z.tx = Math.max(12, Math.min(W - 12, x));
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
    const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
    if (cx < camX - 10 || cx > camX + viewW + 10) continue;
    revealG.moveTo(cx, cy - 5).lineTo(cx + 5, cy).lineTo(cx, cy + 5).lineTo(cx - 5, cy).closePath()
      .fill({ color: 0xffb64c, alpha: 0.9 });
    const s = worldToScreen(cx, cy);
    const chip = document.createElement('div');
    chip.textContent = h.label;
    chip.style.cssText = `position:fixed;left:${s.x}px;top:${s.y - 26}px;transform:translateX(-50%);
      background:rgba(13,10,24,.92);color:#e8ddc4;font:11px 'Courier New',monospace;padding:3px 7px;
      border:1px solid #3a2d5c;border-radius:6px;z-index:45;pointer-events:none;white-space:nowrap;`;
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
      label: c.t, danger: false,
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
  camFocusMoosh = true;
  haptics.play('tick');
}
function closeCam() {
  camMode = false; camFocusMoosh = false;
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
    transform:translateX(-50%);background:rgba(8,12,20,.92);color:${ok ? '#7dffa8' : (hs.id === 'moosh' ? '#ff8a9a' : '#cfe0ff')};
    font:12px 'Courier New',monospace;padding:5px 9px;border:1px solid ${ok ? '#2d7a45' : '#3b4368'};border-radius:6px;z-index:75;
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
  state.phase = 'approved'; state.refunded = true;
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
  // keep GRAVY reachable: tapping outside phone body closes it
  phoneEl.addEventListener('click', (e) => { if (e.target === phoneEl) closePhone(); });
}

boot();
