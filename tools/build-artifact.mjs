#!/usr/bin/env node
// Turns the built single-file dist/index.html into a claude.ai Artifact source:
// the Artifact host wraps content in its own <!doctype><head><body> skeleton, so
// we strip our document wrapper and hand over head-inner + body-inner (the
// <style> block, the app markup, and the inlined <script>).
//
//   npm run build && node tools/build-artifact.mjs [outfile]
import { readFileSync, writeFileSync } from 'node:fs';

const src = 'dist/index.html';
const out = process.argv[2] || 'dist/artifact.html';
const html = readFileSync(src, 'utf8');

const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '')
  .replace(/<meta\s+charset[^>]*>/i, '')          // skeleton supplies these
  .replace(/<meta\s+name=["']viewport["'][^>]*>/i, '')
  .trim();
const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '').trim();

if (!body) { console.error('! no <body> found in', src); process.exit(1); }

writeFileSync(out, head + '\n' + body + '\n');
console.log(`✓ ${out}  (${(head.length + body.length) / 1024 | 0} KB)`);
