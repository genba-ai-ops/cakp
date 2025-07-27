'use client'

// Force dynamic rendering to avoid build errors with missing env vars
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { KnowledgeAPI } from '@/lib/api/knowledge'
import { Edit, Eye, ThumbsUp, Share2 } from 'lucide-react'

export default function KnowledgeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [knowledge, setKnowledge] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const knowledgeAPI = new KnowledgeAPI()

  useEffect(() => {
    loadKnowledge()
  }, [params.id])

  const loadKnowledge = async () => {
    try {
      setLoading(true)
      const data = await knowledgeAPI.getById(params.id as string)
      setKnowledge(data)
      
      // Increment view count
      await knowledgeAPI.incrementViewCount(params.id as string)
    } catch (error) {
      console.error('Failed to load knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/knowledge/${params.id}/edit`)
  }

  const handleUse = async () => {
    try {
      await knowledgeAPI.incrementUseCount(params.id as string)
      // Update local state
      setKnowledge((prev: any) => ({
        ...prev,
        use_count: prev.use_count + 1
      }))
    } catch (error) {
      console.error('Failed to increment use count:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!knowledge) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ナレッジが見つかりません</h1>
        <Button onClick={() => router.push('/knowledge')}>
          ナレッジ一覧に戻る
        </Button>
      </div>
    )
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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{knowledge.title}</h1>
            {getStatusBadge(knowledge.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>カテゴリー: {knowledge.categories?.name}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {knowledge.view_count} 回閲覧
            </span>
            <span>作成者: {knowledge.users?.name}</span>
            <span>更新: {new Date(knowledge.updated_at).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleUse}>
            <ThumbsUp className="w-4 h-4 mr-1" />
            使用 ({knowledge.use_count})
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            共有
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-1" />
            編集
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {knowledge.content.summary && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-3">概要</h2>
            <p className="text-gray-700">{knowledge.content.summary}</p>
          </div>
        )}

        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-3">詳細内容</h2>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{knowledge.content.body}</div>
          </div>
        </div>

        {knowledge.content.keywords && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-3">キーワード</h2>
            <div className="flex flex-wrap gap-2">
              {knowledge.content.keywords.split(',').map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {knowledge.knowledge_tags && knowledge.knowledge_tags.length > 0 && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-3">タグ</h2>
            <div className="flex flex-wrap gap-2">
              {knowledge.knowledge_tags.map((tagRelation: any, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: tagRelation.tags.color + '20',
                    color: tagRelation.tags.color,
                  }}
                >
                  {tagRelation.tags.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}