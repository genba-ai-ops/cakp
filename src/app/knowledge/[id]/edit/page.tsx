'use client'

// Force dynamic rendering to avoid build errors with missing env vars
export const dynamic = 'force-dynamic'

import { useParams, useRouter } from 'next/navigation'
import { KnowledgeForm } from '@/components/knowledge/knowledge-form'

export default function EditKnowledgePage() {
  const params = useParams()
  const router = useRouter()

  const handleSave = (knowledge: any) => {
    router.push(`/knowledge/${knowledge.id}`)
  }

  const handleCancel = () => {
    router.push(`/knowledge/${params.id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ナレッジ編集</h1>
        <p className="text-gray-600">ナレッジを編集します</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KnowledgeForm
          knowledgeId={params.id as string}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}