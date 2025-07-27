'use client'

// Force dynamic rendering to avoid build errors with missing env vars
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { KnowledgeForm } from '@/components/knowledge/knowledge-form'

export default function CreateKnowledgePage() {
  const router = useRouter()

  const handleSave = (knowledge: any) => {
    router.push(`/knowledge/${knowledge.id}`)
  }

  const handleCancel = () => {
    router.push('/knowledge')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">新規ナレッジ作成</h1>
        <p className="text-gray-600">新しいナレッジを作成します</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KnowledgeForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  )
}