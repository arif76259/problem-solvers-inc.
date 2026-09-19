export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          country: string | null
          created_at: string
          device: string | null
          event_name: string
          id: number
          path: string | null
          properties: Json
          session_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device?: string | null
          event_name: string
          id?: number
          path?: string | null
          properties?: Json
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device?: string | null
          event_name?: string
          id?: number
          path?: string | null
          properties?: Json
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          name: string
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
        }
        Relationships: []
      }
      early_customer_registrations: {
        Row: {
          admin_notes: string | null
          age_range: string | null
          campaign_id: string
          consent: boolean
          created_at: string
          discovered_via: string | null
          email: string
          full_name: string
          id: string
          location: string
          main_problem: string | null
          occupation: string | null
          phone: string
          price_range: string | null
          product_interest: string | null
          referrer: string | null
          registration_code: string
          source: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          age_range?: string | null
          campaign_id: string
          consent?: boolean
          created_at?: string
          discovered_via?: string | null
          email: string
          full_name: string
          id?: string
          location: string
          main_problem?: string | null
          occupation?: string | null
          phone: string
          price_range?: string | null
          product_interest?: string | null
          referrer?: string | null
          registration_code: string
          source?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          age_range?: string | null
          campaign_id?: string
          consent?: boolean
          created_at?: string
          discovered_via?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: string
          main_problem?: string | null
          occupation?: string | null
          phone?: string
          price_range?: string | null
          product_interest?: string | null
          referrer?: string | null
          registration_code?: string
          source?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "early_customer_registrations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      insights: {
        Row: {
          body: string | null
          category: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          read_minutes: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          admin_notes: string | null
          category: Database["public"]["Enums"]["lead_category"]
          company: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          product_id: string | null
          referrer: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          subject: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["lead_category"]
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          product_id?: string | null
          referrer?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["lead_category"]
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          product_id?: string | null
          referrer?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      product_feedback: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string
          email: string
          experience: string | null
          feature_requests: string | null
          id: string
          improvements: string | null
          media_urls: string[]
          name: string
          problems: string | null
          product_id: string | null
          rating: number
          registration_code: string | null
          status: Database["public"]["Enums"]["feedback_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string
          email: string
          experience?: string | null
          feature_requests?: string | null
          id?: string
          improvements?: string | null
          media_urls?: string[]
          name: string
          problems?: string | null
          product_id?: string | null
          rating: number
          registration_code?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          feature_requests?: string | null
          id?: string
          improvements?: string | null
          media_urls?: string[]
          name?: string
          problems?: string | null
          product_id?: string | null
          rating?: number
          registration_code?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_feedback_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_relations: {
        Row: {
          product_id: string
          related_product_id: string
        }
        Insert: {
          product_id: string
          related_product_id: string
        }
        Update: {
          product_id?: string
          related_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          author_location: string | null
          author_name: string
          body: string
          cohort_number: number | null
          created_at: string
          id: string
          is_published: boolean
          product_id: string | null
          rating: number
          tested_days: number | null
        }
        Insert: {
          author_location?: string | null
          author_name: string
          body: string
          cohort_number?: number | null
          created_at?: string
          id?: string
          is_published?: boolean
          product_id?: string | null
          rating: number
          tested_days?: number | null
        }
        Update: {
          author_location?: string | null
          author_name?: string
          body?: string
          cohort_number?: number | null
          created_at?: string
          id?: string
          is_published?: boolean
          product_id?: string | null
          rating?: number
          tested_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          faqs: Json
          id: string
          images: string[]
          is_featured: boolean
          is_published: boolean
          key_features: string[]
          launch_window: string | null
          name: string
          price_bdt: number | null
          price_note: string | null
          problem_solved: string | null
          serial_ref: string | null
          slug: string
          sort_order: number
          source_country: string | null
          specifications: Json
          stage: Database["public"]["Enums"]["product_stage"]
          stage_label: string | null
          tagline: string | null
          updated_at: string
          videos: string[]
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          faqs?: Json
          id?: string
          images?: string[]
          is_featured?: boolean
          is_published?: boolean
          key_features?: string[]
          launch_window?: string | null
          name: string
          price_bdt?: number | null
          price_note?: string | null
          problem_solved?: string | null
          serial_ref?: string | null
          slug: string
          sort_order?: number
          source_country?: string | null
          specifications?: Json
          stage?: Database["public"]["Enums"]["product_stage"]
          stage_label?: string | null
          tagline?: string | null
          updated_at?: string
          videos?: string[]
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          faqs?: Json
          id?: string
          images?: string[]
          is_featured?: boolean
          is_published?: boolean
          key_features?: string[]
          launch_window?: string | null
          name?: string
          price_bdt?: number | null
          price_note?: string | null
          problem_solved?: string | null
          serial_ref?: string | null
          slug?: string
          sort_order?: number
          source_country?: string | null
          specifications?: Json
          stage?: Database["public"]["Enums"]["product_stage"]
          stage_label?: string | null
          tagline?: string | null
          updated_at?: string
          videos?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          key: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          _bucket: string
          _key: string
          _limit: number
          _window_seconds: number
        }
        Returns: boolean
      }
      get_campaign_stats: {
        Args: { _slug: string }
        Returns: {
          capacity: number
          claimed: number
          status: Database["public"]["Enums"]["campaign_status"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      campaign_status: "draft" | "active" | "closed"
      feedback_status: "new" | "reviewed" | "actioned" | "archived"
      lead_category:
        | "early_customer"
        | "general_customer"
        | "b2b_lead"
        | "distributor"
        | "retailer"
        | "manufacturer"
        | "partnership"
        | "media"
        | "investor"
      lead_status: "new" | "contacted" | "qualified" | "closed" | "archived"
      product_stage:
        | "research"
        | "concept"
        | "prototype"
        | "testing"
        | "early_access"
        | "launching_soon"
        | "available"
        | "sold_out"
        | "discontinued"
      registration_status: "pending" | "approved" | "waitlisted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
      campaign_status: ["draft", "active", "closed"],
      feedback_status: ["new", "reviewed", "actioned", "archived"],
      lead_category: [
        "early_customer",
        "general_customer",
        "b2b_lead",
        "distributor",
        "retailer",
        "manufacturer",
        "partnership",
        "media",
        "investor",
      ],
      lead_status: ["new", "contacted", "qualified", "closed", "archived"],
      product_stage: [
        "research",
        "concept",
        "prototype",
        "testing",
        "early_access",
        "launching_soon",
        "available",
        "sold_out",
        "discontinued",
      ],
      registration_status: ["pending", "approved", "waitlisted", "rejected"],
    },
  },
} as const
