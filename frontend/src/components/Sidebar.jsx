import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Code as CodeIcon,
  EmojiEvents as EmojiEventsIcon,
  Leaderboard as LeaderboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  WorkHistory as WorkHistoryIcon,
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || 'student';

  const menuConfig = {
    student: [
      { label: 'Dashboard', path: '/student', icon: <DashboardIcon /> },
      { label: 'Problems', path: '/student/problems', icon: <CodeIcon /> },
      { label: 'Contests', path: '/student/contests', icon: <EmojiEventsIcon /> },
      { label: 'Leaderboard', path: '/student/leaderboard', icon: <LeaderboardIcon /> },
      { label: 'Interview Prep', path: '/student/interview-prep', icon: <WorkHistoryIcon /> },
      { label: 'Learning Paths', path: '/student/learning-paths', icon: <SchoolIcon /> },
      { label: 'Profile & Badges', path: '/student/profile', icon: <PersonIcon /> },
    ],
    trainer: [
      { label: 'Trainer Dashboard', path: '/trainer', icon: <DashboardIcon /> },
      { label: 'Problem Manager', path: '/trainer/problems', icon: <BuildIcon /> },
      { label: 'Contest Manager', path: '/trainer/contests', icon: <EmojiEventsIcon /> },
    ],
    recruiter: [
      { label: 'Recruiter Dashboard', path: '/recruiter', icon: <DashboardIcon /> },
      { label: 'Coding Assessments', path: '/recruiter/assessments', icon: <QuizIcon /> },
    ],
    admin: [
      { label: 'Admin Dashboard', path: '/admin', icon: <DashboardIcon /> },
      { label: 'User Management', path: '/admin/users', icon: <GroupIcon /> },
      { label: 'Platform Analytics', path: '/admin/analytics', icon: <AnalyticsIcon /> },
    ],
  };

  const currentMenu = menuConfig[role] || menuConfig.student;

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="overline" color="text.secondary" fontWeight={700} px={1.5}>
        Navigation ({role})
      </Typography>

      <List component="nav" sx={{ mt: 1 }}>
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={isActive}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: isActive ? '#fff' : 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
