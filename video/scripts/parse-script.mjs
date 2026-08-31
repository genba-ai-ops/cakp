import {readFileSync} from 'node:fs';

const SCENE_RE = /^##\s+([A-Za-z0-9_-]+)\s*$/;
const TITLE_RE = /^###\s+(.*\S)\s*$/;
const BULLET_RE = /^-\s+(.*\S)\s*$/;
const KEY_RE = /^([a-z]+)\s*:\s*(.*\S)\s*$/;
const NARRATION_RE = /^>\s?(.*)$/;

const VALID_EMOTIONS = ['normal', 'happy', 'think'];

/**
 * script.md を シーンの配列に変換する。
 * 先頭の説明文（最初の `## <id>` より前）はすべて無視される。
 */
export function parseScript(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const scenes = [];
  let current = null;

  lines.forEach((line, i) => {
    const lineNo = i + 1;
    const scene = SCENE_RE.exec(line);
    if (scene) {
      current = {
        id: scene[1],
        title: '',
        bullets: [],
        emotion: 'normal',
        speaker: Number(process.env.VOICEVOX_SPEAKER ?? 3),
        narration: '',
        line: lineNo,
      };
      if (scenes.some((s) => s.id === current.id)) {
        throw new Error(`script.md:${lineNo} シーン id "${current.id}" が重複しています`);
      }
      scenes.push(current);
      return;
    }

    // 最初のシーンより前の行（書式の説明など）は読み飛ばす
    if (!current) return;
    if (line.trim() === '') return;

    const title = TITLE_RE.exec(line);
    if (title) {
      current.title = title[1];
      return;
    }

    const bullet = BULLET_RE.exec(line);
    if (bullet) {
      current.bullets.push(bullet[1]);
      return;
    }

    const narration = NARRATION_RE.exec(line);
    if (narration) {
      current.narration += narration[1].trim();
      return;
    }

    const key = KEY_RE.exec(line);
    if (key) {
      const [, name, value] = key;
      if (name === 'emotion') {
        if (!VALID_EMOTIONS.includes(value)) {
          throw new Error(
            `script.md:${lineNo} emotion は ${VALID_EMOTIONS.join(' / ')} のいずれかにしてください（"${value}"）`
          );
        }
        current.emotion = value;
      } else if (name === 'speaker') {
        const n = Number(value);
        if (!Number.isInteger(n)) {
          throw new Error(`script.md:${lineNo} speaker は整数で指定してください（"${value}"）`);
        }
        current.speaker = n;
      } else {
        throw new Error(`script.md:${lineNo} 未知のキー "${name}" です`);
      }
      return;
    }

    throw new Error(`script.md:${lineNo} 解釈できない行です: ${line}`);
  });

  if (scenes.length === 0) {
    throw new Error('script.md にシーンが 1 つもありません（"## scene-01" のような見出しが必要です）');
  }
  for (const s of scenes) {
    if (!s.title) throw new Error(`script.md:${s.line} シーン "${s.id}" にスライドタイトル（### 見出し）がありません`);
    if (!s.narration) throw new Error(`script.md:${s.line} シーン "${s.id}" にナレーション（> で始まる行）がありません`);
  }
  return scenes;
}
