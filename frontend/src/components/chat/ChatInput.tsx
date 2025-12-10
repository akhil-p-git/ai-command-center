import React, { useState, KeyboardEvent } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Divider, 
  CircularProgress 
} from '@mui/material';
import { Send } from '@mui/icons-material';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false, 
  placeholder = "Type your message..." 
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      component="form"
      sx={{ 
        p: '2px 4px', 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
      elevation={0}
      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, p: 1 }}
        placeholder={placeholder}
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton 
        color="primary" 
        sx={{ p: '10px' }} 
        onClick={handleSend}
        disabled={!message.trim() || disabled}
      >
        {disabled ? <CircularProgress size={24} /> : <Send />}
      </IconButton>
    </Paper>
  );
};

