export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: 'operator' | 'senior' | 'supervisor' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      knowledge_base: {
        Row: {
          id: string
          title: string
          category_id: string
          content: Json
          metadata: Json
          embedding: number[] | null
          search_text: string | null
          status: 'draft' | 'pending' | 'published' | 'archived'
          view_count: number
          use_count: number
          created_by: string
          approved_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          expires_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['knowledge_base']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count' | 'use_count'>
        Update: Partial<Database['public']['Tables']['knowledge_base']['Insert']>
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
      }
      knowledge_tags: {
        Row: {
          knowledge_id: string
          tag_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_tags']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['knowledge_tags']['Insert']>
      }
      call_logs: {
        Row: {
          id: string
          operator_id: string
          customer_id: string | null
          transcript: string | null
          summary: string | null
          metadata: Json
          duration: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['call_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['call_logs']['Insert']>
      }
      knowledge_usage: {
        Row: {
          id: string
          knowledge_id: string
          call_log_id: string | null
          operator_id: string
          used_at: string
          helpful: boolean | null
        }
        Insert: Omit<Database['public']['Tables']['knowledge_usage']['Row'], 'id' | 'used_at'>
        Update: Partial<Database['public']['Tables']['knowledge_usage']['Insert']>
      }
      knowledge_feedback: {
        Row: {
          id: string
          knowledge_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_feedback']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['knowledge_feedback']['Insert']>
      }
      approval_workflows: {
        Row: {
          id: string
          knowledge_id: string
          requested_by: string
          approved_by: string | null
          status: 'pending' | 'approved' | 'rejected'
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['approval_workflows']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['approval_workflows']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}