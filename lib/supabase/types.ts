/**
 * Database type definitions for ReelPilot.
 *
 * Run the following command to auto-generate types directly from your
 * Supabase schema once your project URL and service-role key are set:
 *
 *   npx supabase gen types typescript --project-id <project-id> \
 *     --schema public > lib/supabase/types.ts
 *
 * The placeholder below keeps TypeScript happy until you run the generator.
 */

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
      // ── Users ──────────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── Video Series ───────────────────────────────────────────────────────
      series: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          niche: string | null
          status: "active" | "paused" | "archived"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          niche?: string | null
          status?: "active" | "paused" | "archived"
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          niche?: string | null
          status?: "active" | "paused" | "archived"
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── Videos ─────────────────────────────────────────────────────────────
      videos: {
        Row: {
          id: string
          series_id: string
          user_id: string
          title: string
          script: string | null
          voiceover_url: string | null
          video_url: string | null
          thumbnail_url: string | null
          status:
            | "draft"
            | "generating"
            | "rendering"
            | "ready"
            | "scheduled"
            | "published"
            | "failed"
          scheduled_at: string | null
          published_at: string | null
          youtube_video_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          series_id: string
          user_id: string
          title: string
          script?: string | null
          voiceover_url?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          status?: "draft" | "generating" | "rendering" | "ready" | "scheduled" | "published" | "failed"
          scheduled_at?: string | null
          published_at?: string | null
          youtube_video_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          script?: string | null
          voiceover_url?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          status?: "draft" | "generating" | "rendering" | "ready" | "scheduled" | "published" | "failed"
          scheduled_at?: string | null
          published_at?: string | null
          youtube_video_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_series_id_fkey"
            columns: ["series_id"]
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── Scenes ─────────────────────────────────────────────────────────────
      scenes: {
        Row: {
          id: string
          video_id: string
          order: number
          prompt: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          order: number
          prompt?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          order?: number
          prompt?: string | null
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_video_id_fkey"
            columns: ["video_id"]
            referencedRelation: "videos"
            referencedColumns: ["id"]
          }
        ]
      }
    }

    Views: Record<string, never>

    Functions: Record<string, never>

    Enums: {
      video_status:
        | "draft"
        | "generating"
        | "rendering"
        | "ready"
        | "scheduled"
        | "published"
        | "failed"
      series_status: "active" | "paused" | "archived"
    }
  }
}

// ── Convenience helpers ─────────────────────────────────────────────────────

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
