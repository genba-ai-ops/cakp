/**
 * 台本の各シーンを音声に変換し、口パク用のタイミングを書き出す。
 *
 *   VOICEVOX モード … VOICEVOX ENGINE が起動していれば実音声を合成する。
 *                     audio_query が返すモーラ情報から、何秒目にどの母音かを厳密に取り出す。
 *   dummy モード   … VOICEVOX が居なければ、同じ長さの無音とかな推定の口パクを作る。
 *                     映像・字幕・尺の確認はこれだけで通しでできる。
 *
 * ナレーション本文が変わっていないシーンは再合成しない（.cache/synth.json で判定）。
 */
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseScript} from './parse-script.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'public', 'audio');
const CACHE_FILE = join(ROOT, '.cache', 'synth.json');
const VOICEVOX_URL = process.env.VOICEVOX_URL ?? 'http://localhost:50021';
const FORCE_DUMMY = process.argv.includes('--dummy');
const FORCE_ALL = process.argv.includes('--force');

const SAMPLE_RATE = 24000;

// ---------------------------------------------------------------- かな → 母音

const KANA_ROWS = {
  a: 'あかさたなはまやらわがざだばぱぁゃゎ',
  i: 'いきしちにひみりゐぎじぢびぴぃ',
  u: 'うくすつぬふむゆるぐずづぶぷぅゅ',
  e: 'えけせてねへめれゑげぜでべぺぇ',
  o: 'おこそとのほもよろをごぞどぼぽぉょ',
};
const KANA_TO_VOWEL = new Map();
for (const [vowel, chars] of Object.entries(KANA_ROWS)) {
  for (const ch of chars) KANA_TO_VOWEL.set(ch, vowel);
  // カタカナも同じ母音に落とす
  for (const ch of chars) {
    KANA_TO_VOWEL.set(String.fromCodePoint(ch.codePointAt(0) + 0x60), vowel);
  }
}
const PAUSE_CHARS = {'、': 0.25, '。': 0.45, '，': 0.25, '．': 0.45, '？': 0.45, '！': 0.45, '　': 0.2};
const SMALL_KANA = 'ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ';

const MORA_CONSONANT = 0.045;
const MORA_VOWEL = 0.095;

/** かな主体のテキストから、母音とその長さを推定する（dummy モード用） */
function estimateMoras(text) {
  const moras = [];
  const cycle = ['a', 'i', 'u', 'e', 'o'];
  let cycleIndex = 0;

  for (const ch of text) {
    if (PAUSE_CHARS[ch] !== undefined) {
      moras.push({vowel: 'pau', consonantLength: 0, vowelLength: PAUSE_CHARS[ch]});
      continue;
    }
    if (ch === 'ー' || ch === '〜') {
      const prev = moras[moras.length - 1];
      if (prev) prev.vowelLength += MORA_VOWEL;
      continue;
    }
    if (ch === 'っ' || ch === 'ッ') {
      moras.push({vowel: 'N', consonantLength: 0, vowelLength: 0.07});
      continue;
    }
    if (ch === 'ん' || ch === 'ン') {
      moras.push({vowel: 'N', consonantLength: 0, vowelLength: MORA_VOWEL});
      continue;
    }
    if (SMALL_KANA.includes(ch)) {
      // 拗音は直前のモーラの母音を上書きするだけで、新しいモーラは作らない
      const prev = moras[moras.length - 1];
      const vowel = KANA_TO_VOWEL.get(ch);
      if (prev && vowel) prev.vowel = vowel;
      continue;
    }
    const vowel = KANA_TO_VOWEL.get(ch);
    if (vowel) {
      moras.push({vowel, consonantLength: MORA_CONSONANT, vowelLength: MORA_VOWEL});
      continue;
    }
    if (/\s/.test(ch)) continue;
    // 漢字・英数字など読みが分からない文字は母音を循環させて口を動かす
    moras.push({vowel: cycle[cycleIndex++ % cycle.length], consonantLength: MORA_CONSONANT, vowelLength: MORA_VOWEL});
  }
  return moras;
}

// ---------------------------------------------------------------- WAV

function writeSilentWav(path, seconds) {
  const frames = Math.max(1, Math.round(seconds * SAMPLE_RATE));
  const dataSize = frames * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  writeFileSync(path, buf);
}

/** WAV ヘッダから実際の再生秒数を読む（合成結果を信頼する） */
function wavDuration(buf) {
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  let offset = 12;
  let byteRate = null;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'fmt ') byteRate = buf.readUInt32LE(offset + 16);
    if (id === 'data' && byteRate) return size / byteRate;
    offset += 8 + size + (size % 2);
  }
  return null;
}

// ---------------------------------------------------------------- VOICEVOX

async function voicevoxAvailable() {
  if (FORCE_DUMMY) return false;
  try {
    const res = await fetch(`${VOICEVOX_URL}/version`, {signal: AbortSignal.timeout(1500)});
    return res.ok;
  } catch {
    return false;
  }
}

async function synthesizeWithVoicevox(text, speaker) {
  const queryRes = await fetch(`${VOICEVOX_URL}/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`, {
    method: 'POST',
  });
  if (!queryRes.ok) throw new Error(`audio_query に失敗しました (${queryRes.status})`);
  const query = await queryRes.json();

  query.speedScale = Number(process.env.VOICEVOX_SPEED ?? 1.0);
  query.outputSamplingRate = SAMPLE_RATE;

  const synthRes = await fetch(`${VOICEVOX_URL}/synthesis?speaker=${speaker}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(query),
  });
  if (!synthRes.ok) throw new Error(`synthesis に失敗しました (${synthRes.status})`);
  const wav = Buffer.from(await synthRes.arrayBuffer());

  // audio_query のモーラ情報をそのまま口パクに使う
  const moras = [];
  for (const phrase of query.accent_phrases) {
    for (const m of phrase.moras) {
      moras.push({vowel: m.vowel, consonantLength: m.consonant_length ?? 0, vowelLength: m.vowel_length});
    }
    if (phrase.pause_mora) {
      moras.push({vowel: 'pau', consonantLength: 0, vowelLength: phrase.pause_mora.vowel_length});
    }
  }
  return {wav, moras, query};
}

// ---------------------------------------------------------------- 口パク

/**
 * モーラ列を「フレーム番号 → 口の形」の切り替え列に変換する。
 * 同じ口が続く区間はまとめるので、映像側は最後に切り替わった形を引くだけでよい。
 */
function morasToLipsync(moras, {fps, offset = 0, scale = 1}) {
  const events = [];
  let t = offset;
  const push = (time, mouth) => {
    const frame = Math.max(0, Math.round(time * scale * fps));
    const last = events[events.length - 1];
    if (last && last.mouth === mouth) return;
    if (last && last.frame === frame) {
      last.mouth = mouth;
      return;
    }
    events.push({frame, mouth});
  };

  push(0, 'n');
  for (const m of moras) {
    const vowel = String(m.vowel ?? '').toLowerCase();
    // 子音の区間は口を閉じ気味に、母音の区間で母音の形にする
    if (m.consonantLength > 0) {
      push(t, 'n');
      t += m.consonantLength;
    }
    const mouth = ['a', 'i', 'u', 'e', 'o'].includes(vowel) ? vowel : 'n';
    push(t, mouth);
    t += m.vowelLength;
  }
  push(t, 'n');
  return {events, end: t};
}

// ---------------------------------------------------------------- main

async function main() {
  const fps = Number(process.env.FPS ?? 30);
  const scenes = parseScript(join(ROOT, 'script.md'));
  mkdirSync(AUDIO_DIR, {recursive: true});
  mkdirSync(dirname(CACHE_FILE), {recursive: true});

  const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {};
  const useVoicevox = await voicevoxAvailable();
  console.log(
    useVoicevox
      ? `VOICEVOX モード (${VOICEVOX_URL})`
      : 'dummy モード（VOICEVOX ENGINE が見つからないため、無音と推定口パクで組み立てます）'
  );

  const next = {};
  for (const scene of scenes) {
    const wavPath = join(AUDIO_DIR, `${scene.id}.wav`);
    const mode = useVoicevox ? `voicevox:${scene.speaker}` : 'dummy';
    const hash = createHash('sha256').update(`${mode}\n${scene.narration}`).digest('hex').slice(0, 16);

    if (!FORCE_ALL && cache[scene.id]?.hash === hash && existsSync(wavPath)) {
      next[scene.id] = cache[scene.id];
      console.log(`  = ${scene.id} 変更なし（スキップ）`);
      continue;
    }

    let duration;
    let lipsync;
    if (useVoicevox) {
      const {wav, moras, query} = await synthesizeWithVoicevox(scene.narration, scene.speaker);
      writeFileSync(wavPath, wav);
      const actual = wavDuration(wav);
      const speed = query.speedScale || 1;
      const pre = (query.prePhonemeLength ?? 0.1) / speed;
      const raw = morasToLipsync(moras, {fps: 1, offset: pre, scale: 1 / speed});
      const post = (query.postPhonemeLength ?? 0.1) / speed;
      const predicted = raw.end + post;
      // 実際の wav 長に合わせて微調整し、長い文でもズレが蓄積しないようにする
      const scale = actual && predicted > 0 ? actual / predicted : 1;
      duration = actual ?? predicted;
      lipsync = morasToLipsync(moras, {fps, offset: pre, scale: scale / speed}).events;
    } else {
      const moras = estimateMoras(scene.narration);
      const {end} = morasToLipsync(moras, {fps: 1});
      duration = end + 0.2;
      writeSilentWav(wavPath, duration);
      lipsync = morasToLipsync(moras, {fps}).events;
    }

    next[scene.id] = {hash, mode, duration, lipsync};
    console.log(`  + ${scene.id} ${duration.toFixed(2)}s / 口パク ${lipsync.length} 点`);
  }

  writeFileSync(CACHE_FILE, JSON.stringify(next, null, 2));
  const total = Object.values(next).reduce((s, v) => s + v.duration, 0);
  console.log(`合計 ${total.toFixed(1)} 秒 (${scenes.length} シーン)`);
}

main().catch((err) => {
  console.error(`\n[synth] ${err.message}`);
  process.exit(1);
});
