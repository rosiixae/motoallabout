// SVG-Symbole der Warnleuchten (aus der Seite «Motorrad-Warnleuchten»).
// Stilisiert, keine offiziellen ISO-2575-Grafiken. Farbe über currentColor.

const S = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const lampR = 'M24 11 Q42 11 42 24 Q42 37 24 37 Z';
const lampL = 'M24 11 Q6 11 6 24 Q6 37 24 37 Z';
const wavyV = (x: number) => `M${x} 7 q-3 4.25 0 8.5 q3 4.25 0 8.5 q-3 4.25 0 8.5 q3 4.25 0 8.5`;
const oilCan = '<path d="M11 22 H28 L40 16.5 L42.5 19 L32 34 H11 Z"/><path d="M18 22 V17.5 M14 17.5 H22"/><path d="M11 24.5 H6.5 V30.5 H11"/>';
const oilDrop = '<path d="M42 25 C40 28.5 40 31.5 42 31.5 C44 31.5 44 28.5 42 25 Z" fill="currentColor"/>';
const flakeArm = '<path d="M24 24 V6 M19.5 9.5 L24 13.5 L28.5 9.5"/>';

const ICONS: Record<string, string> = {
  oil_pressure: `<g ${S}>${oilCan}</g>${oilDrop}`,
  coolant: `<g ${S}><path d="M21 8 V28"/><path d="M25 11 H31 M25 17 H31 M25 23 H31"/><path d="M5 40 q3.5 -3 7 0 t7 0 t7 0 t7 0 t7 0 t7 0"/><path d="M5 45 q3.5 -3 7 0 t7 0 t7 0 t7 0 t7 0 t7 0"/></g><circle cx="21" cy="31" r="4.5" fill="currentColor"/>`,
  battery: `<g ${S}><rect x="5" y="15" width="38" height="24" rx="2"/><path d="M11 27 H19 M29 27 H37 M33 23 V31"/></g><rect x="10" y="10" width="8" height="5" fill="currentColor"/><rect x="30" y="10" width="8" height="5" fill="currentColor"/>`,
  brake: `<g ${S}><circle cx="24" cy="24" r="11"/><path d="M24 18 V26"/><path d="M10 11 A17 17 0 0 0 10 37 M38 11 A17 17 0 0 1 38 37"/></g><circle cx="24" cy="30.5" r="1.9" fill="currentColor"/>`,
  hazard: `<g ${S}><path d="M24 6 L44 41 H4 Z"/><path d="M24 19 L34 36 H14 Z"/></g>`,
  general: `<g ${S}><path d="M24 6 L44 41 H4 Z"/><path d="M24 18 V29"/></g><circle cx="24" cy="34.5" r="2" fill="currentColor"/>`,
  mil: `<path transform="scale(2)" fill="currentColor" d="M7,4V6H10V8H7L5,10V13H3V10H1V18H3V15H5V18H8L10,20H18V16H20V19H23V9H20V12H18V8H12V6H15V4H7Z"/>`,
  abs: `<g ${S}><circle cx="24" cy="24" r="13"/><path d="M8 11 A18 18 0 0 0 8 37 M40 11 A18 18 0 0 1 40 37"/></g><text x="24" y="28.5" text-anchor="middle" font-family="Arial" font-weight="800" font-size="12" fill="currentColor">ABS</text>`,
  fuel: `<path transform="scale(2)" fill="currentColor" d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>`,
  oil_level: `<g ${S} transform="translate(0 -4)">${oilCan}</g><g ${S}><path d="M5 40 q3.5 -3 7 0 t7 0 t7 0 t7 0 t7 0 t7 0"/></g>`,
  tc: `<text x="24" y="27" text-anchor="middle" font-family="Arial" font-weight="800" font-size="19" fill="currentColor">TC</text><g ${S}><path d="M6 37 q4.5 -4 9 0 t9 0 t9 0 t9 0"/></g>`,
  tpms: `<g ${S}><path d="M14 7 C5 15 5 31 12 38 H36 C43 31 43 15 34 7"/><path d="M15 38 V43 M21 38 V43 M27 38 V43 M33 38 V43"/><path d="M24 14 V26"/></g><circle cx="24" cy="31.5" r="2" fill="currentColor"/>`,
  service: `<path transform="translate(1 1) scale(1.9)" fill="currentColor" d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>`,
  ice: `<g ${S}>${[0, 60, 120, 180, 240, 300].map((r) => `<g transform="rotate(${r} 24 24)">${flakeArm}</g>`).join('')}</g>`,
  immobilizer: `<g ${S}><circle cx="13" cy="24" r="7"/><path d="M20 24 H43 M35 24 V31 M41 24 V30"/></g>`,
  sidestand: `<g ${S}><circle cx="11" cy="31" r="6.5"/><circle cx="37" cy="31" r="6.5"/><path d="M11 31 L17 19 H30 L37 31"/><path d="M17 19 L14 13 H9"/><path d="M27 19 L31 15 H40"/></g><path d="M25 22 L31 44" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  rear_fog: `<g ${S}><path d="${lampL}"/><path d="M30 14 H44 M30 20.5 H44 M30 27 H44 M30 33.5 H44"/><path d="${wavyV(37)}"/></g>`,
  bulb: `<g ${S}><path d="M17 31 C11 27 10 21 12 16 C14 11 19 8 24 8 C29 8 34 11 36 16 C38 21 37 27 31 31 V36 H17 Z"/><path d="M19 41 H29"/><path d="M24 14 V24"/></g><circle cx="24" cy="29" r="1.9" fill="currentColor"/>`,
  neutral: `<path d="M15 37 V11 L33 37 V11" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  turn: `<path fill="currentColor" d="M3 24 L14 14 V19.5 H21 V28.5 H14 V34 Z M45 24 L34 14 V19.5 H27 V28.5 H34 V34 Z"/>`,
  high: `<g ${S}><path d="${lampR}"/><path d="M5 13 H18 M5 18.5 H18 M5 24 H18 M5 29.5 H18 M5 35 H18"/></g>`,
  low: `<g ${S}><path d="${lampR}"/><path d="M18 13 L6 17 M18 18.5 L6 22.5 M18 24 L6 28 M18 29.5 L6 33.5 M18 35 L6 39"/></g>`,
  position: `<g ${S}><path d="M17 15 Q24 15 24 24 Q24 33 17 33 Z"/><path d="M31 15 Q24 15 24 24 Q24 33 31 33 Z"/><path d="M13 17 L5 15 M13 24 H5 M13 31 L5 33 M35 17 L43 15 M35 24 H43 M35 31 L43 33"/></g>`,
  front_fog: `<g ${S}><path d="${lampR}"/><path d="M19 14 L4 18 M19 24 L4 28 M19 34 L4 38"/><path d="${wavyV(11.5)}"/></g>`,
  cruise: `<g ${S}><path d="M8 35 A17 17 0 1 1 40 35"/><path d="M24 31 L32 19"/><path d="M12 20 L15 22 M24 11 V14.5 M36 20 L33 22"/></g><circle cx="24" cy="31" r="3" fill="currentColor"/>`,
  grip: `<g ${S}><rect x="5" y="31" width="28" height="10" rx="5"/><path d="M33 36 H44"/><path d="M12 27 q-3 -4 0 -8 q3 -4 0 -8 M20 27 q-3 -4 0 -8 q3 -4 0 -8 M28 27 q-3 -4 0 -8 q3 -4 0 -8"/></g>`,
  seat: `<g ${S}><path d="M5 40 Q7 31 16 31 L30 33 Q38 33 43 28 V40 Z"/><path d="M14 26 q-3 -4 0 -8 q3 -4 0 -8 M22 26 q-3 -4 0 -8 q3 -4 0 -8 M30 27 q-3 -4 0 -8 q3 -4 0 -8"/></g>`,
  shift: `<path fill="currentColor" d="M24 6 L38 21 H29 V32 H19 V21 H10 Z"/><g ${S}><path d="M19 38 H29 M19 43 H29"/></g>`,
};

/** Farbe der Leuchte wie im Cockpit */
export const lampColor: Record<string, string> = {
  red: '#FF3B30',
  amber: '#FFB020',
  green: '#34D158',
  blue: '#3B8CFF',
};

/** Leuchtfarbe pro Symbol (Fernlicht ist blau, Infos grün) */
export function lampColorFor(code: string, severity: 'red' | 'yellow' | 'info'): string {
  if (severity === 'red') return lampColor.red;
  if (severity === 'yellow') return lampColor.amber;
  return code === 'high' ? lampColor.blue : lampColor.green;
}

export function warningSvg(code: string): string | null {
  const inner = ICONS[code];
  return inner ? `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${inner}</svg>` : null;
}
