#!/usr/bin/env node
// GLITCHKIT headless solver (ENGINE.md): BFS over a scene's reachable state
// space. Proves the goal is reachable (build FAILS otherwise), reports the
// minimum interaction count and a solution path, and lists content that can
// never fire (build WARNING — dead jokes are wasted jokes).
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) { console.error('usage: solve-scene.mjs <scene.json>…'); process.exit(2); }
let failed = false;

for (const file of files) {
  const scene = JSON.parse(readFileSync(file, 'utf8'));
  const fired = new Set();          // op-site coverage
  const allSites = new Set();

  // enumerate all sites (rules + choices) for coverage accounting
  for (const h of scene.hotspots) (h.use ?? []).forEach((_, i) => allSites.add(`use:${h.id}#${i}`));
  for (const [dId, d] of Object.entries(scene.dialogs ?? {}))
    for (const [nId, n] of Object.entries(d.nodes))
      n.choices.forEach((_, i) => allSites.add(`choice:${dId}.${nId}#${i}`));

  const test = (st, c) => {
    if (!c) return true;
    let ok = true;
    if (c.flag !== undefined) ok = (st.flags[c.flag] ?? false) === (c.is === undefined ? true : c.is);
    if (c.has !== undefined) ok = st.inv.includes(c.has);
    return c.not ? !ok : ok;
  };

  const applyOps = (st, ops) => {
    for (const op of ops) {
      if (op.set) st.flags = { ...st.flags, ...op.set };
      if (op.give && !st.inv.includes(op.give)) st.inv = [...st.inv, op.give].sort();
      if (op.take) st.inv = st.inv.filter(x => x !== op.take);
      if (op.unlock && !st.unlocked.includes(op.unlock)) st.unlocked = [...st.unlocked, op.unlock].sort();
      if (op.dialog) st.dialog = op.dialog.includes('.') ? op.dialog : `${op.dialog}.start`;
      if (op.end) st.ended = true;
    }
  };

  const key = (st) => JSON.stringify([st.flags, st.inv, st.unlocked, st.dialog, st.ended]);
  const start = { flags: { ...scene.flags }, inv: [], unlocked: [], dialog: null, ended: false };
  const seen = new Map([[key(start), null]]);
  let frontier = [{ st: start, path: [] }];
  let solution = null;
  let depth = 0;

  while (frontier.length && depth < 60) {
    const next = [];
    for (const { st, path } of frontier) {
      if (st.ended || (st.flags[scene.goal] === true)) { if (!solution) solution = path; continue; }
      const moves = [];
      if (st.dialog) {
        const [dId, nId] = st.dialog.split('.');
        const node = scene.dialogs[dId]?.nodes[nId];
        if (node) node.choices.forEach((c, i) => {
          if (c.locked && !st.unlocked.includes(c.id ?? c.t)) return;
          moves.push({
            label: `choice:${dId}.${nId}#${i}`, text: c.t,
            run: (s2) => {
              if (c.do) applyOps(s2, c.do);
              if (c.goto === '@close') s2.dialog = null;
              else if (c.goto && !c.do?.some(o => o.dialog)) s2.dialog = `${dId}.${c.goto}`;
            },
          });
        });
      } else {
        for (const h of scene.hotspots) {
          const rules = h.use ?? [];
          const idx = rules.findIndex(r => test(st, r.if));
          if (idx >= 0) moves.push({
            label: `use:${h.id}#${idx}`, text: `use ${h.label}`,
            run: (s2) => applyOps(s2, rules[idx].do),
          });
        }
      }
      for (const m of moves) {
        const s2 = structuredClone(st);
        m.run(s2);
        fired.add(m.label);
        const k = key(s2);
        if (!seen.has(k)) { seen.set(k, m.label); next.push({ st: s2, path: [...path, m.text] }); }
      }
    }
    frontier = next;
    depth++;
  }

  const dead = [...allSites].filter(s => !fired.has(s));
  console.log(`\n■ ${scene.id} (${file})`);
  if (solution) {
    console.log(`  ✓ goal '${scene.goal}' reachable in ${solution.length} interactions`);
    console.log('  path: ' + solution.join(' → '));
  } else {
    console.log(`  ✗ GOAL '${scene.goal}' UNREACHABLE — scene is not completable`);
    failed = true;
  }
  console.log(`  states explored: ${seen.size}`);
  if (dead.length) console.log(`  ⚠ never-fired content (${dead.length}): ${dead.join(', ')}`);
  else console.log('  ✓ every rule and choice is reachable');
}
process.exit(failed ? 1 : 0);
