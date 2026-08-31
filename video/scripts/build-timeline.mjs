/**
 * 台本 + 合成結果（.cache/synth.json）を、映像側が読むだけで済む形にまとめる。
 * ここで尺が確定するので、映像側は音声の長さを測る必要がない。
 */
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseScript} from './parse-script.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_FILE = join(ROOT, '.cache', 'synth.json');
const OUT_FILE = join(ROOT, 'src', 'timeline.json');

const FPS = Number(process.env.FPS ?? 30);
const TAIL_SECONDS = 0.4; // シーン終わりの余白（切り替えが忙しくならないように）

/** ナレーションを句点で切り、文字数の比率で表示時間を割り当てる */
function buildSubtitles(narration, durationInFrames) {
  const sentences = narration
    .split(/(?<=[。！？])/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];

  const totalChars = sentences.reduce((s, t) => s + t.length, 0);
  const subtitles = [];
  let from = 0;
  sentences.forEach((text, i) => {
    const isLast = i === sentences.length - 1;
    const span = isLast
      ? durationInFrames - from
      : Math.max(1, Math.round((text.length / totalChars) * durationInFrames));
    subtitles.push({text, from, durationInFrames: span});
    from += span;
  });
  return subtitles;
}

function main() {
  if (!existsSync(CACHE_FILE)) {
    throw new Error('.cache/synth.json がありません。先に `npm run synth` を実行してください。');
  }
  const cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  const scenes = parseScript(join(ROOT, 'script.md'));

  const timeline = scenes.map((scene) => {
    const entry = cache[scene.id];
    if (!entry) {
      throw new Error(`シーン "${scene.id}" の音声がありません。\`npm run synth\` を実行してください。`);
    }
    const durationInFrames = Math.max(1, Math.ceil((entry.duration + TAIL_SECONDS) * FPS));
    return {
      id: scene.id,
      title: scene.title,
      bullets: scene.bullets,
      emotion: scene.emotion,
      audio: `audio/${scene.id}.wav`,
      durationInFrames,
      lipsync: entry.lipsync,
      subtitles: buildSubtitles(scene.narration, durationInFrames),
    };
  });

  const total = timeline.reduce((s, x) => s + x.durationInFrames, 0);
  writeFileSync(OUT_FILE, JSON.stringify({fps: FPS, width: 1920, height: 1080, scenes: timeline}, null, 2));
  console.log(`src/timeline.json を書き出しました: ${timeline.length} シーン / ${total} フレーム (${(total / FPS).toFixed(1)}s)`);
}

try {
  main();
} catch (err) {
  console.error(`\n[timeline] ${err.message}`);
  process.exit(1);
}
