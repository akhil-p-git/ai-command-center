import React from 'react';
import {
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Button,
  Box,
  Chip
} from '@mui/material';
import {
  Chat as ChatIcon,
  SmartToy as AgentIcon,
  AccountTree as WorkflowIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Loop as ActiveIcon,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface Activity {
  id: string;
  type: 'conversation' | 'agent_run' | 'workflow';
  title: string;
  status: 'completed' | 'failed' | 'active';
  timestamp: string;
  agentId?: string;
  details?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, maxItems = 5 }) => {
  const navigate = useNavigate();

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'conversation':
        return <ChatIcon />;
      case 'agent_run':
        return <AgentIcon />;
      case 'workflow':
        return <WorkflowIcon />;
      default:
        return <ChatIcon />;
    }
  };

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <SuccessIcon fontSize="small" color="success" />;
      case 'failed':
        return <ErrorIcon fontSize="small" color="error" />;
      case 'active':
        return <ActiveIcon fontSize="small" color="primary" sx={{ animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return 'success.light';
      case 'failed':
        return 'error.light';
      case 'active':
        return 'primary.light';
      default:
        return 'grey.200';
    }
  };

  const handleItemClick = (activity: Activity) => {
    if (activity.type === 'conversation') {
      navigate(`/conversations/${activity.id}`);
    } else if (activity.type === 'agent_run') {
      navigate(`/agents/${activity.agentId || 'all'}`);
    }
    // Workflow navigation to be implemented
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card elevation={1} sx={{ height: '100%' }}>
      <CardHeader 
        title="Recent Activity" 
        action={
          <Button 
            endIcon={<ArrowForward />} 
            size="small"
            onClick={() => navigate('/activity')} // Assuming an activity page exists or will exist
          >
            View All
          </Button>
        }
      />
      <Divider />
      <List disablePadding>
        {displayActivities.length === 0 ? (
          <ListItem>
            <ListItemText primary="No recent activity" sx={{ textAlign: 'center', color: 'text.secondary' }} />
          </ListItem>
        ) : (
          displayActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItemButton onClick={() => handleItemClick(activity)} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getStatusColor(activity.status), color: 'common.white' }}>
                    {getIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" component="span" fontWeight="medium">
                        {activity.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {getStatusIcon(activity.status)}
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                      </Typography>
                      {activity.details || `ID: ${activity.id.substring(0, 8)}...`}
                    </React.Fragment>
                  }
                />
              </ListItemButton>
              {index < displayActivities.length - 1 && <Divider component="li" variant="inset" />}
            </React.Fragment>
          ))
        )}
      </List>
    </Card>
  );
};

