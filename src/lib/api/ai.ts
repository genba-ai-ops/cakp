export interface AIResponseRequest {
  query: string
  context?: {
    customer_id?: string
    customer_query?: string
    conversation_history?: Array<{
      role: 'customer' | 'operator'
      message: string
      timestamp: string
    }>
  }
  knowledgeIds?: string[]
}

export interface AIResponseResult {
  suggested_response: string
  confidence: number
  relevant_knowledge: Array<{
    id: string
    title: string
    category?: string
  }>
}

export class AIAPI {
  async generateResponse(request: AIResponseRequest): Promise<AIResponseResult> {
    const response = await fetch('/api/ai/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Failed to generate AI response')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate AI response')
    }

    return data.data
  }

  async generateSummary(text: string): Promise<string> {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate summary')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate summary')
    }

    return data.data.summary
  }

  async analyzeIntent(query: string): Promise<{
    intent: string
    entities: Record<string, string>
    confidence: number
  }> {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze intent')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to analyze intent')
    }

    return data.data
  }
}