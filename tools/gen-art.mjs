#!/usr/bin/env node
// Gemini image pipeline for The Big Glitch. Treated as a swappable graphics
// engine: prompt (+ optional reference images) -> PNG concept frames. Nano
// Banana / Nano Banana Pro via the Generative Language API.
//
//   export GEMINI_API_KEY=...            # your Google AI Studio key
//   node tools/gen-art.mjs list          # what image models the key can see
//   node tools/gen-art.mjs "<prompt>" [ref1.png ref2.png ...] -o out.png
//   GEMINI_MODEL=gemini-3-pro-image-preview node tools/gen-art.mjs "<prompt>" ...
//
// Never commit the key. Outputs land in design/gen/ by default.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, extname } from 'node:path';

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image-preview'; // Nano Banana
const HOST = 'https://generativelanguage.googleapis.com/v1beta';
if (!KEY) { console.error('! set GEMINI_API_KEY first'); process.exit(2); }

const args = process.argv.slice(2);

if (args[0] === 'list') {
  const r = await fetch(`${HOST}/models?key=${KEY}&pageSize=200`);
  const j = await r.json();
  if (!r.ok) { console.error(JSON.stringify(j, null, 2)); process.exit(1); }
  for (const m of j.models || []) {
    const gen = (m.supportedGenerationMethods || []).join(',');
    if (/image/i.test(m.name) || /image/i.test(gen)) console.log(`${m.name}  [${gen}]`);
  }
  process.exit(0);
}

// parse: prompt is first non-flag arg; refs are the rest; -o sets outfile
let out = null, prompt = null; const refs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-o') { out = args[++i]; continue; }
  if (prompt === null) { prompt = args[i]; continue; }
  refs.push(args[i]);
}
if (!prompt) { console.error('! need a prompt'); process.exit(2); }

const mime = (f) => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(f).toLowerCase()] || 'image/png');
const parts = [{ text: prompt }];
for (const f of refs) parts.push({ inlineData: { mimeType: mime(f), data: readFileSync(f).toString('base64') } });

const body = { contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } };
const res = await fetch(`${HOST}/models/${MODEL}:generateContent?key=${KEY}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});
const j = await res.json();
if (!res.ok) { console.error(`HTTP ${res.status}:`, JSON.stringify(j.error || j, null, 2)); process.exit(1); }

mkdirSync('design/gen', { recursive: true });
let n = 0;
for (const p of j.candidates?.[0]?.content?.parts || []) {
  if (p.inlineData?.data) {
    const dest = out || `design/gen/${basename(prompt.slice(0, 24).replace(/\W+/g, '-'))}-${++n}.png`;
    writeFileSync(dest, Buffer.from(p.inlineData.data, 'base64'));
    console.log('✓', dest, `(${(p.inlineData.data.length * 0.75 / 1024) | 0} KB)`);
  } else if (p.text) console.log('· model note:', p.text.slice(0, 200));
}
if (!n) { console.error('! no image returned. Full response:\n', JSON.stringify(j, null, 2).slice(0, 1200)); process.exit(1); }
