import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Knowledge = Database['public']['Tables']['knowledge_base']['Row']
type KnowledgeInsert = Database['public']['Tables']['knowledge_base']['Insert']
type KnowledgeUpdate = Database['public']['Tables']['knowledge_base']['Update']

export class KnowledgeAPI {
  private getSupabase() {
    return createClient()
  }

  async getAll(filters?: {
    status?: string
    category_id?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = this.getSupabase()
      .from('knowledge_base')
      .select(`
        *,
        categories (
          id,
          name
        ),
        users!created_by (
          id,
          name
        )
      `)
      .order('updated_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters?.search) {
      query = query.textSearch('search_text', filters.search)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch knowledge: ${error.message}`)
    }

    return data || []
  }

  async getById(id: string) {
    const { data, error } = await this.getSupabase()
      .from('knowledge_base')
      .select(`
        *,
        categories (
          id,
          name
        ),
        users!created_by (
          id,
          name
        ),
        knowledge_tags (
          tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch knowledge: ${error.message}`)
    }

    return data
  }

  async create(knowledge: KnowledgeInsert) {
    const { data, error } = await this.getSupabase()
      .from('knowledge_base')
      .insert(knowledge)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create knowledge: ${error.message}`)
    }

    return data
  }

  async update(id: string, knowledge: KnowledgeUpdate) {
    const { data, error } = await this.getSupabase()
      .from('knowledge_base')
      .update(knowledge)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update knowledge: ${error.message}`)
    }

    return data
  }

  async delete(id: string) {
    const { error } = await this.getSupabase()
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete knowledge: ${error.message}`)
    }

    return true
  }

  async search(query: string, options?: {
    limit?: number
    useSemanticSearch?: boolean
  }) {
    // Full-text search implementation
    const { data, error } = await this.getSupabase()
      .from('knowledge_base')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .textSearch('search_text', query)
      .eq('status', 'published')
      .limit(options?.limit || 20)

    if (error) {
      throw new Error(`Failed to search knowledge: ${error.message}`)
    }

    return data || []
  }

  async incrementViewCount(id: string) {
    const { error } = await this.getSupabase()
      .rpc('increment_view_count', { knowledge_id: id })

    if (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  async incrementUseCount(id: string) {
    const { error } = await this.getSupabase()
      .rpc('increment_use_count', { knowledge_id: id })

    if (error) {
      console.error('Failed to increment use count:', error)
    }
  }
}