# デプロイメント手順

## Vercelへのデプロイ

### 1. GitHubリポジトリの作成

1. GitHubで新しいリポジトリを作成
2. ローカルリポジトリをプッシュ:

```bash
git remote add origin https://github.com/your-username/cakp.git
git branch -M main
git push -u origin main
```

### 2. Vercelでのプロジェクト設定

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン
3. 「Import Project」をクリック
4. CAKPリポジトリを選択
5. 以下の環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクト作成
2. SQL Editorで `supabase/schema.sql` を実行
3. API設定から必要な認証情報を取得

### 4. 環境変数の設定

Vercelの「Settings」→「Environment Variables」で以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-claude-api-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 5. デプロイの実行

環境変数設定後、Vercelが自動的にビルドとデプロイを実行します。

## ローカル開発環境のセットアップ

1. `.env.local`ファイルを作成し、環境変数を設定
2. 依存関係をインストール: `npm install`
3. 開発サーバーを起動: `npm run dev`

## 注意事項

- Supabaseでデータベーススキーマを先に作成してください
- Claude APIキーは有効なものを使用してください
- 本番環境では適切なRLSポリシーを設定してください