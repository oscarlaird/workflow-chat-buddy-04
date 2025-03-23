export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  username?: string;
  text_is_currently_streaming?: boolean;
  screenrecording_url?: string;
  chat_id?: string;
  type: "text_message" | "screen_recording" | "code_run";
  code_output?: string;
  code_output_error?: string;
  code_run_success?: boolean;
  code_output_tables?: any;
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export interface WorkflowStepScreenshot {
  id: string;
  url: string;
  caption: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "complete" | "active" | "waiting";
  screenshots?: WorkflowStepScreenshot[];
  code?: string;
  exampleInput?: Record<string, any> | null;
  exampleOutput?: any | null;
  step_number: number;
  requiresBrowser?: boolean;
  originalKey?: string; // Added to maintain reference to original order
}

export interface Workflow {
  id: string;
  title: string;
  currentStep: number;
  totalSteps: number;
  steps: WorkflowStep[];
}

export interface TableColumn {
  id: string;
  header: string;
  accessor: string;
}

export interface TableData {
  [key: string]: any;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_example?: boolean;
  username?: string;
}

export interface InputValues {
  [key: string]: string | number | boolean | Array<any>;
}

export interface InputField {
  field_name: string;
  type: 'string' | 'number' | 'integer' | 'bool' | 'person' | 'email' | 'date' | 
        'year' | 'state' | 'country' | 'phone' | 'address' | 'url' | 
        'currency' | 'percentage' | 'zip_code' | 'table';
  columns?: string[]; // Column fields for table type
}

export interface BrowserEvent {
  id: string;
  coderun_event_id: string;
  type: RunMessageType | string;
  sender_type: RunMessageSenderType | string;
  display_text?: string;
  created_at: string;
  username?: string;
  chat_id?: string;
  payload?: any;
}

export interface Keyframe {
  id: number;
  message_id: string;
  screenshot_url: string;
  url: string;
  tab_title: string;
  timestamp: string;
}

export enum RecordingStatus {
  REQUESTED = 'requested',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum RunMessageSenderType {
  DASHBOARD = 'dashboard',
  BACKEND = 'backend',
  EXTENSION = 'extension'
}

export enum RunMessageType {
  INPUTS = 'inputs',
  SPAWN_WINDOW = 'spawn_window',
  LAUNCH_EXTENSION = 'launch_extension',
  EXTENSION_LOADED = 'extension_loaded',
  COMMAND = 'command',
  RESULT = 'result',
  RATIONALE = 'rationale',
  CLOSE_EXTENSION = 'close_extension',
  ABORT = 'abort'
}

export interface CodeRunEvent {
  id: string;
  message_id?: string;
  chat_id?: string;
  function_name?: string;
  description?: string;
  example_input?: any;
  example_output?: any;
  n_progress?: number;
  n_total?: number;
  progress_title?: string;
  requires_browser: boolean;
  created_at: string;
}

// Run interface
export interface Run {
  id: string;
  dashboard_id?: string;
  chat_id: string;
  status: string;
  in_progress: boolean;
  created_at: string;
  updated_at?: string;
  username?: string;
}

// RunMessage interface
export interface RunMessage {
  id: string;
  run_id: string;
  type: RunMessageType | string;
  sender_type: RunMessageSenderType | string;
  payload: any;
  display_text?: string;
  created_at: string;
}
