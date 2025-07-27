'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoriesAPI } from '@/lib/api/categories'
import { KnowledgeAPI } from '@/lib/api/knowledge'

interface KnowledgeFormProps {
  knowledgeId?: string
  onSave?: (knowledge: any) => void
  onCancel?: () => void
}

export function KnowledgeForm({ knowledgeId, onSave, onCancel }: KnowledgeFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    content: {
      body: '',
      summary: '',
      steps: [],
      keywords: '',
    },
    status: 'draft' as 'draft' | 'pending' | 'published' | 'archived',
  })

  const categoriesAPI = new CategoriesAPI()
  const knowledgeAPI = new KnowledgeAPI()

  useEffect(() => {
    loadCategories()
    if (knowledgeId) {
      loadKnowledge()
    }
  }, [knowledgeId])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadKnowledge = async () => {
    if (!knowledgeId) return
    
    try {
      setLoading(true)
      const knowledge = await knowledgeAPI.getById(knowledgeId)
      setFormData({
        title: knowledge.title,
        category_id: knowledge.category_id,
        content: knowledge.content,
        status: knowledge.status,
      })
    } catch (error) {
      console.error('Failed to load knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const knowledgeData = {
        ...formData,
        created_by: 'temp-user-id', // TODO: Get from auth context
        metadata: {},
        search_text: null,
        embedding: null,
        approved_by: null,
        published_at: null,
        expires_at: null,
      }

      let result
      if (knowledgeId) {
        result = await knowledgeAPI.update(knowledgeId, knowledgeData)
      } else {
        result = await knowledgeAPI.create(knowledgeData)
      }

      onSave?.(result)
    } catch (error) {
      console.error('Failed to save knowledge:', error)
      alert('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      }
    }))
  }

  if (loading && knowledgeId) {
    return <div className="flex justify-center p-8">読み込み中...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="ナレッジのタイトルを入力"
          />
        </div>

        <div>
          <Label htmlFor="category">カテゴリー</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリーを選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="summary">概要</Label>
          <Textarea
            id="summary"
            value={formData.content.summary}
            onChange={(e) => handleContentChange('summary', e.target.value)}
            placeholder="ナレッジの概要を入力"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="body">詳細内容</Label>
          <Textarea
            id="body"
            value={formData.content.body}
            onChange={(e) => handleContentChange('body', e.target.value)}
            placeholder="詳細な手順や説明を入力"
            rows={10}
            required
          />
        </div>

        <div>
          <Label htmlFor="keywords">キーワード</Label>
          <Input
            id="keywords"
            value={formData.content.keywords}
            onChange={(e) => handleContentChange('keywords', e.target.value)}
            placeholder="検索用キーワード（カンマ区切り）"
          />
        </div>

        <div>
          <Label htmlFor="status">ステータス</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'pending' | 'published' | 'archived' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="pending">承認待ち</SelectItem>
              <SelectItem value="published">公開</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}