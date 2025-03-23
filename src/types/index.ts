export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  username?: string;
  is_currently_streaming?: boolean;
  function_name?: string;
  workflow_step_id?: string;
  run_id?: string;
  screenrecording_url?: string;
  chat_id?: string;
  code_run?: boolean;
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

// Updated Chat interface without input_schema and multi_input
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_example?: boolean;
  username?: string;
}

// Add InputValues interface to be more consistent across the app
export interface InputValues {
  [key: string]: string | number | boolean | Array<any>;
}

// Updated InputField interface with expanded type options
export interface InputField {
  field_name: string;
  type: 'string' | 'number' | 'integer' | 'bool' | 'person' | 'email' | 'date' | 
        'year' | 'state' | 'country' | 'phone' | 'address' | 'url' | 
        'currency' | 'percentage' | 'zip_code' | 'table';
  columns?: string[]; // Column fields for table type
}

// Updated Run interface with both dashboard_id, chat_id and username
export interface Run {
  id: string;
  dashboard_id: string;
  chat_id: string;
  status: string;
  in_progress: boolean;
  created_at: string;
  updated_at: string;
  username?: string;
}

// Add Keyframe interface for screen recording keyframes
export interface Keyframe {
  id: number;
  message_id: string;
  screenshot_url: string;
  url: string;
  tab_title: string;
  timestamp: string;
}

// Define enum types to match our database enums
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

export enum RunMessageSenderType {
  DASHBOARD = 'dashboard',
  BACKEND = 'backend',
  EXTENSION = 'extension'
}

export interface RunMessage {
  id: string;
  run_id: string;
  type: RunMessageType;
  payload: any;
  created_at: string;
  chat_id?: string;
  username?: string;
  sender_type: RunMessageSenderType;
  display_text?: string;
}

// Add recording status enum
export enum RecordingStatus {
  REQUESTED = 'requested',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}
