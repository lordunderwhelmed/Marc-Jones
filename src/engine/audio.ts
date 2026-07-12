// WebAudio engine: rain bed, night pad, hold-music corruption layer, SFX.
// All synthesized — zero assets, artifact-safe. Unlocked by a user gesture.

let ctx: AudioContext | null = null;
let master: GainNode;
let rainGain: GainNode, padGain: GainNode, holdGain: GainNode;
let holdTimer: number | null = null;

function n(freq: number, t0: number, dur: number, type: OscillatorType, vol: number, out: AudioNode) {
  const o = ctx!.createOscillator(); const g = ctx!.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(out); o.start(t0); o.stop(t0 + dur + 0.05);
}

export const audio = {
  unlock() {
    if (ctx) { ctx.resume(); return; }
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);

    // --- rain: looped filtered noise ---
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 250;
    rainGain = ctx.createGain(); rainGain.gain.value = 0.05;
    src.connect(lp).connect(hp).connect(rainGain).connect(master); src.start();

    // --- night pad: two detuned triangles, slow chord walk (Am -> Fmaj7-ish) ---
    padGain = ctx.createGain(); padGain.gain.value = 0.035; padGain.connect(master);
    const chords = [[110, 164.8, 261.6], [87.3, 130.8, 220], [98, 146.8, 246.9], [110, 174.6, 261.6]];
    let ci = 0;
    const padTick = () => {
      if (!ctx) return;
      const t = ctx.currentTime;
      for (const f of chords[ci % chords.length]) {
        n(f, t, 7.5, 'triangle', 0.5, padGain);
        n(f * 1.003, t, 7.5, 'sine', 0.35, padGain);
      }
      ci++;
      window.setTimeout(padTick, 8000);
    };
    padTick();

    // --- hold music (phone open): wonky corporate melody, slightly seasick ---
    holdGain = ctx.createGain(); holdGain.gain.value = 0.0; holdGain.connect(master);
  },

  holdMusic(on: boolean) {
    if (!ctx) return;
    holdGain.gain.linearRampToValueAtTime(on ? 0.05 : 0.0, ctx.currentTime + 0.4);
    if (on && holdTimer === null) {
      const mel = [523, 659, 784, 659, 698, 587, 523, 587]; let mi = 0;
      const step = () => {
        if (!ctx) return;
        const wob = 1 + Math.sin(mi * 1.7) * 0.012; // wow & flutter: everything is fine
        n(mel[mi % mel.length] * wob, ctx.currentTime, 0.38, 'square', 0.16, holdGain);
        mi++;
        holdTimer = window.setTimeout(step, 340);
      };
      step();
    } else if (!on && holdTimer !== null) {
      window.setTimeout(() => { if (holdTimer !== null) { clearTimeout(holdTimer); holdTimer = null; } }, 500);
    }
  },

  sfx(name: 'blip' | 'shutter' | 'reject' | 'pickup' | 'garnish' | 'refund' | 'terminate' | 'page' | 'reveal') {
    if (!ctx) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'blip': n(660, t, 0.08, 'square', 0.12, master); break;
      case 'reveal': n(880, t, 0.1, 'sine', 0.12, master); n(1320, t + 0.07, 0.12, 'sine', 0.1, master); break;
      case 'shutter': n(1200, t, 0.05, 'square', 0.2, master); n(300, t + 0.04, 0.06, 'square', 0.16, master); break;
      case 'reject': n(220, t, 0.16, 'sawtooth', 0.14, master); n(185, t + 0.14, 0.3, 'sawtooth', 0.14, master); break;
      case 'pickup': n(520, t, 0.07, 'triangle', 0.18, master); n(780, t + 0.06, 0.1, 'triangle', 0.16, master); break;
      case 'garnish': n(392, t, 0.09, 'triangle', 0.16, master); n(523, t + 0.07, 0.09, 'triangle', 0.16, master); n(659, t + 0.14, 0.14, 'triangle', 0.16, master); break;
      case 'refund': [523, 659, 784, 1046].forEach((f, i) => n(f, t + i * 0.09, 0.22, 'triangle', 0.18, master)); break;
      case 'terminate': {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.5);
        g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        o.connect(g).connect(master); o.start(t); o.stop(t + 0.85);
        [880, 659, 523, 392, 262].forEach((f, i) => n(f, t + 0.5 + i * 0.13, 0.3, 'triangle', 0.14, master));
        break;
      }
      case 'page': {
        const b = ctx.createBufferSource(); const buf2 = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
        const dd = buf2.getChannelData(0);
        for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / dd.length) * 0.5;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800;
        b.buffer = buf2; b.connect(f).connect(master); b.start(t);
        break;
      }
    }
  },
};
