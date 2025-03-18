
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  username?: string;
  is_currently_streaming?: boolean;
  function_name?: string;
  workflow_step_id?: string;
  run_id?: string;
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
  exampleData?: any[];
  step_number: number;
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

// Add Chat interface to be consistent across the app
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_example?: boolean;
  username?: string;
  multi_input?: boolean;
  input_schema?: InputField[];
}

// Add InputValues interface to be more consistent across the app
export interface InputValues {
  [key: string]: string | number | boolean;
}

// Updated InputField interface with expanded type options
export interface InputField {
  field_name: string;
  type: 'string' | 'number' | 'integer' | 'bool' | 'person' | 'email' | 'date' | 
        'year' | 'state' | 'country' | 'phone' | 'address' | 'url' | 
        'currency' | 'percentage' | 'zip_code';
}

// Updated Run interface with both dashboard_id and chat_id
export interface Run {
  id: string;
  dashboard_id: string;
  chat_id: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface RunMessage {
  id: string;
  run_id: string;
  type: string;
  payload: any;
  created_at: string;
}
