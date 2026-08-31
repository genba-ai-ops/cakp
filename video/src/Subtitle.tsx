import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {theme} from './types';
import type {Subtitle as SubtitleData} from './types';

const Line: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5], [0, 1], {extrapolateRight: 'clamp'});
  return (
    // 右側はキャラクターが立っているので、字幕はスライド側の幅の中で中央に置く
    <AbsoluteFill
      style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60, paddingRight: 640}}
    >
      <div
        style={{
          opacity,
          maxWidth: 1120,
          padding: '20px 36px',
          borderRadius: 16,
          background: theme.subtitleBg,
          border: '1px solid rgba(148,163,184,0.25)',
          color: theme.text,
          fontFamily: theme.fontFamily,
          fontSize: 38,
          lineHeight: 1.45,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{subtitles: SubtitleData[]}> = ({subtitles}) => (
  <>
    {subtitles.map((s) => (
      <Sequence key={`${s.from}-${s.text}`} from={s.from} durationInFrames={s.durationInFrames}>
        <Line text={s.text} />
      </Sequence>
    ))}
  </>
);
