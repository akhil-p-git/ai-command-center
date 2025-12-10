import { useState, useCallback } from 'react';
import { chatApi } from '../api/chat';
import { AgentStep } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  latency_ms?: number;
  steps?: AgentStep[];
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string | null;
  currentSteps: AgentStep[];
  sendMessage: (content: string, agentId?: string) => Promise<void>;
  clearChat: () => void;
  error: string | null;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<AgentStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, agentId?: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);
    setCurrentSteps([]); // Reset steps for new message exchange

    try {
      const response = await chatApi.send({
        message: content,
        agent_id: agentId,
        conversation_id: conversationId || undefined
      });

      const data = response.data;
      setConversationId(data.conversation_id);
      setCurrentSteps(data.steps || []);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        tokens: data.tokens_used,
        latency_ms: data.latency_ms,
        steps: data.steps
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.response?.data?.detail || 'Failed to send message');
      
      // Optionally add an error message to the chat
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: ${err.response?.data?.detail || 'Failed to communicate with agent.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setCurrentSteps([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    currentSteps,
    sendMessage,
    clearChat,
    error
  };
};

