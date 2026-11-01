import React from 'react';
import {Audio, interpolate, staticFile, useVideoConfig} from 'remotion';

/**
 * BGM は Explainer の最上位に 1 本だけ置く。
 * シーンごとに置くと切り替わるたびに頭から鳴り直して不自然になる。
 *
 * volume はナレーションより十分低く（既定 0.08 ≒ -22dB）。
 * ここを下げ忘れると声が埋もれる。
 */
export const BackgroundMusic: React.FC<{src: string; volume: number}> = ({src, volume}) => {
  const {durationInFrames, fps} = useVideoConfig();
  const fade = Math.round(fps * 1.5);

  return (
    <Audio
      src={staticFile(src)}
      loop
      volume={(frame) =>
        interpolate(
          frame,
          [0, fade, Math.max(fade + 1, durationInFrames - fade), durationInFrames],
          [0, volume, volume, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        )
      }
    />
  );
};
