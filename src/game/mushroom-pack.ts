// Beat 2 assembled for the styled renderer: the cabin art + the light rig +
// the atmosphere + this scene's montage. bootStyled(mushroom.json, mushroomPack)
// paints The Mushroom to Moosh fidelity while the proven scene logic drives it.

import type { StyledPack } from '../kit/styled';
import {
  CABINW, CH, CABIN_FLOOR_Y,
  drawCabin, drawHills, drawCabinFg, drawFireShaft, drawImre, drawBarnaby,
} from './mushroom-art';

export const mushroomPack: StyledPack = {
  roomW: CABINW, H: CH, floorY: CABIN_FLOOR_Y, walkMinY: 166, walkMaxY: 204,
  bg: drawCabin,
  far: { canvas: drawHills, x: 0, y: 24, parallax: 0.85 },
  fg: { canvas: drawCabinFg, parallax: 1.18 },
  fireShaft: { canvas: drawFireShaft, x: 110, y: 130 },
  actor: { frames: drawImre, scale: 0.2 },
  critters: [
    { id: 'dog', frames: drawBarnaby, x: 118, y: 187, fps: 1.4, anchor: [0.5, 1] },
  ],
  glows: [
    { tint: 0xff7a2e, alpha: 0.5, x: 110, y: 76, w: 120, h: 92, flicker: 'fire' },   // wood-stove fire (key light)
    { tint: 0x7adfff, alpha: 0.5, x: 217, y: 93, w: 70, h: 54, flicker: 'phone' },   // the phone, the one cold thing
    { tint: 0xc4d2e8, alpha: 0.22, x: 15, y: 15, w: 92, h: 84, flicker: 'moon' },    // cold moon through the glass
  ],
  motes: { x: 30, y: 30, w: 80, h: 92, count: 12, tint: 0xb8c8e0 },
  steam: [
    { x: 170, y: 74, tint: 0xd8cbb0 },   // off the pan — the smell that was the tragedy
    { x: 233, y: 98, tint: 0xbcd0dc },   // off the smart kettle's spite
  ],
  phoneLabel: 'chapter zero · beat two · the mushroom',
  montage: {
    label: 'ACCOUNTS TERMINATED TONIGHT',
    firstPress: { at: 47, time: '02:19' },
    introLine: `<i>“Nine seconds of human. That's all it took.”</i><br/><br/>He was the forty-seventh tonight, and it was only two-nineteen. The night had barely started.`,
    beats: [
      { at: 2_140, time: '02:31', title: 'The Ticket',
        line: "A man is fined for the pattern of his jacket. So is the neighbour who complained. Neither of them owns the jacket." },
      { at: 61_030, time: '02:48', title: 'The Date',
        line: "Two strangers are flagged mid-sentence — a conversation about sourdough, ruled suggestive. They log off in the same second." },
      { at: 402_884, time: '02:59', title: 'The Ghost',
        line: "A man is informed he is thirty percent deceased. He looks up, straight into the kiosk's lens — straight at you — and presses the button." },
    ],
    land: { at: 555_789, time: '03:03',
      line: "555,789. The counter stops. Somewhere, a dashboard draws a line half a centimetre down. Somebody is about to spend the rest of the book asking why." },
    nextHTML: 'NEXT · <i>The Night of the Sheep</i> · Beat 3 · <b style="color:#b08a4a">The Ticket</b> — 02:31',
  },
};
