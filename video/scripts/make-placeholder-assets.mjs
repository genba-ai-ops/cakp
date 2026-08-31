/**
 * 差し替え前提のプレースホルダー立ち絵を SVG で生成する。
 * すべて同じ viewBox なので、body / eyes / mouth を重ねるだけで位置が合う。
 * 本番では public/char/ の中身を自分の素材（同じ命名・同じ画角）に差し替える。
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'char');

const VIEWBOX = '0 0 400 700';
const SKIN = '#f6d8c2';
const HAIR = '#3b3750';
const CLOTH = '#2f6f9f';
const CLOTH_DARK = '#255a82';
const LINE = '#2b2430';
const MOUTH_IN = '#8c4a52';

const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="400" height="700">\n${body}\n</svg>\n`;

// --- 体と頭（口と目は含まない） ---
const body = wrap(`
  <g stroke="${LINE}" stroke-width="4" stroke-linejoin="round">
    <path d="M60 700 V600 q0-70 70-92 l70-22 h0 l70 22 q70 22 70 92 V700 Z" fill="${CLOTH}"/>
    <path d="M200 586 l-38 22 38 46 38-46 Z" fill="${CLOTH_DARK}"/>
    <rect x="170" y="530" width="60" height="70" rx="24" fill="${SKIN}"/>
    <ellipse cx="200" cy="330" rx="152" ry="168" fill="${SKIN}"/>
    <path d="M48 320 q0-176 152-176 t152 176 q-24-40-56-52 q-96 40-192 0 q-32 12-56 52 Z" fill="${HAIR}"/>
  </g>
  <ellipse cx="118" cy="386" rx="26" ry="16" fill="#f0a9a0" opacity="0.55"/>
  <ellipse cx="282" cy="386" rx="26" ry="16" fill="#f0a9a0" opacity="0.55"/>
`);

// --- 表情（目と眉） ---
const eyes = {
  normal: `
    <g fill="${LINE}">
      <ellipse cx="140" cy="336" rx="15" ry="21"/>
      <ellipse cx="260" cy="336" rx="15" ry="21"/>
    </g>
    <g stroke="${LINE}" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M116 292 q24-12 48-2"/>
      <path d="M284 292 q-24-12-48-2"/>
    </g>`,
  happy: `
    <g stroke="${LINE}" stroke-width="11" stroke-linecap="round" fill="none">
      <path d="M120 342 q20-26 40 0"/>
      <path d="M240 342 q20-26 40 0"/>
      <path d="M114 286 q26-14 52-4"/>
      <path d="M286 286 q-26-14-52-4"/>
    </g>`,
  think: `
    <g fill="${LINE}">
      <ellipse cx="140" cy="332" rx="14" ry="19"/>
      <ellipse cx="260" cy="332" rx="14" ry="19"/>
    </g>
    <g stroke="${LINE}" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M114 300 q26-20 52 -6"/>
      <path d="M286 282 q-26-4-52 6"/>
    </g>`,
};

// --- 口の形（母音ごと） ---
const mouthShape = (rx, ry) =>
  `<ellipse cx="200" cy="446" rx="${rx}" ry="${ry}" fill="${MOUTH_IN}" stroke="${LINE}" stroke-width="4"/>`;

const mouths = {
  a: mouthShape(30, 36),
  i: mouthShape(38, 11),
  u: mouthShape(17, 21),
  e: mouthShape(32, 22),
  o: mouthShape(23, 30),
  // n = 閉じた口
  n: `<path d="M172 446 q28 12 56 0" fill="none" stroke="${LINE}" stroke-width="6" stroke-linecap="round"/>`,
};

mkdirSync(OUT, {recursive: true});
writeFileSync(join(OUT, 'body.svg'), body);
for (const [name, svg] of Object.entries(eyes)) {
  writeFileSync(join(OUT, `eyes-${name}.svg`), wrap(svg));
}
for (const [name, svg] of Object.entries(mouths)) {
  writeFileSync(join(OUT, `mouth-${name}.svg`), wrap(svg));
}
console.log(`placeholder assets: ${1 + Object.keys(eyes).length + Object.keys(mouths).length} files -> public/char/`);
