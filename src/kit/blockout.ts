// GLITCHKIT blockout renderer — auto-generated grey-box scene, fully
// playable with zero art. Consumes scene JSON via the Interp; bridges the
// Shell to the same DOM chrome the styled game uses (captions, phone,
// choices, end card). Writers playtest here.

import { Application, Container, Graphics, Text } from 'pixi.js';
import { haptics } from '../engine/haptics';
import { audio } from '../engine/audio';
import { Interp, Scene, Shell, Hotspot, Block } from './kit';

const $ = (id: string) => document.getElementById(id)!;

export async function bootBlockout(scene: Scene) {
  const H = scene.room.h;
  const app = new Application();
  await app.init({
    width: 384, height: H, background: '#101218', antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 3), autoDensity: true,
  });
  ($('sceneWrap') as HTMLElement).prepend(app.canvas);
  app.canvas.id = 'game';

  const world = new Container();
  app.stage.addChild(world);

  // ---- blocks
  const blockG = new Map<string, Container>();
  for (const b of scene.room.blocks) {
    const c = new Container();
    drawBlock(c, b);
    world.addChild(c);
    blockG.set(b.id, c);
  }
  function drawBlock(c: Container, b: Block) {
    c.removeChildren();
    if (b.hidden) return;
    const g = new Graphics();
    g.roundRect(b.x, b.y, b.w, b.h, 3)
      .fill({ color: parseInt((b.tint ?? '#3a4152').slice(1), 16), alpha: 0.9 })
      .stroke({ color: 0x8a92a8, alpha: 0.35, width: 1 });
    c.addChild(g);
    if (b.label) {
      const t = new Text({
        text: b.label,
        style: { fontFamily: 'Courier New', fontSize: 9, fill: 0xc8cede, fontWeight: 'bold' },
      });
      t.alpha = 0.75;
      t.position.set(b.x + 3, b.y + 3);
      c.addChild(t);
    }
  }

  // ---- actor: the noble playtest capsule
  const actor = new Container();
  const body = new Graphics();
  body.roundRect(-8, -34, 16, 26, 7).fill(0xd96a4a);
  body.circle(0, -40, 8).fill(0xe8d9b0);
  body.roundRect(-7, -9, 6, 9, 2).fill(0x33382a);
  body.roundRect(1, -9, 6, 9, 2).fill(0x33382a);
  actor.addChild(body);
  const nameT = new Text({ text: scene.actor.name, style: { fontFamily: 'Courier New', fontSize: 8, fill: 0xe8d9b0 } });
  nameT.anchor.set(0.5, 0); nameT.position.set(0, -56); nameT.alpha = 0.7;
  actor.addChild(nameT);
  world.addChild(actor);
  const A = { x: scene.actor.start[0], y: scene.actor.start[1], tx: 0, ty: 0, walking: false };
  A.tx = A.x; A.ty = A.y;
  let queued: (() => void) | null = null;

  const hotG = new Graphics(); world.addChild(hotG);

  // ---- camera / layout
  let viewW = 384, sceneScale = 1, camX = 0, camTargetX = 0;
  function layout() {
    const portrait = innerHeight > innerWidth;
    document.body.classList.toggle('portrait', portrait);
    document.body.classList.toggle('landscape', !portrait);
    requestAnimationFrame(() => {
      const wrap = $('sceneWrap');
      const rw = wrap.clientWidth, rh = wrap.clientHeight;
      viewW = portrait ? Math.max(120, Math.min(scene.room.w, Math.round((rw / rh) * H))) : Math.min(384, scene.room.w);
      sceneScale = Math.min(rw / viewW, rh / H);
      app.renderer.resize(Math.floor(viewW * sceneScale), Math.floor(H * sceneScale));
      world.scale.set(sceneScale);
    });
  }
  layout();
  window.addEventListener('resize', layout);

  app.ticker.add((tk) => {
    const dt = tk.deltaMS / 1000;
    camTargetX = Math.max(0, Math.min(scene.room.w - viewW, A.x - viewW / 2));
    camX += (camTargetX - camX) * Math.min(1, dt * 5);
    world.x = -Math.round(camX * sceneScale);
    if (A.walking) {
      const dx = A.tx - A.x, dy = A.ty - A.y, d = Math.hypot(dx, dy);
      if (d < 2.5) { A.walking = false; if (queued) { const q = queued; queued = null; q(); } }
      else { A.x += (dx / d) * 70 * dt; A.y += (dy / d) * 70 * dt; }
    }
    actor.position.set(Math.round(A.x), Math.round(A.y));
  });

  // ---- shell: bridge to the shared DOM chrome
  let capTimer: number | null = null;
  const shownCues = new Set<string>();
  let dialogTag = '';
  const shell: Shell = {
    say(text, who, inner) {
      for (const id of ['capBox', 'capBoxP']) {
        const el = $(id);
        el.innerHTML = `<span class="who">${who}</span>` + text;
        el.classList.toggle('inner', inner);
        el.classList.add('show');
      }
      if (capTimer) clearTimeout(capTimer);
      capTimer = window.setTimeout(() => { $('capBox').classList.remove('show'); $('capBoxP').classList.remove('show'); }, 4600);
    },
    cue(id, who, text) {
      if (shownCues.has(id)) return;
      shownCues.add(id);
      shell.say(text, who, false);
    },
    openDialog(tag) {
      dialogTag = tag;
      $('phone').classList.add('show');
      ($('phoneTop').children[0] as HTMLElement).textContent = tag.split('·')[0].trim().toUpperCase();
      $('chat').innerHTML = '';
      audio.holdMusic(true);
    },
    botLine(text) {
      const d = document.createElement('div'); d.className = 'msg bot';
      d.innerHTML = `<span class="tag">${dialogTag}</span>` + text;
      $('chat').appendChild(d); $('chat').scrollTop = $('chat').scrollHeight;
    },
    setChoices(list) {
      const box = $('choices'); box.innerHTML = '';
      for (const c of list) {
        const b = document.createElement('button');
        b.className = 'choice' + (c.t.includes('TERMINATE') ? ' danger' : '');
        b.textContent = c.t;
        b.onclick = () => {
          audio.sfx('blip');
          const me = document.createElement('div'); me.className = 'msg me'; me.textContent = c.t;
          $('chat').appendChild(me);
          c.fn();
        };
        box.appendChild(b);
      }
    },
    closeDialog() { $('phone').classList.remove('show'); audio.holdMusic(false); },
    swapBlock(b) { const c = blockG.get(b.id); if (c) drawBlock(c, b); },
    haptic(n) { haptics.play(n as never); },
    sfx(n) { audio.sfx(n as never); },
    end(counter, line) {
      shell.closeDialog();
      const end = $('endPage'); end.style.display = 'flex';
      const n = Number(counter.replace(/[^0-9]/g, ''));
      const simple = Number.isFinite(n) && n < 100;
      $('counterBig').textContent = simple ? String(Math.max(0, n - 1)) : '…';
      window.setTimeout(() => { $('counterBig').textContent = counter; haptics.play('impact'); }, 900);
      window.setTimeout(() => { $('endLine').innerHTML = line; }, 1600);
    },
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

  // ---- input (same grammar as the styled game)
  const toWorld = (e: PointerEvent) => {
    const r = app.canvas.getBoundingClientRect();
    return { x: camX + (e.clientX - r.left) / (r.width / viewW), y: (e.clientY - r.top) / (r.height / H) };
  };
  const clampY = (y: number) => Math.max(scene.room.walkMinY, Math.min(scene.room.walkMaxY, y));
  function walkTo(x: number, y: number, then: (() => void) | null, instant: boolean) {
    A.tx = Math.max(10, Math.min(scene.room.w - 10, x)); A.ty = clampY(y);
    queued = then;
    if (instant) { A.x = A.tx; A.y = A.ty; A.walking = false; if (queued) { const q = queued; queued = null; q(); } return; }
    A.walking = true;
  }
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
    if (h && h.rect[2] * h.rect[3] < scene.room.w * scene.room.h * 0.5) {
      haptics.play('tick'); audio.sfx('blip');
      walkTo(h.walkX, p.y, () => interp.use(h), dbl);
    } else walkTo(p.x, p.y, null, dbl);
  });

  function reveal() {
    haptics.play('tick'); audio.sfx('reveal');
    hotG.clear();
    for (const h of scene.hotspots) {
      const [x, y, w, hh] = h.rect;
      hotG.roundRect(x, y, w, hh, 2).stroke({ color: 0xffb14a, alpha: 0.85, width: 1.5 });
    }
    window.setTimeout(() => hotG.clear(), 2200);
  }

  // ---- chrome
  $('btnReveal').addEventListener('click', reveal);
  $('btnPhone').addEventListener('click', () => {
    const ph = scene.hotspots.find(h => h.id === 'phone');
    if (ph) walkTo(ph.walkX, 190, () => interp.use(ph), true);
  });
  $('btnAgain').addEventListener('click', () => location.reload());
  $('btnStart').addEventListener('click', () => {
    audio.unlock(); audio.sfx('page'); haptics.play('page');
    $('startPage').style.display = 'none';
    window.setTimeout(() => interp.start(), 600);
  });
  const sub = document.querySelector('#startPage .sub') as HTMLElement;
  if (sub) sub.textContent = `blockout playtest · ${scene.title}`;
  $('phone').addEventListener('click', (e) => { if (e.target === $('phone')) interp.externalClose(); });
  $('phoneClose').addEventListener('click', () => interp.externalClose());

  // debug hook (playwright playthroughs)
  (window as unknown as Record<string, unknown>).__bg = { view: () => ({ camX, viewW }) };
}
