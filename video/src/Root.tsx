import React from 'react';
import {Composition} from 'remotion';
import {Explainer} from './Explainer';
import timelineJson from './timeline.json';
import type {SceneData, Timeline} from './types';

const timeline = timelineJson as Timeline;
const totalFrames = timeline.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Explainer"
    component={Explainer}
    durationInFrames={Math.max(1, totalFrames)}
    fps={timeline.fps}
    width={timeline.width}
    height={timeline.height}
    defaultProps={{scenes: timeline.scenes as SceneData[]}}
  />
);
