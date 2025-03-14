
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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
