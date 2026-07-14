// Styled renderer — the sibling of blockout.ts. It consumes the SAME scene
// JSON + Interp + Shell as the grey-box playtest, so all the logic (examine,
// use, the dialog funnel, flags, the puzzle, the end op) is already proven —
// but instead of drawing labelled rectangles it paints a full sodium/amber
// room from a StyledPack (art + light + atmosphere) and animates a smooth-
// mixel character over parallax planes. This is how every scene after the
// Moosh reaches hero fidelity without re-implementing the runtime.

import { Application, Container, Sprite, Texture, Graphics } from 'pixi.js';
import { haptics } from '../engine/haptics';
import { audio } from '../engine/audio';
import { Interp, Scene, Shell, Block } from './kit';

const $ = (id: string) => document.getElementById(id)!;
const tex = (cv: HTMLCanvasElement, smooth = false) => {
  const t = Texture.from(cv); t.source.scaleMode = smooth ? 'linear' : 'nearest'; return t;
};

export interface MontageBeat { at: number; time: string; title: string; line: string }
export interface MontageSpec {
  label: string;
  firstPress: { at: number; time: string };  // THIS victim's count + moment
  introLine: string;                 // shown under the first press (HTML ok)
  beats: MontageBeat[];
  land: { at: number; time: string; line: string };
  nextHTML: string;                  // NEXT teaser card
}

export interface StyledPack {
  roomW: number; H: number; floorY: number; walkMinY: number; walkMaxY: number;
  bg(): HTMLCanvasElement;
  far?: { canvas(): HTMLCanvasElement; x: number; y: number; parallax: number };
  fg?: { canvas(): HTMLCanvasElement; parallax: number };
  fireShaft?: { canvas(): HTMLCanvasElement; x: number; y: number };
  actor: { frames(): HTMLCanvasElement[]; scale: number; anchor?: [number, number] };
  critters?: Array<{ id: string; frames(): HTMLCanvasElement[]; x: number; y: number; fps: number; anchor?: [number, number] }>;
  glows: Array<{ tint: number; alpha: number; x: number; y: number; w: number; h: number; flicker?: 'fire' | 'phone' | 'moon' | 'none' }>;
  motes?: { x: number; y: number; w: number; h: number; count: number; tint: number };
  steam?: Array<{ x: number; y: number; tint?: number }>;
  phoneLabel?: string;               // start-page sub line
  montage: MontageSpec;
}

const GLOW_TEX_SIZE = 64;
function glowCanvas(): HTMLCanvasElement {
  const cv = document.createElement('canvas'); cv.width = GLOW_TEX_SIZE; cv.height = GLOW_TEX_SIZE;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.4, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  return cv;
}

export async function bootStyled(scene: Scene, pack: StyledPack) {
  const H = pack.H, ROOMW = pack.roomW;
  const app = new Application();
  let viewW = 384, sceneScale = 1, camX = 0, camTargetX = 0;
  let camFollow: 'actor' | 'free' = 'actor';

  await app.init({
    width: viewW, height: H, background: '#050403', antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 3), autoDensity: true,
  });
  ($('sceneWrap') as HTMLElement).prepend(app.canvas);
  app.canvas.id = 'game';

  const world = new Container();

  // ---- parallax: far (through the window) < room < foreground
  let farSpr: Sprite | null = null;
  if (pack.far) { farSpr = new Sprite(tex(pack.far.canvas())); world.addChild(farSpr); }
  world.addChild(new Sprite(tex(pack.bg())));

  const glowT = tex(glowCanvas(), true);
  if (pack.fireShaft) {
    const s = new Sprite(tex(pack.fireShaft.canvas())); s.position.set(pack.fireShaft.x, pack.fireShaft.y);
    s.blendMode = 'add'; world.addChild(s);
  }
  const glowSprites = pack.glows.map(g => {
    const s = new Sprite(glowT); s.tint = g.tint; s.alpha = g.alpha; s.blendMode = 'add';
    s.width = g.w; s.height = g.h; s.position.set(g.x, g.y);
    world.addChild(s); return { s, def: g, base: g.alpha };
  });

  const steamG = new Graphics(); world.addChild(steamG);
  const motesG = new Graphics(); world.addChild(motesG);

  // ---- critters (e.g. Barnaby) drawn between room and actor
  const critters = (pack.critters ?? []).map(cr => {
    const frames = cr.frames().map(f => tex(f, true));
    const s = new Sprite(frames[0]); const [ax, ay] = cr.anchor ?? [0.5, 1];
    s.anchor.set(ax, ay); s.position.set(cr.x, cr.y);
    world.addChild(s); return { s, frames, fps: cr.fps, t: 0, frame: 0 };
  });

  // ---- actor (smooth mixel): [0]=idle [1]=idle-blink [2..5]=side-walk
  const actorFrames = pack.actor.frames().map(f => tex(f, true));
  const [aax, aay] = pack.actor.anchor ?? [0.5, 1];
  const actor = new Sprite(actorFrames[0]); actor.anchor.set(aax, aay);
  const ASCALE = pack.actor.scale;
  const A = { x: scene.actor.start[0], y: scene.actor.start[1], tx: 0, ty: 0, walking: false, flip: false, frame: 0, ft: 0 };
  A.tx = A.x; A.ty = A.y;
  actor.scale.set(ASCALE); actor.position.set(A.x, A.y);
  world.addChild(actor);

  let fgSpr: Sprite | null = null;
  if (pack.fg) { fgSpr = new Sprite(tex(pack.fg.canvas())); world.addChild(fgSpr); }

  const revealG = new Graphics(); world.addChild(revealG);
  app.stage.addChild(world);

  // ------------------------------------------------------------- layout / camera
  function layout() {
    const portrait = innerHeight > innerWidth;
    document.body.classList.toggle('portrait', portrait);
    document.body.classList.toggle('landscape', !portrait);
    requestAnimationFrame(() => {
      const wrap = $('sceneWrap');
      const rw = wrap.clientWidth, rh = wrap.clientHeight;
      viewW = portrait ? Math.max(120, Math.min(ROOMW, Math.round((rw / rh) * H))) : Math.min(384, ROOMW);
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
  layout();
  window.addEventListener('resize', layout);

  // ------------------------------------------------------------------- ticker
  const MOTES = pack.motes ? Array.from({ length: pack.motes.count }, (_, i) => ({
    x: (i * 37) % pack.motes!.w, y: (i * 53) % pack.motes!.h, v: 2 + (i % 4), ph: i * 0.7,
  })) : [];
  let t = 0;
  app.ticker.add((tk) => {
    const dt = tk.deltaMS / 1000; t += dt;
    if (camFollow === 'actor') { camTargetX = A.x - viewW / 2; clampCam(); }
    camX += (camTargetX - camX) * Math.min(1, dt * 5);
    const cx = Math.round(camX);
    world.x = -Math.round(camX * sceneScale);
    if (farSpr && pack.far) farSpr.position.set(pack.far.x + cx * (1 - pack.far.parallax), pack.far.y);
    if (fgSpr && pack.fg) fgSpr.x = -cx * (pack.fg.parallax - 1);

    // actor walk state machine
    if (A.walking) {
      const dx = A.tx - A.x, dy = A.ty - A.y, d = Math.hypot(dx, dy);
      if (d < 2.5) { A.walking = false; A.frame = 0; if (queued) { const q = queued; queued = null; q(); } }
      else {
        A.x += (dx / d) * 66 * dt; A.y += (dy / d) * 66 * dt;
        A.flip = dx < 0; A.ft += dt;
        if (A.ft > 0.13) { A.ft = 0; A.frame = (A.frame + 1) % 4; }
        actor.texture = actorFrames[2 + A.frame];
      }
    } else {
      actor.texture = actorFrames[Math.floor(t * 0.8) % 7 === 3 ? 1 : 0];
      A.flip = false;
    }
    actor.position.set(Math.round(A.x), Math.round(A.y));
    actor.scale.x = A.flip ? -ASCALE : ASCALE; actor.scale.y = ASCALE;

    for (const cr of critters) {
      cr.t += dt; if (cr.t > 1 / cr.fps) { cr.t = 0; cr.frame = (cr.frame + 1) % cr.frames.length; cr.s.texture = cr.frames[cr.frame]; }
    }

    // glows: fire flickers hot, the phone breathes, the moon is steady-cold
    for (const g of glowSprites) {
      if (g.def.flicker === 'fire') g.s.alpha = Math.random() < 0.04 ? g.base * 0.55 : g.base + Math.sin(t * 5.5) * 0.06 + Math.sin(t * 13) * 0.03;
      else if (g.def.flicker === 'phone') g.s.alpha = g.base - 0.1 + Math.sin(t * 1.7) * 0.1;
      else if (g.def.flicker === 'moon') g.s.alpha = g.base + Math.sin(t * 0.4) * 0.03;
    }

    // steam curling off the pan / kettle
    steamG.clear();
    for (const sp of pack.steam ?? []) {
      for (let i = 0; i < 5; i++) {
        const life = (t * 0.5 + i * 0.2) % 1;
        const sy = sp.y - life * 26;
        const sx = sp.x + Math.sin(t * 1.4 + i) * 4 * life;
        const a = 0.18 * (1 - life);
        steamG.rect(sx | 0, sy | 0, 1 + (i % 2), 1 + (i % 2)).fill({ color: sp.tint ?? 0xd8cbb0, alpha: Math.max(0, a) });
      }
    }

    // dust motes in the moonlight
    motesG.clear();
    if (pack.motes) {
      const m0 = pack.motes;
      for (const m of MOTES) {
        const my = m0.y + m0.h - ((m.y + t * m.v) % m0.h);
        const mx = m0.x + m.x + Math.sin(t * 0.6 + m.ph) * 3;
        const a = 0.1 + 0.08 * Math.sin(t * 1.3 + m.ph);
        motesG.rect(mx | 0, my | 0, 1, 1).fill({ color: m0.tint, alpha: Math.max(0.03, a) });
      }
    }
  });

  // -------------------------------------------------------------- Shell bridge
  const phoneEl = $('phone'), chatEl = $('chat'), choicesEl = $('choices');
  let capTimer: number | null = null;
  const shownCues = new Set<string>();
  let dialogTag = '';
  let dialogOpen = false, ended = false;

  const shell: Shell = {
    say(text, who, inner) {
      for (const id of ['capBox', 'capBoxP']) {
        const el = $(id);
        el.innerHTML = `<span class="who">${who}</span>` + text;
        el.classList.toggle('inner', inner); el.classList.add('show');
      }
      if (capTimer) clearTimeout(capTimer);
      capTimer = window.setTimeout(() => { $('capBox').classList.remove('show'); $('capBoxP').classList.remove('show'); }, 4800);
    },
    cue(id, who, text) { if (shownCues.has(id)) return; shownCues.add(id); shell.say(text, who, false); },
    openDialog(tag) {
      dialogTag = tag; dialogOpen = true;
      phoneEl.classList.add('show');
      (($('phoneTop').children[0]) as HTMLElement).textContent = tag.split('·')[0].trim().toUpperCase();
      chatEl.innerHTML = ''; audio.holdMusic(true); haptics.play('tick');
    },
    botLine(text) {
      // brief "typing" beat, then the line — matches the Moosh's chat cadence
      const typing = document.createElement('div'); typing.className = 'msg sys';
      typing.textContent = dialogTag.split('·')[0].trim() + ' is typing…';
      chatEl.appendChild(typing); chatEl.scrollTop = chatEl.scrollHeight;
      window.setTimeout(() => {
        typing.remove();
        const d = document.createElement('div'); d.className = 'msg bot';
        d.innerHTML = `<span class="tag">${dialogTag}</span>` +
          text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
        chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight; haptics.play('tick');
      }, 620);
    },
    setChoices(list) {
      choicesEl.innerHTML = '';
      for (const c of list) {
        const b = document.createElement('button');
        b.className = 'choice' + (/TERMINATE/.test(c.t) ? ' danger' : '');
        b.textContent = c.t;
        b.onclick = () => {
          audio.sfx('blip');
          const me = document.createElement('div'); me.className = 'msg me'; me.textContent = c.t;
          chatEl.appendChild(me); chatEl.scrollTop = chatEl.scrollHeight;
          c.fn();
        };
        choicesEl.appendChild(b);
      }
    },
    closeDialog() { dialogOpen = false; phoneEl.classList.remove('show'); audio.holdMusic(false); },
    swapBlock(_b: Block) { /* styled scene has no grey blocks to swap */ },
    haptic(n) { haptics.play(n as never); },
    sfx(n) { audio.sfx(n as never); },
    end(_counter, _line) { ended = true; runMontage(); },
    inventory(items) {
      const inv = $('inv'); inv.innerHTML = '';
      for (const it of items) {
        const chip = document.createElement('div');
        chip.className = 'invchip show'; chip.textContent = '◈ ' + it;
        inv.appendChild(chip);
      }
    },
  };

  const interp = new Interp(scene, shell);

  // ------------------------------------------------------------------- input
  let queued: (() => void) | null = null;
  const clampY = (y: number) => Math.max(pack.walkMinY, Math.min(pack.walkMaxY, y));
  function walkTo(x: number, y: number, then: (() => void) | null, instant = false) {
    A.tx = Math.max(12, Math.min(ROOMW - 12, x)); A.ty = clampY(y);
    queued = then;
    if (instant) { A.x = A.tx; A.y = A.ty; A.walking = false; if (queued) { const q = queued; queued = null; q(); } return; }
    A.walking = true;
  }

  const toWorld = (e: PointerEvent) => {
    const r = app.canvas.getBoundingClientRect();
    return { x: camX + (e.clientX - r.left) / (r.width / viewW), y: (e.clientY - r.top) / (r.height / H) };
  };
  let downAt = 0, downX = 0, downY = 0, longFired = false, lp: number | null = null;
  let lastTap = 0, lastId: string | null = null;
  app.canvas.addEventListener('pointerdown', (e) => {
    downAt = performance.now(); longFired = false;
    const p = toWorld(e); downX = p.x; downY = p.y;
    lp = window.setTimeout(() => {
      longFired = true;
      const h = interp.hitTest(downX, downY);
      if (h) { haptics.play('tick'); interp.examine(h); } else reveal();
    }, 480);
  });
  app.canvas.addEventListener('pointermove', (e) => {
    const p = toWorld(e);
    if (Math.hypot(p.x - downX, p.y - downY) > 6 && lp) { clearTimeout(lp); lp = null; }
  });
  app.canvas.addEventListener('pointerup', (e) => {
    if (lp) { clearTimeout(lp); lp = null; }
    if (longFired || performance.now() - downAt > 480) return;
    const p = toWorld(e);
    const h = interp.hitTest(p.x, p.y);
    const now = performance.now();
    const dbl = !!h && lastId === h.id && now - lastTap < 350;
    lastTap = now; lastId = h?.id ?? null;
    if (h && h.rect[2] * h.rect[3] < ROOMW * H * 0.5) {
      haptics.play('tick'); audio.sfx('blip');
      walkTo(h.walkX, p.y, () => interp.use(h), dbl);
    } else walkTo(p.x, p.y, null, dbl);
  });

  function reveal() {
    haptics.play('tick'); audio.sfx('reveal');
    revealG.clear();
    for (const h of scene.hotspots) {
      const [x, y, w, hh] = h.rect;
      const cxm = x + w / 2, cym = y + hh / 2;
      if (cxm < camX - 10 || cxm > camX + viewW + 10) continue;
      revealG.moveTo(cxm, cym - 5).lineTo(cxm + 5, cym).lineTo(cxm, cym + 5).lineTo(cxm - 5, cym).closePath()
        .fill({ color: 0xffb14a, alpha: 0.9 });
    }
    window.setTimeout(() => revealG.clear(), 2000);
  }

  // ----------------------------------------------------------------- montage
  const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let endTimers: number[] = [];
  const endLater = (fn: () => void, ms: number) => { endTimers.push(window.setTimeout(fn, ms)); };
  function tween(from: number, to: number, ms: number, done?: () => void) {
    const big = $('counterBig'); const start = performance.now();
    const step = () => {
      if (!ended) return;
      const p = Math.min(1, (performance.now() - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      big.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else { big.textContent = fmt(to); done?.(); }
    };
    requestAnimationFrame(step);
  }
  function runMontage() {
    const M = pack.montage;
    shell.closeDialog();
    $('endPage').style.display = 'flex';
    const label = $('endLabel'), big = $('counterBig'), title = $('endTitle'), line = $('endLine');
    label.textContent = M.label; big.textContent = '0';
    title.textContent = ''; title.classList.remove('show');
    line.innerHTML = ''; line.classList.remove('show');
    $('endButtons').classList.remove('show'); $('endSkip').classList.remove('show');
    const nextCard = $('endNext'); if (nextCard) nextCard.innerHTML = M.nextHTML;

    // this victim's press — seeded at their actual place in the night
    endLater(() => {
      label.textContent = M.firstPress.time; big.textContent = fmt(M.firstPress.at);
      haptics.play('impact'); audio.sfx('page');
    }, 800);
    endLater(() => { line.innerHTML = M.introLine; line.classList.add('show'); }, 1700);
    endLater(() => $('endSkip').classList.add('show'), 3000);

    let cursor = 6000, prev = M.firstPress.at;
    for (const b of M.beats) {
      const from = prev, to = b.at, at = cursor;
      endLater(() => line.classList.remove('show'), at - 400);
      endLater(() => {
        label.textContent = b.time;
        title.textContent = b.title.toUpperCase(); title.classList.add('show');
        line.innerHTML = b.line; line.classList.add('show');
        haptics.play('tick'); audio.sfx('blip');
        tween(from, to, 2200);
      }, at);
      prev = b.at; cursor += 3400;
    }
    endLater(() => { line.classList.remove('show'); title.classList.remove('show'); }, cursor - 400);
    endLater(() => {
      $('endLabel').textContent = M.land.time; $('endTitle').classList.remove('show');
      tween(prev, M.land.at, 2000, () => haptics.play('terminate'));
      endLater(() => { $('endLine').innerHTML = M.land.line; $('endLine').classList.add('show'); }, 1500);
      endLater(() => { $('endButtons').classList.add('show'); $('endSkip').classList.remove('show'); }, 2800);
    }, cursor);
  }
  function skipMontage() {
    const M = pack.montage;
    endTimers.forEach(clearTimeout); endTimers = [];
    $('endLabel').textContent = M.land.time;
    $('endTitle').textContent = ''; $('endTitle').classList.remove('show');
    $('counterBig').textContent = fmt(M.land.at);
    $('endLine').innerHTML = M.land.line; $('endLine').classList.add('show');
    const nextCard = $('endNext'); if (nextCard) nextCard.innerHTML = M.nextHTML;
    $('endButtons').classList.add('show'); $('endSkip').classList.remove('show');
  }

  // ------------------------------------------------------------------- chrome
  const sub = document.querySelector('#startPage .sub') as HTMLElement;
  if (sub && pack.phoneLabel) sub.textContent = pack.phoneLabel;
  const clockEl = document.getElementById('clock'); if (clockEl && pack.montage) clockEl.textContent = pack.montage.firstPress.time;
  $('btnReveal').addEventListener('click', reveal);
  $('btnPhone').addEventListener('click', () => {
    const ph = scene.hotspots.find(h => h.id === 'phone');
    if (ph) walkTo(ph.walkX, 190, () => interp.use(ph), true);
  });
  $('btnAgain').addEventListener('click', () => location.reload());
  $('endSkip').addEventListener('click', skipMontage);
  $('btnStart').addEventListener('click', () => {
    audio.unlock(); audio.sfx('page'); haptics.play('page');
    $('startPage').style.display = 'none';
    window.setTimeout(() => interp.start(), 600);
  });
  phoneEl.addEventListener('click', (e) => { if (e.target === phoneEl) interp.externalClose(); });
  $('phoneClose').addEventListener('click', () => interp.externalClose());
  $('phoneExit').addEventListener('click', () => interp.externalClose());

  // ---------------------------------------------------------------- Test API
  (window as unknown as Record<string, unknown>).__bg = {
    view: () => ({ camX, viewW }),
    ready: () => actorFrames.length > 0,
    state: () => ({
      started: shownCues.size > 0, dialogOpen, ended,
      flags: { ...interp.flags }, unlocked: [...interp.unlocked],
    }),
    hotspots: () => scene.hotspots.map(h => h.id),
    examine: (id: string) => { const h = scene.hotspots.find(x => x.id === id); if (h) interp.examine(h); },
    use: (id: string) => {
      const h = scene.hotspots.find(x => x.id === id); if (!h) return;
      walkTo(h.walkX, clampY(h.rect[1] + h.rect[3]), () => interp.use(h), true);
    },
    openPhone: () => { const ph = scene.hotspots.find(h => h.id === 'phone'); if (ph) interp.use(ph); },
    closePhone: () => interp.externalClose(),
    phoneOpen: () => dialogOpen,
    caption: () => $('capBox').textContent || $('capBoxP').textContent || '',
    chat: () => [...chatEl.querySelectorAll('.msg')].map(m => (m as HTMLElement).textContent || ''),
    choices: () => [...choicesEl.querySelectorAll('.choice')].map(b => (b as HTMLElement).textContent || ''),
    choose: (needle: string) => {
      const b = [...choicesEl.querySelectorAll('.choice')].find(x => (x.textContent || '').includes(needle));
      (b as HTMLElement | undefined)?.click();
    },
    reveal: () => reveal(),
  };
}
