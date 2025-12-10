import React from 'react';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import { ChatPanel } from './ChatPanel';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 450,
          maxWidth: '100%',
          boxShadow: 4
        }
      }}
    >
      <ChatPanel onClose={onClose} embedded />
    </Drawer>
  );
};

