# 🤖 CAKP - CallCenter AI Knowledge Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/cakp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

コールセンター向けAI知識管理プラットフォーム - オペレーターの業務を支援し、顧客対応品質を向上させるWebアプリケーション

## ✨ 機能

### 🎯 主要機能
- **📊 ダッシュボード**: リアルタイム統計とKPI表示
- **📚 ナレッジベース**: 直感的な知識作成・管理・検索システム
- **🤖 AI回答支援**: Claude APIによるリアルタイム回答提案
- **💬 対話支援**: 通話中の統合オペレーター支援画面
- **🔍 高度検索**: 全文検索とセマンティック検索
- **📈 使用分析**: ナレッジ活用状況の自動追跡

### 🛠 技術的特徴
- **TypeScript完全対応**: 型安全性とコード品質
- **レスポンシブデザイン**: モバイル・タブレット対応
- **リアルタイムAI**: 最新Claude APIとの統合
- **セキュアな認証**: Row Level Security対応

## 🏗 技術スタック

### フロントエンド
- **Next.js 15** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - 高品質UIコンポーネント
- **Radix UI** - アクセシブルなプリミティブ

### バックエンド
- **Supabase** - PostgreSQL + リアルタイム機能
- **Row Level Security** - データベースレベルのセキュリティ
- **Anthropic Claude API** - AI回答生成

### インフラ・デプロイ
- **Vercel** - 自動デプロイとホスティング
- **GitHub Actions** - CI/CDパイプライン

## 🚀 クイックスタート

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/cakp.git
cd cakp
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成：
```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# アプリケーション設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. データベースのセットアップ
1. [Supabase](https://supabase.com)でプロジェクト作成
2. SQL Editorで`supabase/schema.sql`を実行
3. API設定から認証情報を取得

### 5. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📖 詳細なセットアップガイド

### Supabaseプロジェクトの作成
1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. 「New project」をクリック
3. プロジェクト名: `cakp-production`
4. データベースパスワードを設定
5. リージョンを選択（日本の場合: Northeast Asia (Tokyo)）

### データベーススキーマの適用
```sql
-- Supabase SQL Editorで実行
-- ファイル: supabase/schema.sql の内容をコピー&ペースト
```

### Claude APIキーの取得
1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. APIキーを生成
3. `.env.local`に設定

## 🔄 開発ワークフロー

### ブランチ戦略
```bash
main           # 本番環境
├── develop    # 開発統合ブランチ
├── feature/*  # 機能開発ブランチ
└── hotfix/*   # 緊急修正ブランチ
```

### 推奨開発フロー
1. Issueを作成（機能要求・バグ報告）
2. `feature/issue-number-description`ブランチを作成
3. 開発・テスト・コミット
4. Pull Requestを作成
5. コードレビュー・マージ

## 🚢 デプロイメント

### Vercelへのデプロイ
1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Import Project」→ GitHubリポジトリを選択
3. 環境変数を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ANTHROPIC_API_KEY
   NEXT_PUBLIC_APP_URL
   ```
4. 「Deploy」をクリック

### 本番環境での設定
- カスタムドメインの設定
- SSL証明書の自動更新
- パフォーマンス監視の設定

## 📋 利用可能なスクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLintチェック
npm run type-check # TypeScriptチェック
```

## 🗂 プロジェクト構造

```
cakp/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # ダッシュボード
│   │   ├── knowledge/       # ナレッジベース
│   │   ├── support/         # 対話支援
│   │   └── api/            # API Routes
│   ├── components/          # Reactコンポーネント
│   │   ├── ui/             # 基本UIコンポーネント
│   │   ├── layout/         # レイアウトコンポーネント
│   │   └── knowledge/      # ナレッジ関連コンポーネント
│   ├── lib/                # ユーティリティ・API
│   │   ├── api/            # APIクライアント
│   │   └── supabase/       # Supabase設定
│   └── types/              # TypeScript型定義
├── supabase/
│   └── schema.sql          # データベーススキーマ
└── public/                 # 静的ファイル
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## 🙏 謝辞

- [Anthropic Claude](https://www.anthropic.com/) - AI回答生成
- [Supabase](https://supabase.com/) - バックエンドサービス
- [Vercel](https://vercel.com/) - ホスティングプラットフォーム
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**