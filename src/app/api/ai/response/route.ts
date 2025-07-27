import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { KnowledgeAPI } from '@/lib/api/knowledge'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { query, context, knowledgeIds } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const knowledgeAPI = new KnowledgeAPI()
    
    // Search for relevant knowledge
    let relevantKnowledge = []
    if (knowledgeIds && knowledgeIds.length > 0) {
      // Use specific knowledge if provided
      for (const id of knowledgeIds) {
        try {
          const knowledge = await knowledgeAPI.getById(id)
          relevantKnowledge.push(knowledge)
        } catch (error) {
          console.error(`Failed to fetch knowledge ${id}:`, error)
        }
      }
    } else {
      // Search for relevant knowledge based on query
      relevantKnowledge = await knowledgeAPI.search(query, { limit: 5 })
    }

    // Prepare context for Claude
    const knowledgeContext = relevantKnowledge
      .map(k => `
タイトル: ${k.title}
カテゴリー: ${k.categories?.name || 'なし'}
内容: ${k.content.body}
キーワード: ${k.content.keywords || 'なし'}
`)
      .join('\n---\n')

    const systemPrompt = `あなたはコールセンターのオペレーターを支援するAIアシスタントです。

以下のナレッジベースの情報を参考に、顧客の問い合わせに対する適切な回答を提案してください。

利用可能なナレッジ:
${knowledgeContext}

回答の際は以下を心がけてください：
- 丁寧で分かりやすい日本語で回答する
- ナレッジベースの情報を正確に伝える
- 不明な点がある場合は、適切な担当部署への案内を提案する
- 顧客の気持ちに寄り添った対応を心がける`

    const userPrompt = `
顧客の問い合わせ: ${query}

${context ? `追加の文脈情報:
顧客ID: ${context.customer_id || '不明'}
これまでの会話履歴: ${context.conversation_history ? JSON.stringify(context.conversation_history) : 'なし'}` : ''}

この問い合わせに対する適切な回答を提案してください。`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const suggestedResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    // Calculate confidence score based on knowledge relevance
    const confidence = relevantKnowledge.length > 0 ? 0.85 : 0.5

    return NextResponse.json({
      success: true,
      data: {
        suggested_response: suggestedResponse,
        confidence,
        relevant_knowledge: relevantKnowledge.map(k => ({
          id: k.id,
          title: k.title,
          category: k.categories?.name,
        })),
      },
    })
  } catch (error) {
    console.error('AI response generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}