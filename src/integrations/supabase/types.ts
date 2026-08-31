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
      admin_departments: {
        Row: {
          created_at: string | null
          department: string
          id: string
          is_approved: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department: string
          id?: string
          is_approved?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          is_approved?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          announcement_date: string
          category: string | null
          contact_link: string | null
          created_at: string | null
          description: string
          end_time: string | null
          id: string
          is_active: boolean | null
          location: string | null
          priority: string | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_date: string
          category?: string | null
          contact_link?: string | null
          created_at?: string | null
          description: string
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          priority?: string | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_date?: string
          category?: string | null
          contact_link?: string | null
          created_at?: string | null
          description?: string
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          priority?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_email: string | null
          author_name: string
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_slug: string
          reply_count: number | null
          thread_closed: boolean | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_slug: string
          reply_count?: number | null
          thread_closed?: boolean | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_slug?: string
          reply_count?: number | null
          thread_closed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_schedule: {
        Row: {
          activity_name: string
          activity_type: string
          created_at: string | null
          day_of_week: string
          description: string | null
          display_order: number | null
          end_time: string | null
          facilitator: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          start_time: string
          theme: string | null
          updated_at: string | null
          venue: string
        }
        Insert: {
          activity_name: string
          activity_type?: string
          created_at?: string | null
          day_of_week: string
          description?: string | null
          display_order?: number | null
          end_time?: string | null
          facilitator?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          start_time: string
          theme?: string | null
          updated_at?: string | null
          venue: string
        }
        Update: {
          activity_name?: string
          activity_type?: string
          created_at?: string | null
          day_of_week?: string
          description?: string | null
          display_order?: number | null
          end_time?: string | null
          facilitator?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          start_time?: string
          theme?: string | null
          updated_at?: string | null
          venue?: string
        }
        Relationships: []
      }
      election_candidates: {
        Row: {
          created_at: string | null
          election_id: string
          id: string
          image_url: string | null
          is_active: boolean | null
          manifesto: string | null
          name: string
          position: string
          updated_at: string | null
          votes_count: number | null
        }
        Insert: {
          created_at?: string | null
          election_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          manifesto?: string | null
          name: string
          position: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Update: {
          created_at?: string | null
          election_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          manifesto?: string | null
          name?: string
          position?: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "election_candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      election_votes: {
        Row: {
          candidate_id: string
          created_at: string | null
          election_id: string
          id: string
          voter_identifier: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          election_id: string
          id?: string
          voter_identifier: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          election_id?: string
          id?: string
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "election_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string
          registration_link: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location: string
          registration_link?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string
          registration_link?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fellowships: {
        Row: {
          capacity: number | null
          contact_link: string
          contact_person: string | null
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          location: string
          meeting_day: string
          meeting_time: string
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          contact_link: string
          contact_person?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          location: string
          meeting_day: string
          meeting_time: string
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          contact_link?: string
          contact_person?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          location?: string
          meeting_day?: string
          meeting_time?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string | null
          cta1_link: string | null
          cta1_text: string | null
          cta2_link: string | null
          cta2_text: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          subtitle: string | null
          title: string
          updated_at: string | null
          verse: string | null
          verse_ref: string | null
        }
        Insert: {
          created_at?: string | null
          cta1_link?: string | null
          cta1_text?: string | null
          cta2_link?: string | null
          cta2_text?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          verse?: string | null
          verse_ref?: string | null
        }
        Update: {
          created_at?: string | null
          cta1_link?: string | null
          cta1_text?: string | null
          cta2_link?: string | null
          cta2_text?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          verse?: string | null
          verse_ref?: string | null
        }
        Relationships: []
      }
      home_fellowships: {
        Row: {
          area: string
          contact_link: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          leader_name: string | null
          meeting_day: string
          meeting_time: string
          name: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          area: string
          contact_link?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_name?: string | null
          meeting_day: string
          meeting_time: string
          name: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          area?: string
          contact_link?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_name?: string | null
          meeting_day?: string
          meeting_time?: string
          name?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      leaders: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          position: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          position: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media_gallery: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          media_kind: string
          media_type: string
          media_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_kind?: string
          media_type: string
          media_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_kind?: string
          media_type?: string
          media_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ministries: {
        Row: {
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          joining_link: string
          leader_name: string | null
          meeting_schedule: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          joining_link: string
          leader_name?: string | null
          meeting_schedule?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          joining_link?: string
          leader_name?: string | null
          meeting_schedule?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          recipient_email: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          recipient_email?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          recipient_email?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          donor_name: string | null
          external_reference: string
          id: string
          payment_type: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          donor_name?: string | null
          external_reference: string
          id?: string
          payment_type?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_name?: string | null
          external_reference?: string
          id?: string
          payment_type?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_anonymous: boolean | null
          name: string | null
          request: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_anonymous?: boolean | null
          name?: string | null
          request: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_anonymous?: boolean | null
          name?: string | null
          request?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sermons: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          sermon_date: string | null
          speaker: string | null
          title: string
          updated_at: string | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          sermon_date?: string | null
          speaker?: string | null
          title: string
          updated_at?: string | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          sermon_date?: string | null
          speaker?: string | null
          title?: string
          updated_at?: string | null
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      special_programs: {
        Row: {
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          program_type: string
          registration_fee: number | null
          registration_link: string | null
          start_date: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          program_type?: string
          registration_fee?: number | null
          registration_link?: string | null
          start_date?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          program_type?: string
          registration_fee?: number | null
          registration_link?: string | null
          start_date?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          push_token: string | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          push_token?: string | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          push_token?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_opportunities: {
        Row: {
          contact_link: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          requirements: string | null
          time_commitment: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          contact_link: string
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          requirements?: string | null
          time_commitment?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          contact_link?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          requirements?: string | null
          time_commitment?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_activities: {
        Row: {
          created_at: string | null
          day_of_week: string
          description: string | null
          id: string
          is_active: boolean | null
          location: string
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          time?: string
          title?: string
          updated_at?: string | null
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
    },
  },
} as const
