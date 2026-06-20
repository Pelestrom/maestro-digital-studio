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
      about_content: {
        Row: {
          biography: string | null
          hero_photos: Json
          id: string
          is_available: boolean
          profile_photo: string | null
          updated_at: string
        }
        Insert: {
          biography?: string | null
          hero_photos?: Json
          id?: string
          is_available?: boolean
          profile_photo?: string | null
          updated_at?: string
        }
        Update: {
          biography?: string | null
          hero_photos?: Json
          id?: string
          is_available?: boolean
          profile_photo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          badge_url: string | null
          id: string
          issuer: string
          link: string | null
          name: string
          sort_order: number
          year: number | null
        }
        Insert: {
          badge_url?: string | null
          id?: string
          issuer: string
          link?: string | null
          name: string
          sort_order?: number
          year?: number | null
        }
        Update: {
          badge_url?: string | null
          id?: string
          issuer?: string
          link?: string | null
          name?: string
          sort_order?: number
          year?: number | null
        }
        Relationships: []
      }
      experience: {
        Row: {
          company: string | null
          description: string | null
          id: string
          role: string
          sort_order: number
          year: string
        }
        Insert: {
          company?: string | null
          description?: string | null
          id?: string
          role: string
          sort_order?: number
          year: string
        }
        Update: {
          company?: string | null
          description?: string | null
          id?: string
          role?: string
          sort_order?: number
          year?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          country_code: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          is_read: boolean
          message: string
          name: string
          project_type: string | null
          source_page: string | null
          status: Database["public"]["Enums"]["message_status"]
          whatsapp: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          is_read?: boolean
          message: string
          name: string
          project_type?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          whatsapp?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          is_read?: boolean
          message?: string
          name?: string
          project_type?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          whatsapp?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          client: string | null
          cover_image: string | null
          cover_position: string
          created_at: string
          description: string | null
          gallery_images: Json
          id: string
          is_featured: boolean
          is_published: boolean
          slug: string
          sort_order: number
          tags: string[] | null
          title: string
          tools: string[] | null
          year: number | null
        }
        Insert: {
          category: string
          client?: string | null
          cover_image?: string | null
          cover_position?: string
          created_at?: string
          description?: string | null
          gallery_images?: Json
          id?: string
          is_featured?: boolean
          is_published?: boolean
          slug: string
          sort_order?: number
          tags?: string[] | null
          title: string
          tools?: string[] | null
          year?: number | null
        }
        Update: {
          category?: string
          client?: string | null
          cover_image?: string | null
          cover_position?: string
          created_at?: string
          description?: string | null
          gallery_images?: Json
          id?: string
          is_featured?: boolean
          is_published?: boolean
          slug?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          tools?: string[] | null
          year?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          id: string
          level: number
          name: string
          sort_order: number
        }
        Insert: {
          category: string
          id?: string
          level: number
          name: string
          sort_order?: number
        }
        Update: {
          category?: string
          id?: string
          level?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          client_name: string
          company: string | null
          created_at: string
          id: string
          is_visible: boolean
          quote: string
          rating: number
          sort_order: number
        }
        Insert: {
          avatar_url?: string | null
          client_name: string
          company?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          quote: string
          rating?: number
          sort_order?: number
        }
        Update: {
          avatar_url?: string | null
          client_name?: string
          company?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          quote?: string
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      tools: {
        Row: {
          brand_color: string | null
          description: string | null
          icon_svg: string | null
          icon_url: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          brand_color?: string | null
          description?: string | null
          icon_svg?: string | null
          icon_url?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          brand_color?: string | null
          description?: string | null
          icon_svg?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      message_status: "new" | "read" | "in_progress" | "replied" | "archived"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
      message_status: ["new", "read", "in_progress", "replied", "archived"],
    },
  },
} as const
