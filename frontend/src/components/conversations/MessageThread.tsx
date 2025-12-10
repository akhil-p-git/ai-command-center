import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import { SmartToy, Person, Build } from '@mui/icons-material';
import { Message } from '../../types';

interface MessageThreadProps {
  messages: Message[];
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No messages in this conversation.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, overflowY: 'auto', flexGrow: 1 }}>
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const isTool = msg.role === 'system' || (msg as any).role === 'tool'; // Handling different conventions

        let alignSelf = 'flex-start';
        let bgcolor = theme.palette.grey[100];
        let color = theme.palette.text.primary;
        let icon = <SmartToy fontSize="small" />;

        if (isUser) {
          alignSelf = 'flex-end';
          bgcolor = theme.palette.primary.main;
          color = theme.palette.primary.contrastText;
          icon = <Person fontSize="small" />;
        } else if (isTool) {
          bgcolor = '#fff8e1'; // amber.50
          icon = <Build fontSize="small" />;
        }

        return (
          <Box 
            key={index} 
            sx={{ 
              alignSelf, 
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor,
                color,
                borderRadius: 2,
                position: 'relative'
              }}
            >
              {!isUser && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.7 }}>
                  {icon}
                  <Typography variant="caption" fontWeight="bold">
                    {isTool ? 'System / Tool' : 'Assistant'}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        );
      })}
      <div ref={bottomRef} />
    </Box>
  );
};

