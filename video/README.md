# 解説動画スターター（キャラクター × スライド）

台本を書き換えてビルドし直すだけで、キャラクターがスライドを解説する動画が出てくる構成です。
動画編集ソフトを使わず、すべてコードとデータで組み立てるので、Claude Code に「3 枚目のナレーションを直して」と
頼むだけで差分修正が完結します。

```
script.md ──▶ synth.mjs ──▶ build-timeline.mjs ──▶ Remotion ──▶ out/video.mp4
  台本         音声 + 口パク      尺と字幕の確定         映像の組み立て
```

## 使い方

```bash
cd video
npm install
npm run build     # 素材生成 → 音声合成 → タイムライン生成
npm run studio    # ブラウザでプレビュー（ホットリロード）
npm run render    # out/video.mp4 を書き出す
```

`npm run build` は VOICEVOX ENGINE が起動していなければ **dummy モード**で動きます。
無音の音声とかなから推定した口パクが入るので、VOICEVOX を用意する前でも
レイアウト・尺・字幕の流れを通しで確認できます。

## 実際の音声を入れる（VOICEVOX）

```bash
docker run -d -p 50021:50021 voicevox/voicevox_engine:cpu-ubuntu20.04-latest
npm run synth     # 自動で VOICEVOX モードに切り替わる
npm run timeline
npm run render
```

VOICEVOX の `audio_query` は、それぞれの音がどの母音で何秒続くのかを返します。
`scripts/synth.mjs` はこれをそのまま口パクに使うので、音量から推定する方式と違って
口の動きが音とずれません。

環境変数で調整できます。

| 変数 | 既定値 | 説明 |
| --- | --- | --- |
| `VOICEVOX_URL` | `http://localhost:50021` | ENGINE の場所 |
| `VOICEVOX_SPEAKER` | `3` | 既定の話者 ID（シーンごとに `speaker:` で上書き可） |
| `VOICEVOX_SPEED` | `1.0` | 読み上げ速度 |
| `FPS` | `30` | フレームレート |

## 台本の書き方（`script.md`）

```markdown
## scene-01
### スライドのタイトル
- 箇条書き
- 箇条書き
emotion: happy
speaker: 3
> ナレーション本文。複数行に分けて書くと連結されます。
> 句点で区切られた単位が、そのまま字幕の 1 行になります。
```

- `emotion` は `normal` / `happy` / `think`
- 1 シーンは 15〜30 秒（およそ 100〜200 文字）に収めると聞きやすくなります
- ナレーション本文が変わっていないシーンは再合成されません（`npm run synth -- --force` で全再合成）

## 素材を差し替える

`public/char/` の中身を自分の立ち絵に置き換えてください。ファイル名と画角（`viewBox="0 0 400 700"` 相当）を
そろえておけば、コードの変更は不要です。

| ファイル | 役割 |
| --- | --- |
| `body.svg` | 体と頭（目・口を含まない） |
| `eyes-normal.svg` / `eyes-happy.svg` / `eyes-think.svg` | 表情 |
| `mouth-a.svg` … `mouth-o.svg` | 母音ごとの口 |
| `mouth-n.svg` | 閉じた口（子音と無音の区間で使われる） |

PNG を使う場合は同名で `.png` を置き、`src/Character.tsx` の拡張子を変えるだけです。
`npm run assets` はプレースホルダーを作り直すコマンドなので、差し替え後は実行しないでください
（`npm run build` ではなく `npm run synth && npm run timeline` を使ってください）。

配色とフォントは `src/types.ts` の `theme` にまとまっています。

## ファイルの役割

| パス | 役割 |
| --- | --- |
| `script.md` | 台本。基本ここだけ触る |
| `scripts/parse-script.mjs` | 台本のパース（行番号つきでエラーを出す） |
| `scripts/synth.mjs` | 音声合成と口パクデータの生成 |
| `scripts/build-timeline.mjs` | 尺と字幕を確定して `src/timeline.json` に出力 |
| `src/Explainer.tsx` | 全シーンの連結と進捗バー |
| `src/Scene.tsx` | 1 シーン（スライド + キャラ + 字幕 + 音声） |
| `src/Slide.tsx` | スライドの見た目 |
| `src/Character.tsx` | 立ち絵・口パク・まばたき・呼吸の揺れ |
| `src/Subtitle.tsx` | 字幕 |

## ライセンスの注意

VOICEVOX は無料で使えますが、**クレジット表記が必要**で、キャラクターごとに利用規約が異なります。
音声ライブラリと立ち絵素材はライセンスが別々なことが多いので、動画を公開する前に必ず確認してください。
`public/char/` に入っているのは、このリポジトリで生成した差し替え前提のプレースホルダーです。

## BGM を付ける（Gemini API / Lyria）

`GEMINI_API_KEY` を環境に設定したうえで:

```bash
npm run bgm:list    # 使える音楽モデルを確認
npm run bgm         # public/bgm.mp3 を生成
npm run timeline    # BGM を検出してタイムラインに反映
npm run render
```

`public/bgm.mp3`（.wav / .m4a / .ogg も可）があれば `build-timeline` が自動で検出し、
動画全体に 1 本だけ敷かれます。無ければ BGM 無しで組み立てられるので、
用意しないまま `npm run build` しても壊れません。

自分で用意した音源を使う場合も、`public/bgm.mp3` に置くだけで同じように乗ります。

### 音量

既定は `0.08`（ナレーションより約 -22dB）です。**ここを上げすぎると声が埋もれます。**

```bash
BGM_VOLUME=0.05 npm run timeline
```

前後 1.5 秒は自動でフェードイン・アウトします。

### プロンプト

既定では「ナレーションの下に敷くための、控えめなインストゥルメンタル」を指示しています。
変えたいときは環境変数で上書きします。

```bash
BGM_PROMPT="Gentle acoustic guitar, warm and optimistic, instrumental, seamless loop" npm run bgm
```

30 秒程度のクリップをループさせる前提なので、`BGM_MODEL` で短いクリップ用モデルを
指定したほうが安く済みます。利用できるモデル名は `npm run bgm:list` で確認してください。

### 権利関係の注意

- Lyria の出力について **Google は所有権を主張しません**（Google Cloud Service Specific Terms §20(a)）。
- ただし Imagen や Veo と違い、**Lyria は Google の著作権免責（indemnification）の対象外**です。
  [対象サービス一覧](https://cloud.google.com/terms/generative-ai-indemnified-services) に Lyria は無く、
  プレビュー版は Pre-GA Offerings Terms §5(b) で明文的に免責対象外とされています。
- 出力には **SynthID の電子透かし**が入ります。除去しないでください。
- 収益化する動画やクライアント納品物に使う場合は、上記を踏まえて判断してください。

## 1 枚だけ確認する

フル書き出しは時間がかかるので、レイアウトの確認は静止画で済ませると速いです。

```bash
npm run still                       # out/still.png（60 フレーム目）
npx remotion still Explainer out/s.png --frame=900   # 任意のフレーム
```
