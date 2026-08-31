import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Character} from './Character';
import {Slide} from './Slide';
import {Subtitles} from './Subtitle';
import {theme} from './types';
import type {SceneData} from './types';

export const Scene: React.FC<{scene: SceneData}> = ({scene}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 120% at 15% 0%, ${theme.bgAccent} 0%, ${theme.bg} 60%)`,
    }}
  >
    <Slide title={scene.title} bullets={scene.bullets} />
    <Character lipsync={scene.lipsync} emotion={scene.emotion} />
    <Subtitles subtitles={scene.subtitles} />
    <Audio src={staticFile(scene.audio)} />
  </AbsoluteFill>
);
