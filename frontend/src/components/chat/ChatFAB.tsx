import React from 'react';
import { Fab, Badge, Zoom } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

interface ChatFABProps {
  onClick: () => void;
  show?: boolean;
}

export const ChatFAB: React.FC<ChatFABProps> = ({ onClick, show = true }) => {
  return (
    <Zoom in={show}>
      <Fab 
        color="primary" 
        aria-label="chat" 
        onClick={onClick}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          zIndex: 1200
        }}
      >
        <ChatIcon />
      </Fab>
    </Zoom>
  );
};

