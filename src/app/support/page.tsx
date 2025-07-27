'use client'

// Force dynamic rendering to avoid build errors with missing env vars
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AIAPI } from '@/lib/api/ai'
import { KnowledgeAPI } from '@/lib/api/knowledge'
import { Lightbulb, Copy, ThumbsUp, ThumbsDown, Search, User, Bot } from 'lucide-react'

export default function SupportPage() {
  const [customerQuery, setCustomerQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    id: 'C12345',
    name: '鈴木花子',
    plan: 'プレミアムプラン',
    lastContact: '2024/07/20'
  })

  const aiAPI = new AIAPI()
  const knowledgeAPI = new KnowledgeAPI()

  const handleGenerateResponse = async () => {
    if (!customerQuery.trim()) return

    setLoading(true)
    try {
      // Add customer message to conversation
      const newMessage = {
        role: 'customer' as const,
        message: customerQuery,
        timestamp: new Date().toISOString()
      }
      setConversation(prev => [...prev, newMessage])

      // Search for relevant knowledge
      const searchResults = await knowledgeAPI.search(customerQuery, { limit: 5 })
      setSearchResults(searchResults)

      // Generate AI response
      const response = await aiAPI.generateResponse({
        query: customerQuery,
        context: {
          customer_id: customerInfo.id,
          conversation_history: [...conversation, newMessage]
        }
      })

      setAiResponse(response)
    } catch (error) {
      console.error('Failed to generate response:', error)
      alert('AI回答の生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUseResponse = () => {
    if (!aiResponse) return

    const operatorMessage = {
      role: 'operator' as const,
      message: aiResponse.suggested_response,
      timestamp: new Date().toISOString()
    }
    setConversation(prev => [...prev, operatorMessage])
    setCustomerQuery('')
    setAiResponse(null)
  }

  const handleCopyResponse = async () => {
    if (!aiResponse?.suggested_response) return
    
    try {
      await navigator.clipboard.writeText(aiResponse.suggested_response)
      alert('クリップボードにコピーしました')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Customer Information Panel */}
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">顧客情報</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">顧客ID</label>
              <p className="text-sm">{customerInfo.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">氏名</label>
              <p className="text-sm">{customerInfo.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">契約プラン</label>
              <p className="text-sm">{customerInfo.plan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">前回問合せ</label>
              <p className="text-sm">{customerInfo.lastContact}</p>
            </div>
          </div>
        </div>

        {/* Related Knowledge */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">関連ナレッジ</h2>
          <div className="space-y-3">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500">問い合わせを入力すると関連ナレッジが表示されます</p>
            ) : (
              searchResults.map((knowledge) => (
                <div
                  key={knowledge.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.open(`/knowledge/${knowledge.id}`, '_blank')}
                >
                  <h4 className="font-medium text-sm">{knowledge.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{knowledge.categories?.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Search className="w-4 h-4 mr-2" />
              ナレッジ検索
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              エスカレーション
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              対応完了
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              フォローアップ設定
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Conversation History */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">対話履歴</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.length === 0 ? (
              <p className="text-gray-500 text-center py-8">対話履歴はありません</p>
            ) : (
              conversation.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'operator' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'operator' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'customer' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {message.role === 'customer' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'customer' ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Query Input */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">顧客の問い合わせ</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="顧客の問い合わせ内容を入力してください..."
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleGenerateResponse} 
              disabled={loading || !customerQuery.trim()}
              className="w-full"
            >
              {loading ? 'AI回答生成中...' : 'AI回答を生成'}
            </Button>
          </div>
        </div>

        {/* AI Response Panel */}
        {aiResponse && (
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">AI推奨回答</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">信頼度:</span>
                <span className={`text-sm font-medium ${getConfidenceColor(aiResponse.confidence)}`}>
                  {Math.round(aiResponse.confidence * 100)}%
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="whitespace-pre-wrap">{aiResponse.suggested_response}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUseResponse} className="flex-1">
                この回答を使用
              </Button>
              <Button variant="outline" onClick={handleCopyResponse}>
                <Copy className="w-4 h-4 mr-2" />
                コピー
              </Button>
              <Button variant="outline" size="icon">
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>

            {aiResponse.relevant_knowledge.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">参考にしたナレッジ:</h3>
                <div className="space-y-1">
                  {aiResponse.relevant_knowledge.map((knowledge: any) => (
                    <div key={knowledge.id} className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {knowledge.title} ({knowledge.category})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}