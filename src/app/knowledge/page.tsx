export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ナレッジベース</h1>
          <p className="text-gray-600">問題解決のための知識を検索・管理</p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90">
          新規作成
        </button>
      </div>
      
      <div className="rounded-lg border bg-white p-4">
        <input
          type="text"
          placeholder="キーワードで検索..."
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-6 hover:shadow-md">
            <h3 className="mb-2 text-lg font-semibold">ナレッジタイトル {i}</h3>
            <p className="mb-4 text-gray-600">
              これはナレッジの概要です。問題解決のための詳細な手順が記載されています。
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">カテゴリー</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">タグ</span>
              </div>
              <span className="text-sm text-gray-500">更新: 2日前</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}