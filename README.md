# CAKP - CallCenter AI Knowledge Platform

コールセンター向けAI知識管理プラットフォーム

## 機能

- **ダッシュボード**: 統計情報とパフォーマンス指標
- **ナレッジベース**: 問題解決のための知識管理
- **AI回答支援**: Claude APIを使用したリアルタイム回答提案
- **対話支援**: 通話中のリアルタイム支援
- **承認ワークフロー**: ナレッジの品質管理
- **レポート**: 詳細な分析とレポート

## 技術スタック

- **フロントエンド**: Next.js 14, TypeScript, Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **認証**: Supabase Auth
- **デプロイ**: Vercel

## 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## ライセンス

MIT License