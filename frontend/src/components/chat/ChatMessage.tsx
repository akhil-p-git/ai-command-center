import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { AccessTime, Token, SmartToy, Person } from '@mui/icons-material';
import { ChatMessage as IChatMessage } from '../../hooks/useChat';

interface ChatMessageProps {
  message: IChatMessage;
  showMetadata?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, showMetadata = true }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flexDirection: isUser ? 'row-reverse' : 'row' }}>
        <Box 
          sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            bgcolor: isUser ? 'primary.main' : isSystem ? 'error.light' : 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            mb: 0.5
          }}
        >
          {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
        </Box>
        
        <Paper
          elevation={isUser ? 2 : 1}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : isSystem ? 'error.light' : 'grey.100',
            color: isUser || isSystem ? 'white' : 'text.primary',
            borderRadius: 2,
            borderBottomRightRadius: isUser ? 0 : 2,
            borderBottomLeftRadius: !isUser ? 0 : 2,
            position: 'relative'
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {message.content}
          </Typography>
        </Paper>
      </Box>

      {/* Metadata & Timestamp */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, px: 1, opacity: 0.7 }}>
        <Typography variant="caption" color="text.secondary">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        
        {showMetadata && !isUser && !isSystem && (
          <>
            {message.latency_ms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {message.latency_ms}ms
                </Typography>
              </Box>
            )}
            {message.tokens && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Token sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {message.tokens}t
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

