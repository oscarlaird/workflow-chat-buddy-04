export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      browser_events: {
        Row: {
          chat_id: string
          coderun_event_id: string
          created_at: string
          data: Json
          function_name: string | null
          id: string
          message_id: string
          uid: string
        }
        Insert: {
          chat_id: string
          coderun_event_id: string
          created_at?: string
          data: Json
          function_name?: string | null
          id?: string
          message_id: string
          uid: string
        }
        Update: {
          chat_id?: string
          coderun_event_id?: string
          created_at?: string
          data?: Json
          function_name?: string | null
          id?: string
          message_id?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "browser_events_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "browser_events_coderun_event_id_fkey"
            columns: ["coderun_event_id"]
            isOneToOne: false
            referencedRelation: "coderun_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "browser_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          code_approved: boolean | null
          created_at: string | null
          id: string
          is_example: boolean | null
          requires_browser: boolean
          requires_code_rewrite: boolean | null
          script: string | null
          steps: Json | null
          title: string
          uid: string
        }
        Insert: {
          code_approved?: boolean | null
          created_at?: string | null
          id?: string
          is_example?: boolean | null
          requires_browser?: boolean
          requires_code_rewrite?: boolean | null
          script?: string | null
          steps?: Json | null
          title: string
          uid: string
        }
        Update: {
          code_approved?: boolean | null
          created_at?: string | null
          id?: string
          is_example?: boolean | null
          requires_browser?: boolean
          requires_code_rewrite?: boolean | null
          script?: string | null
          steps?: Json | null
          title?: string
          uid?: string
        }
        Relationships: []
      }
      coderun_events: {
        Row: {
          chat_id: string
          created_at: string
          description: string | null
          function_name: string | null
          id: string
          input: Json | null
          message_id: string
          n_progress: number | null
          n_total: number | null
          output: Json | null
          progress_title: string | null
          requires_browser: boolean
          uid: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          description?: string | null
          function_name?: string | null
          id?: string
          input?: Json | null
          message_id: string
          n_progress?: number | null
          n_total?: number | null
          output?: Json | null
          progress_title?: string | null
          requires_browser?: boolean
          uid: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          description?: string | null
          function_name?: string | null
          id?: string
          input?: Json | null
          message_id?: string
          n_progress?: number | null
          n_total?: number | null
          output?: Json | null
          progress_title?: string | null
          requires_browser?: boolean
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "coderun_events_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coderun_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          code_output: Json | null
          content: string
          created_at: string | null
          from_template: boolean | null
          id: string
          role: Database["public"]["Enums"]["role_type"]
          screenrecording_url: string | null
          script: string | null
          steps: Json | null
          text_is_currently_streaming: boolean | null
          type: Database["public"]["Enums"]["message_type"]
          uid: string
          user_inputs: Json | null
          window_has_spawned: boolean | null
        }
        Insert: {
          chat_id: string
          code_output?: Json | null
          content: string
          created_at?: string | null
          from_template?: boolean | null
          id?: string
          role: Database["public"]["Enums"]["role_type"]
          screenrecording_url?: string | null
          script?: string | null
          steps?: Json | null
          text_is_currently_streaming?: boolean | null
          type: Database["public"]["Enums"]["message_type"]
          uid: string
          user_inputs?: Json | null
          window_has_spawned?: boolean | null
        }
        Update: {
          chat_id?: string
          code_output?: Json | null
          content?: string
          created_at?: string | null
          from_template?: boolean | null
          id?: string
          role?: Database["public"]["Enums"]["role_type"]
          screenrecording_url?: string | null
          script?: string | null
          steps?: Json | null
          text_is_currently_streaming?: boolean | null
          type?: Database["public"]["Enums"]["message_type"]
          uid?: string
          user_inputs?: Json | null
          window_has_spawned?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      message_type: "text_message" | "code_run" | "screen_recording"
      role_type: "user" | "assistant"
      run_message_sender_type: "dashboard" | "backend" | "extension"
      run_message_type:
        | "inputs"
        | "spawn_window"
        | "launch_extension"
        | "extension_loaded"
        | "command"
        | "result"
        | "rationale"
        | "close_extension"
        | "abort"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
