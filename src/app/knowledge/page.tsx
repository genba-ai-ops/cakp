'use client'

import { useEffect, useState } from 'react'

// Force dynamic rendering to avoid build errors with missing env vars
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeAPI } from '@/lib/api/knowledge'
import { Plus, Search, Eye } from 'lucide-react'

export default function KnowledgePage() {
  const router = useRouter()
  const [knowledgeList, setKnowledgeList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const knowledgeAPI = new KnowledgeAPI()

  useEffect(() => {
    loadKnowledge()
  }, [])

  const loadKnowledge = async () => {
    try {
      setLoading(true)
      const data = await knowledgeAPI.getAll({
        status: 'published',
        limit: 20,
      })
      setKnowledgeList(data)
    } catch (error) {
      console.error('Failed to load knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadKnowledge()
      return
    }

    try {
      setLoading(true)
      const data = await knowledgeAPI.search(searchQuery)
      setKnowledgeList(data)
    } catch (error) {
      console.error('Failed to search knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    }
    const labels = {
      draft: '下書き',
      pending: '承認待ち',
      published: '公開',
      archived: 'アーカイブ',
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ナレッジベース</h1>
          <p className="text-gray-600">問題解決のための知識を検索・管理</p>
        </div>
        <Button onClick={() => router.push('/knowledge/create')}>
          <Plus className="w-4 h-4 mr-2" />
          新規作成
        </Button>
      </div>
      
      <div className="rounded-lg border bg-white p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="キーワードで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-lg">読み込み中...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {knowledgeList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">ナレッジが見つかりませんでした</p>
            </div>
          ) : (
            knowledgeList.map((knowledge) => (
              <div
                key={knowledge.id}
                className="rounded-lg border bg-white p-6 hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => router.push(`/knowledge/${knowledge.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{knowledge.title}</h3>
                  {getStatusBadge(knowledge.status)}
                </div>
                
                {knowledge.content.summary && (
                  <p className="mb-4 text-gray-600">
                    {knowledge.content.summary}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm">
                      {knowledge.categories?.name || 'カテゴリーなし'}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      {knowledge.view_count}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    更新: {new Date(knowledge.updated_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}