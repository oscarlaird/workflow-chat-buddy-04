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
      chats: {
        Row: {
          created_at: string | null
          example_inputs: Json | null
          id: string
          is_example: boolean | null
          script: string | null
          title: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          example_inputs?: Json | null
          id: string
          is_example?: boolean | null
          script?: string | null
          title: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          example_inputs?: Json | null
          id?: string
          is_example?: boolean | null
          script?: string | null
          title?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      keyframes: {
        Row: {
          chat_id: string | null
          clicked_element: string | null
          created_at: string
          html_snapshot: string | null
          id: number
          message_id: string | null
          screenshot_base64: string | null
          screenshot_url: string | null
          tab_id: string | null
          tab_title: string | null
          timestamp: string | null
          typing_events: string | null
          url: string | null
          username: string | null
        }
        Insert: {
          chat_id?: string | null
          clicked_element?: string | null
          created_at?: string
          html_snapshot?: string | null
          id?: number
          message_id?: string | null
          screenshot_base64?: string | null
          screenshot_url?: string | null
          tab_id?: string | null
          tab_title?: string | null
          timestamp?: string | null
          typing_events?: string | null
          url?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: string | null
          clicked_element?: string | null
          created_at?: string
          html_snapshot?: string | null
          id?: number
          message_id?: string | null
          screenshot_base64?: string | null
          screenshot_url?: string | null
          tab_id?: string | null
          tab_title?: string | null
          timestamp?: string | null
          typing_events?: string | null
          url?: string | null
          username?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          code_output: string | null
          code_output_error: string | null
          code_output_tables: Json | null
          code_run: boolean
          code_run_success: boolean | null
          content: string
          created_at: string | null
          example_inputs: Json | null
          from_template: boolean | null
          function_name: string | null
          id: string
          is_currently_streaming: boolean | null
          requires_text_reply: boolean
          role: string
          run_id: string | null
          screenrecording_url: string | null
          script: string | null
          steps: Json | null
          username: string
          workflow_step_id: string | null
        }
        Insert: {
          chat_id: string
          code_output?: string | null
          code_output_error?: string | null
          code_output_tables?: Json | null
          code_run?: boolean
          code_run_success?: boolean | null
          content: string
          created_at?: string | null
          example_inputs?: Json | null
          from_template?: boolean | null
          function_name?: string | null
          id?: string
          is_currently_streaming?: boolean | null
          requires_text_reply?: boolean
          role: string
          run_id?: string | null
          screenrecording_url?: string | null
          script?: string | null
          steps?: Json | null
          username: string
          workflow_step_id?: string | null
        }
        Update: {
          chat_id?: string
          code_output?: string | null
          code_output_error?: string | null
          code_output_tables?: Json | null
          code_run?: boolean
          code_run_success?: boolean | null
          content?: string
          created_at?: string | null
          example_inputs?: Json | null
          from_template?: boolean | null
          function_name?: string | null
          id?: string
          is_currently_streaming?: boolean | null
          requires_text_reply?: boolean
          role?: string
          run_id?: string | null
          screenrecording_url?: string | null
          script?: string | null
          steps?: Json | null
          username?: string
          workflow_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_workflow_step"
            columns: ["workflow_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      run_messages: {
        Row: {
          chat_id: string | null
          created_at: string
          display_text: string | null
          id: string
          payload: Json | null
          run_id: string
          sender_type: Database["public"]["Enums"]["run_message_sender_type"]
          type: Database["public"]["Enums"]["run_message_type"]
          username: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          display_text?: string | null
          id?: string
          payload?: Json | null
          run_id: string
          sender_type?: Database["public"]["Enums"]["run_message_sender_type"]
          type: Database["public"]["Enums"]["run_message_type"]
          username?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          display_text?: string | null
          id?: string
          payload?: Json | null
          run_id?: string
          sender_type?: Database["public"]["Enums"]["run_message_sender_type"]
          type?: Database["public"]["Enums"]["run_message_type"]
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_messages_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          chat_id: string
          created_at: string
          dashboard_id: string
          id: string
          in_progress: boolean
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          chat_id?: string
          created_at?: string
          dashboard_id: string
          id?: string
          in_progress?: boolean
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string
          dashboard_id?: string
          id?: string
          in_progress?: boolean
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          chat_id: string
          code: string | null
          created_at: string | null
          description: string
          example_data: Json | null
          id: string
          screenshots: Json | null
          status: string
          step_number: number
          title: string
          username: string
        }
        Insert: {
          chat_id: string
          code?: string | null
          created_at?: string | null
          description: string
          example_data?: Json | null
          id?: string
          screenshots?: Json | null
          status: string
          step_number: number
          title: string
          username?: string
        }
        Update: {
          chat_id?: string
          code?: string | null
          created_at?: string | null
          description?: string
          example_data?: Json | null
          id?: string
          screenshots?: Json | null
          status?: string
          step_number?: number
          title?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workflow_steps_chat_id"
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
      admin_get_replica_identity: {
        Args: {
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
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
