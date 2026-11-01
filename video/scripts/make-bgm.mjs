/**
 * Gemini API (Lyria) で解説動画用の BGM を生成する。
 *
 *   node scripts/make-bgm.mjs --list     … 利用できる音楽モデルを調べる
 *   node scripts/make-bgm.mjs            … public/bgm.* を生成する
 *
 * 必要な環境変数: GEMINI_API_KEY
 *
 * Lyria のリクエスト形式はプレビュー中で変わりうるので、決め打ちせずに
 * まず models エンドポイントで対応メソッドを調べ、それに合わせて呼び分ける。
 * 失敗したときは Google が返したエラー本文をそのまま表示する（推測で握りつぶさない）。
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const KEY = process.env.GEMINI_API_KEY;

const MODEL = process.env.BGM_MODEL ?? 'lyria-3.5';
const WANT_WAV = process.argv.includes('--wav');

/** 解説動画の下に敷くための指示。声を邪魔しないことを明示するのが肝心。 */
const DEFAULT_PROMPT = [
  'Calm minimal lo-fi background music for a software tutorial video.',
  'Soft electric piano and warm analog pads, gentle steady beat around 80 BPM.',
  'Completely instrumental, no vocals, no melody that draws attention.',
  'Must sit quietly underneath a spoken narration. Even dynamics, no sudden',
  'builds, drops or silences. Seamless loop.',
].join(' ');

const prompt = process.env.BGM_PROMPT ?? DEFAULT_PROMPT;

function requireKey() {
  if (!KEY) {
    console.error(
      '\n[bgm] GEMINI_API_KEY が設定されていません。\n' +
        '      環境のシークレットに GEMINI_API_KEY を追加してから、新しいセッションで再実行してください。\n'
    );
    process.exit(1);
  }
}

async function api(path, init) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {'x-goog-api-key': KEY, 'Content-Type': 'application/json', ...(init?.headers ?? {})},
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path} -> HTTP ${res.status}\n${text}`);
  }
  return JSON.parse(text);
}

/** 音楽モデルとその対応メソッドを一覧する */
async function list() {
  requireKey();
  const all = [];
  let pageToken = '';
  do {
    const data = await api(`/models?pageSize=200${pageToken ? `&pageToken=${pageToken}` : ''}`);
    all.push(...(data.models ?? []));
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);

  const music = all.filter((m) => /lyria|music/i.test(`${m.name} ${m.displayName ?? ''}`));
  if (music.length === 0) {
    console.log(`音楽モデルは見つかりませんでした（全 ${all.length} モデル中）。`);
    console.log('このアカウント／リージョンで Lyria が有効でない可能性があります。');
    return;
  }
  for (const m of music) {
    console.log(`\n${m.name}`);
    console.log(`  表示名: ${m.displayName ?? '-'}`);
    console.log(`  対応メソッド: ${(m.supportedGenerationMethods ?? []).join(', ') || '-'}`);
    if (m.description) console.log(`  説明: ${m.description}`);
  }
}

/** レスポンスから音声データを取り出す（返り方が複数あるため広めに探す） */
function extractAudio(data) {
  const candidates = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    const inline = node.inlineData ?? node.inline_data;
    if (inline?.data) candidates.push({mimeType: inline.mimeType ?? inline.mime_type ?? '', data: inline.data});
    if (typeof node.audioData === 'string') candidates.push({mimeType: node.mimeType ?? '', data: node.audioData});
    Object.values(node).forEach(walk);
  };
  walk(data);
  return candidates.find((c) => /audio|mpeg|wav/i.test(c.mimeType)) ?? candidates[0] ?? null;
}

const EXT = {'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/L16': 'wav'};

async function generate() {
  requireKey();

  // どう呼べばよいかをモデル情報から判断する
  let methods = [];
  try {
    const info = await api(`/models/${MODEL}`);
    methods = info.supportedGenerationMethods ?? [];
    console.log(`モデル ${MODEL} / 対応メソッド: ${methods.join(', ') || '(不明)'}`);
  } catch (err) {
    console.error(`[警告] モデル情報を取得できませんでした:\n${err.message}\n`);
    console.error('--list で利用可能な音楽モデルを確認してください。');
    process.exit(1);
  }

  const body = {
    contents: [{parts: [{text: prompt}]}],
    generationConfig: {
      responseModalities: ['AUDIO'],
      ...(WANT_WAV ? {audioConfig: {audioEncoding: 'LINEAR16'}} : {}),
    },
  };

  console.log(`\nプロンプト:\n  ${prompt}\n`);
  const data = await api(`/models/${MODEL}:generateContent`, {method: 'POST', body: JSON.stringify(body)});

  const audio = extractAudio(data);
  if (!audio) {
    console.error('応答に音声データが含まれていませんでした。生の応答:');
    console.error(JSON.stringify(data, null, 2).slice(0, 4000));
    process.exit(1);
  }

  const ext = EXT[audio.mimeType] ?? (WANT_WAV ? 'wav' : 'mp3');
  const out = join(PUBLIC, `bgm.${ext}`);
  mkdirSync(PUBLIC, {recursive: true});
  const buf = Buffer.from(audio.data, 'base64');
  writeFileSync(out, buf);
  console.log(`public/bgm.${ext} を書き出しました (${(buf.length / 1024).toFixed(0)} KB, ${audio.mimeType})`);
  console.log('続けて `npm run timeline && npm run render` で動画に乗ります。');
  console.log('\n注意: 出力には SynthID の電子透かしが入ります。除去しないでください。');
}

const run = process.argv.includes('--list') ? list : generate;
run().catch((err) => {
  console.error(`\n[bgm] ${err.message}`);
  process.exit(1);
});
