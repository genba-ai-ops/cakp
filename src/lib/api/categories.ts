import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export class CategoriesAPI {
  private getSupabase() {
    return createClient()
  }

  async getAll() {
    const { data, error } = await this.getSupabase()
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return data || []
  }

  async getById(id: string) {
    const { data, error } = await this.getSupabase()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return data
  }

  async create(category: CategoryInsert) {
    const { data, error } = await this.getSupabase()
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    return data
  }

  async update(id: string, category: Partial<CategoryInsert>) {
    const { data, error } = await this.getSupabase()
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    return data
  }

  async delete(id: string) {
    const { error } = await this.getSupabase()
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`)
    }

    return true
  }
}