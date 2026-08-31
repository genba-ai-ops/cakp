import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Emotion, LipsyncEvent, Mouth} from './types';

/** 現在フレームで有効な口の形（最後に切り替わったもの）を引く */
const mouthAt = (lipsync: LipsyncEvent[], frame: number): Mouth => {
  let mouth: Mouth = 'n';
  for (const event of lipsync) {
    if (event.frame > frame) break;
    mouth = event.mouth;
  }
  return mouth;
};

export const Character: React.FC<{
  lipsync: LipsyncEvent[];
  emotion: Emotion;
}> = ({lipsync, emotion}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mouth = mouthAt(lipsync, frame);

  // 呼吸に相当する上下の揺れ。止まっていると人形に見えるので必ず入れる。
  const bob = Math.sin((frame / fps) * 2 * Math.PI * 0.35) * 8;
  // まばたきは 4 秒周期で 3 フレームだけ閉じる
  const blinkPhase = frame % Math.round(fps * 4);
  const isBlinking = blinkPhase < 3;

  const layer: React.CSSProperties = {position: 'absolute', inset: 0};

  return (
    <AbsoluteFill
      style={{
        left: 'auto',
        right: 60,
        bottom: -40,
        top: 'auto',
        width: 620,
        height: 1085,
        transform: `translateY(${bob}px)`,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <Img src={staticFile('char/body.svg')} style={{...layer, width: '100%', height: '100%'}} />
        {isBlinking ? null : (
          <Img src={staticFile(`char/eyes-${emotion}.svg`)} style={{...layer, width: '100%', height: '100%'}} />
        )}
        <Img src={staticFile(`char/mouth-${mouth}.svg`)} style={{...layer, width: '100%', height: '100%'}} />
      </div>
    </AbsoluteFill>
  );
};
