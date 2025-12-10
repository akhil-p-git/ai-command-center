import React from 'react';
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider 
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ChatBubbleOutline as ChatIcon,
  SmartToy as AgentIcon,
  AccountTree as WorkflowIcon,
  MenuBook as KnowledgeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/overview' },
  { text: 'Conversations', icon: <ChatIcon />, path: '/conversations' },
  { text: 'Agents', icon: <AgentIcon />, path: '/agents' },
  { text: 'Workflows', icon: <WorkflowIcon />, path: '/workflows' },
  { text: 'Knowledge', icon: <KnowledgeIcon />, path: '/knowledge' },
];

const secondaryItems = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <List component="nav">
      {menuItems.map((item) => (
        <ListItemButton
          key={item.text}
          component={NavLink}
          to={item.path}
          selected={location.pathname.startsWith(item.path)}
          sx={{
            '&.active': {
              backgroundColor: 'action.selected',
              borderRight: '3px solid',
              borderColor: 'primary.main',
            },
          }}
        >
          <ListItemIcon sx={{ color: location.pathname.startsWith(item.path) ? 'primary.main' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
      
      <Divider sx={{ my: 1 }} />
      
      {secondaryItems.map((item) => (
        <ListItemButton
          key={item.text}
          component={NavLink}
          to={item.path}
          selected={location.pathname.startsWith(item.path)}
          sx={{
            '&.active': {
              backgroundColor: 'action.selected',
              borderRight: '3px solid',
              borderColor: 'primary.main',
            },
          }}
        >
          <ListItemIcon sx={{ color: location.pathname.startsWith(item.path) ? 'primary.main' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  );
};

