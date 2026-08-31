import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from './types';

export const Slide: React.FC<{title: string; bullets: string[]}> = ({title, bullets}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleIn = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});

  return (
    <AbsoluteFill style={{padding: '110px 700px 220px 110px', fontFamily: theme.fontFamily}}>
      <div
        style={{
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
        }}
      >
        <div style={{width: 96, height: 8, borderRadius: 4, background: theme.accent, marginBottom: 28}} />
        <h1 style={{fontSize: 76, lineHeight: 1.25, margin: 0, color: theme.text, fontWeight: 800}}>{title}</h1>
      </div>

      <ul style={{listStyle: 'none', padding: 0, margin: '56px 0 0'}}>
        {bullets.map((bullet, i) => {
          const enter = spring({
            frame: frame - 14 - i * 9,
            fps,
            config: {damping: 200},
            durationInFrames: 20,
          });
          return (
            <li
              key={bullet}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 22,
                marginBottom: 30,
                opacity: enter,
                transform: `translateX(${interpolate(enter, [0, 1], [-32, 0])}px)`,
              }}
            >
              <span
                style={{
                  flex: 'none',
                  marginTop: 16,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: theme.accent,
                }}
              />
              <span style={{fontSize: 42, lineHeight: 1.5, color: theme.textDim, fontWeight: 600}}>{bullet}</span>
            </li>
          );
        })}
      </ul>
    </AbsoluteFill>
  );
};
