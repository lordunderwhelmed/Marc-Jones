// GLITCHKIT v0 — scene data types + interpreter (see ENGINE.md).
// The interpreter is renderer-agnostic: it talks to the world through a
// Shell of callbacks. Blockout, styled renderer, and the headless solver
// all consume the same scene JSON.

export interface Block {
  id: string; x: number; y: number; w: number; h: number;
  tint?: string; label?: string; hidden?: boolean;
}
export interface Cond { flag?: string; is?: unknown; has?: string; not?: boolean }
export interface Op {
  say?: string; who?: string;
  cue?: string;
  set?: Record<string, unknown>;
  give?: string; take?: string;
  dialog?: string;            // "dialogId" or "dialogId.nodeId"
  unlock?: string;            // choice id
  swap?: { block: string; tint?: string; label?: string; hidden?: boolean };
  haptic?: string; sfx?: string;
  end?: { counter: string; line: string };
}
export interface Rule { if?: Cond; do: Op[] }
export interface Hotspot {
  id: string; label: string; rect: [number, number, number, number];
  walkX: number;
  examine: string | [string, string];
  use?: Rule[];
}
export interface Choice { id?: string; t: string; locked?: boolean; do?: Op[]; goto?: string }
export interface DialogNode { text: string; tag?: string; choices: Choice[] }
export interface Scene {
  id: string; title: string;
  room: { w: number; h: number; floorY: number; walkMinY: number; walkMaxY: number; blocks: Block[] };
  actor: { start: [number, number]; name: string };
  flags: Record<string, unknown>;
  hotspots: Hotspot[];
  dialogs: Record<string, { tag?: string; nodes: Record<string, DialogNode> }>;
  cues: Record<string, { who: string; text: string }>;
  onStart?: Op[];
  goal: string;               // flag name; truthy = complete
}

export interface Shell {
  say(text: string, who: string, inner: boolean): void;
  cue(id: string, who: string, text: string): void;       // once-rule handled by shell
  openDialog(tag: string): void;
  botLine(text: string): void;
  setChoices(list: { t: string; fn: () => void }[]): void;
  closeDialog(): void;
  swapBlock(b: Block): void;
  haptic(name: string): void;
  sfx(name: string): void;
  end(counter: string, line: string): void;
  inventory(items: string[]): void;
}

export class Interp {
  flags: Record<string, unknown>;
  inv = new Set<string>();
  unlocked = new Set<string>();
  examined = new Set<string>();
  private dialogId: string | null = null;

  constructor(public scene: Scene, public shell: Shell) {
    this.flags = { ...scene.flags };
  }

  start() { if (this.scene.onStart) this.run(this.scene.onStart); }

  private test(c?: Cond): boolean {
    if (!c) return true;
    let ok = true;
    if (c.flag !== undefined) ok = this.flags[c.flag] === (c.is === undefined ? true : c.is);
    if (c.has !== undefined) ok = this.inv.has(c.has);
    return c.not ? !ok : ok;
  }

  examine(h: Hotspot) {
    const second = this.examined.has(h.id) && Array.isArray(h.examine);
    this.examined.add(h.id);
    const line = Array.isArray(h.examine) ? h.examine[second ? 1 : 0] : h.examine;
    this.shell.say(line, this.scene.actor.name, true);
  }

  use(h: Hotspot) {
    if (!h.use || h.use.length === 0) { this.examine(h); return; }
    for (const r of h.use) {
      if (this.test(r.if)) { this.run(r.do); return; }
    }
    this.examine(h);
  }

  run(ops: Op[]) {
    for (const op of ops) {
      if (op.say !== undefined) this.shell.say(op.say, op.who ?? this.scene.actor.name, true);
      if (op.cue) { const c = this.scene.cues[op.cue]; if (c) this.shell.cue(op.cue, c.who, c.text); }
      if (op.set) Object.assign(this.flags, op.set);
      if (op.give) { this.inv.add(op.give); this.shell.inventory([...this.inv]); }
      if (op.take) { this.inv.delete(op.take); this.shell.inventory([...this.inv]); }
      if (op.unlock) this.unlocked.add(op.unlock);
      if (op.swap) {
        const b = this.scene.room.blocks.find(x => x.id === op.swap!.block);
        if (b) { Object.assign(b, op.swap); this.shell.swapBlock(b); }
      }
      if (op.haptic) this.shell.haptic(op.haptic);
      if (op.sfx) this.shell.sfx(op.sfx);
      if (op.dialog) this.gotoDialog(op.dialog);
      if (op.end) this.shell.end(op.end.counter, op.end.line);
    }
  }

  gotoDialog(ref: string) {
    const [dId, nId] = ref.includes('.') ? ref.split('.') : [ref, 'start'];
    const d = this.scene.dialogs[dId];
    if (!d) return;
    if (this.dialogId !== dId) { this.shell.openDialog(d.tag ?? this.scene.title); this.dialogId = dId; }
    const node = d.nodes[nId];
    if (!node) return;
    this.shell.botLine(node.text);
    this.shell.setChoices(
      node.choices
        .filter(c => !c.locked || this.unlocked.has(c.id ?? c.t))
        .map(c => ({
          t: c.t,
          fn: () => {
            if (c.do) this.run(c.do);
            if (c.goto === '@close') { this.dialogId = null; this.shell.closeDialog(); }
            else if (c.goto) this.gotoDialog(`${dId}.${c.goto}`);
          },
        })),
    );
  }

  hitTest(x: number, y: number): Hotspot | null {
    let best: Hotspot | null = null, area = Infinity;
    for (const h of this.scene.hotspots) {
      const [hx, hy, hw, hh] = h.rect;
      if (x >= hx && x <= hx + hw && y >= hy && y <= hy + hh && hw * hh < area) { best = h; area = hw * hh; }
    }
    return best;
  }
}
