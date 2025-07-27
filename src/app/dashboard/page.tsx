export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-gray-600">コールセンターの統計情報とパフォーマンス指標</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">本日の対応件数</p>
              <p className="text-3xl font-bold">124</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-green-600">+12% 前日比</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均対応時間</p>
              <p className="text-3xl font-bold">3:24</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-red-600">+5% 前日比</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">解決率</p>
              <p className="text-3xl font-bold">87%</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-green-600">+3% 前日比</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI活用率</p>
              <p className="text-3xl font-bold">65%</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-green-600">+8% 前日比</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">最近の対応履歴</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">顧客ID: C0000{i}</p>
                  <p className="text-sm text-gray-600">パスワードリセットに関する問い合わせ</p>
                </div>
                <span className="text-sm text-gray-500">3分前</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">人気のナレッジ</h2>
          <div className="space-y-4">
            {[
              'パスワードリセット手順',
              '解約手続きについて',
              'プラン変更方法',
              '支払い方法の変更',
              '請求書の確認方法'
            ].map((title, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="font-medium">{title}</p>
                <span className="text-sm text-gray-500">{100 - i * 15}回</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}