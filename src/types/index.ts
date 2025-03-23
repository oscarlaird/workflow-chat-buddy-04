
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  username?: string;
  chat_id?: string;
  screenrecording_url?: string;
  type: "text_message" | "screen_recording" | "code_run" | "function_message";
  code_output?: string;
  code_output_error?: string;
  code_run_success?: boolean;
  code_output_tables?: any[];
  duration?: number;
}

export interface Keyframe {
  id: string;
  message_id: string;
  screenshot_url: string;
  url: string;
  tab_title: string;
  timestamp: string;
}
