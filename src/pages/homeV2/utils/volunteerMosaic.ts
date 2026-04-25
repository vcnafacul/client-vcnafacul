// client-vcnafacul/src/pages/homeV2/utils/volunteerMosaic.ts
export interface MosaicSpan {
  colSpan: number;
  rowSpan: number;
}

const PATTERN: MosaicSpan[] = [
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 1, rowSpan: 2 },
  { colSpan: 2, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function spanForVolunteer(id: string | number, index: number): MosaicSpan {
  const seed = hashString(`${id}-${index}`);
  return PATTERN[seed % PATTERN.length];
}
