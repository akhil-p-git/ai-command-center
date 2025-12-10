import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Button,
  Divider,
  Alert
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentSelector } from './AgentSelector';
import { AgentStepsTimeline } from './AgentStepsTimeline';

interface ChatPanelProps {
  defaultAgentId?: string;
  onClose?: () => void;
  embedded?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  defaultAgentId, 
  onClose, 
  embedded = false 
}) => {
  const { 
    messages, 
    isLoading, 
    currentSteps, 
    sendMessage, 
    clearChat, 
    error 
  } = useChat();
  
  const [selectedAgentId, setSelectedAgentId] = useState(defaultAgentId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSteps]);

  const handleSend = (content: string) => {
    sendMessage(content, selectedAgentId || undefined);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <AgentSelector 
          value={selectedAgentId} 
          onChange={setSelectedAgentId} 
          disabled={messages.length > 0} 
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            startIcon={<Add />} 
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            New Chat
          </Button>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">Start a conversation with an agent.</Typography>
            <Typography variant="caption">Select an agent above or let the router decide.</Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Live Steps Timeline */}
        {(currentSteps.length > 0 || isLoading) && (
          <AgentStepsTimeline steps={currentSteps} isRunning={isLoading} />
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <ChatInput onSend={handleSend} disabled={isLoading} />
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          Shift+Enter for newline
        </Typography>
      </Box>
    </Box>
  );
};

