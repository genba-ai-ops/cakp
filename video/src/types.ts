export type Mouth = 'a' | 'i' | 'u' | 'e' | 'o' | 'n';
export type Emotion = 'normal' | 'happy' | 'think';

export type LipsyncEvent = {frame: number; mouth: Mouth};
export type Subtitle = {text: string; from: number; durationInFrames: number};

export type SceneData = {
  id: string;
  title: string;
  bullets: string[];
  emotion: Emotion;
  audio: string;
  durationInFrames: number;
  lipsync: LipsyncEvent[];
  subtitles: Subtitle[];
};

export type Bgm = {
  /** public/ からの相対パス */
  file: string;
  /** 0..1。ナレーションを邪魔しない範囲に抑える */
  volume: number;
};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  /** public/bgm.* があれば build-timeline が入れる。無ければ null */
  bgm: Bgm | null;
  scenes: SceneData[];
};

/** 配色はここだけ変えれば全体に効く */
export const theme = {
  bg: '#0f172a',
  bgAccent: '#15213b',
  panel: 'rgba(255,255,255,0.04)',
  accent: '#38bdf8',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  subtitleBg: 'rgba(2,6,23,0.82)',
  fontFamily:
    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "IPAGothic",' +
    ' "Noto Sans CJK JP", system-ui, sans-serif',
};
