import {Config} from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');

// Chrome を自動ダウンロードできない環境（CI やネットワーク制限下）向けの逃げ道。
// 例: BROWSER_EXECUTABLE=/path/to/headless_shell npm run render
if (process.env.BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.BROWSER_EXECUTABLE);
}
