
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

export interface Chat {
  id: string;
  title: string;
  username?: string;
  created_at: string;
  updated_at?: string;
  is_example?: boolean;
}

export interface InputField {
  field_name: string;
  type: string;
  description?: string;
  options?: string[];
  required?: boolean;
}

export interface InputValues {
  [key: string]: string | number | boolean | any[];
}

export interface WorkflowStep {
  id: string;
  chat_id: string;
  step_number: number;
  title: string;
  description?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  exampleInput?: Record<string, any>;
  exampleOutput?: Record<string, any>;
  requiresBrowser?: boolean;
  originalKey?: string; // Add this property to support code in useWorkflowSteps
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  currentStep?: number; // Added to fix MockWorkflow
  totalSteps?: number; // Added to fix MockWorkflow
  steps: WorkflowStep[];
}

export interface BrowserEvent {
  id: string;
  coderun_event_id?: string;
  type: string;
  sender_type: RunMessageSenderType;
  display_text?: string;
  created_at: string;
  username?: string;
  chat_id?: string;
  payload?: any;
}

export interface CodeRunEvent {
  id: string;
  chat_id?: string;
  function_name?: string;
  n_progress?: number;
  n_total?: number;
  example_input?: any;
  example_output?: any;
  created_at: string;
  description?: string;
  progress_title?: string;
  requires_browser?: boolean;
  message_id?: string;
}

export interface Run {
  id: string;
  chat_id: string;
  status: string;
  in_progress: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RunMessage {
  id: string;
  run_id: string;
  content: string;
  role: string;
  created_at: string;
  type: string; // Make type required
}

export enum RunMessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
  CLICK = 'click',
  NAVIGATE = 'navigate',
  INPUT = 'input',
  SPAWN_WINDOW = 'spawn_window',
  ABORT = 'abort',
  COMPLETE = 'complete',
  STATUS = 'status'
}

export enum RunMessageSenderType {
  DASHBOARD = 'dashboard',
  EXTENSION = 'extension',
  SERVER = 'server'
}
