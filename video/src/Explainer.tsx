import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from './Scene';
import {theme} from './types';
import type {SceneData} from './types';

/** 全体の進捗バー。Sequence の外にあるので通し再生のフレームを見る。 */
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'rgba(148,163,184,0.18)'}}>
      <div
        style={{
          height: '100%',
          width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
          background: theme.accent,
        }}
      />
    </div>
  );
};

export const Explainer: React.FC<{scenes: SceneData[]}> = ({scenes}) => {
  let offset = 0;
  return (
    <AbsoluteFill style={{backgroundColor: theme.bg}}>
      {scenes.map((scene) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames} name={scene.id}>
            <Scene scene={scene} />
          </Sequence>
        );
      })}
      <Progress />
    </AbsoluteFill>
  );
};
