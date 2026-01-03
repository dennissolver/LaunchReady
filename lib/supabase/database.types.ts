// Database types - auto-generated from Supabase
// Run: npm run db:generate to update from your Supabase schema

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
      projects: {
        Row: {
          id: string
          founder_id: string
          name: string
          status: 'idea' | 'building' | 'mvp' | 'launched'
          description: string | null
          problem_statement: string | null
          target_users: string | null
          earliest_evidence: string | null
          first_public_disclosure: string | null
          patent_deadline_au: string | null
          patent_deadline_us: string | null
          discovery_completed: boolean
          discovery_completed_at: string | null
          target_jurisdictions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          name: string
          status?: 'idea' | 'building' | 'mvp' | 'launched'
          description?: string | null
          problem_statement?: string | null
          target_users?: string | null
          earliest_evidence?: string | null
          first_public_disclosure?: string | null
          patent_deadline_au?: string | null
          patent_deadline_us?: string | null
          discovery_completed?: boolean
          discovery_completed_at?: string | null
          target_jurisdictions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          name?: string
          status?: 'idea' | 'building' | 'mvp' | 'launched'
          description?: string | null
          problem_statement?: string | null
          target_users?: string | null
          earliest_evidence?: string | null
          first_public_disclosure?: string | null
          patent_deadline_au?: string | null
          patent_deadline_us?: string | null
          discovery_completed?: boolean
          discovery_completed_at?: string | null
          target_jurisdictions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      protection_items: {
        Row: {
          id: string
          project_id: string
          item_type: 'trademark' | 'patent' | 'domain' | 'copyright' | 'design' | 'ip_assignment' | 'trade_secret' | 'business_registration'
          item_name: string
          jurisdiction: string | null
          status: 'registered' | 'pending' | 'not_started' | 'urgent' | 'expired' | 'na' | 'available'
          application_number: string | null
          registration_number: string | null
          filing_date: string | null
          registration_date: string | null
          expiry_date: string | null
          renewal_date: string | null
          deadline_date: string | null
          days_remaining: number | null
          next_step: string | null
          estimated_cost: number | null
          collaborator_id: string | null
          external_source: string | null
          external_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['protection_items']['Row'], 'id' | 'created_at' | 'updated_at' | 'days_remaining'>
        Update: Partial<Database['public']['Tables']['protection_items']['Insert']>
      }
      evidence_events: {
        Row: {
          id: string
          project_id: string
          source: string
          event_type: string
          event_title: string
          event_description: string | null
          event_timestamp: string
          captured_at: string
          capture_method: 'realtime' | 'backfill' | 'manual'
          source_verified: boolean
          is_public_disclosure: boolean
          source_url: string | null
          source_id: string | null
          metadata: Json | null
          file_hash: string | null
          blockchain_tx: string | null
          blockchain_timestamp: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['evidence_events']['Row'], 'id' | 'created_at' | 'captured_at'>
        Update: Partial<Database['public']['Tables']['evidence_events']['Insert']>
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          service: string
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          api_key_encrypted: string | null
          service_user_id: string | null
          service_username: string | null
          service_email: string | null
          backfill_status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'not_applicable'
          last_backfill_at: string | null
          backfill_error: string | null
          webhook_id: string | null
          webhook_secret: string | null
          scopes: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['integrations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['integrations']['Insert']>
      }
      collaborators: {
        Row: {
          id: string
          project_id: string
          name: string
          email: string | null
          github_username: string | null
          role: 'founder' | 'co-founder' | 'contributor' | 'contractor' | 'employee'
          ip_assigned: boolean
          ip_assignment_date: string | null
          ip_assignment_document_id: string | null
          discovered_from: string | null
          discovered_at: string
          first_contribution_at: string | null
          contribution_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['collaborators']['Row'], 'id' | 'created_at' | 'updated_at' | 'discovered_at'>
        Update: Partial<Database['public']['Tables']['collaborators']['Insert']>
      }
      assets: {
        Row: {
          id: string
          project_id: string
          uploaded_by: string
          filename: string
          original_filename: string
          mime_type: string
          size_bytes: number
          storage_path: string
          storage_bucket: string
          category: 'brand' | 'product' | 'pitch' | 'legal' | 'ip_filing' | 'financial' | 'technical' | 'evidence' | 'other'
          subcategory: string | null
          source: 'upload' | 'generated' | 'auto_exported' | 'integration'
          uploaded_at: string
          asset_created_at: string | null
          version: number
          parent_asset_id: string | null
          is_current_version: boolean
          hash_sha256: string | null
          blockchain_tx: string | null
          blockchain_timestamp: string | null
          description: string | null
          tags: Json
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at' | 'uploaded_at'>
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      data_rooms: {
        Row: {
          id: string
          project_id: string
          created_by: string
          name: string
          description: string | null
          template: 'seed' | 'series_a' | 'ip_diligence' | 'acquisition' | 'custom' | null
          share_link: string
          password_hash: string | null
          require_email: boolean
          require_nda: boolean
          nda_text: string | null
          allow_downloads: boolean
          watermark_enabled: boolean
          expires_at: string | null
          is_active: boolean
          asset_ids: string[]
          include_ip_report: boolean
          include_evidence_timeline: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['data_rooms']['Row'], 'id' | 'created_at' | 'updated_at' | 'share_link'>
        Update: Partial<Database['public']['Tables']['data_rooms']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          user_type: 'founder' | 'inventor' | 'creator' | 'lawyer' | 'investor' | 'other' | null
          onboarding_completed: boolean
          onboarding_step: number
          default_jurisdiction: string
          notification_email: boolean
          notification_deadlines: boolean
          plan: 'free' | 'pro' | 'team'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          user_type?: 'founder' | 'inventor' | 'creator' | 'lawyer' | 'investor' | 'other' | null
          onboarding_completed?: boolean
          onboarding_step?: number
          default_jurisdiction?: string
          notification_email?: boolean
          notification_deadlines?: boolean
          plan?: 'free' | 'pro' | 'team'
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
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
