// Semantic haptics layer (DESIGN.md §5.2). v0 driver: navigator.vibrate
// (Android web). iOS web degrades silently; Capacitor/Taptic driver later.

type Pattern = number | number[];

const P: Record<string, Pattern> = {
  tick: 8,
  impact: 28,
  squelch: [18, 30, 40],           // the moosh
  success: [24, 40, 24, 40, 60],
  error: [50, 40, 50],
  shutter: [10, 20, 10],
  pickup: [12, 24, 20],
  terminate: [10, 40, 14, 60, 18, 90, 220], // the flagship thunk-ramp
  page: [6, 30, 6],
};

let enabled = true;
export const haptics = {
  setEnabled(v: boolean) { enabled = v; },
  play(name: keyof typeof P) {
    if (!enabled) return;
    try { navigator.vibrate?.(P[name]); } catch { /* no actuator */ }
  },
};
