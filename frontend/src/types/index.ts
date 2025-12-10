// Common types shared across the frontend

export interface Conversation {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'failed';
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  type: string;
  last_deployed: string;
  success_rate: number;
  avg_latency: number;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  status: 'running' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
  duration_ms?: number;
}

export interface AgentStep {
  step_name: string;
  input: any;
  output: any;
  timestamp: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger_type: 'webhook' | 'schedule' | 'event' | string;
  n8n_workflow_id?: string;
  status: 'active' | 'inactive';
  last_run?: string;
  success_rate: number;
  execution_count: number;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'success' | 'failed' | 'running';
  start_time: string;
  duration_ms?: number;
  agent_run_id?: string;
  conversation_id?: string;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  doc_count: number;
  vector_count: number;
  last_indexed?: string;
  created_at: string;
}

export interface QueryResult {
  content: string;
  source_file: string;
  chunk_index: number;
  similarity_score: number;
}

export interface QueryResponse {
  query: string;
  results: QueryResult[];
  collection_id: string;
}

export interface OverviewMetrics {
  totalConversations: number;
  successRate: number;
  avgLatencyMs: number;
  activeAgents: number;
  trends: {
    conversations: { value: string; direction: 'up' | 'down' | 'neutral' };
    successRate: { value: string; direction: 'up' | 'down' | 'neutral' };
    latency: { value: string; direction: 'up' | 'down' | 'neutral' };
    activeAgents: { value: string; direction: 'up' | 'down' | 'neutral' };
  };
}

export interface TimeseriesPoint {
  timestamp: string;
  value: number;
}
