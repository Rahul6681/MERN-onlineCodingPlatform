import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SwapHoriz as SwapHorizIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setCredentials } from '../features/authSlice';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useLoginMutation } from '../api/apiSlice';

export default function Navbar({ mode, toggleTheme }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const [loginApi] = useLoginMutation();
  const { data: notifData } = useGetNotificationsQuery(undefined, { skip: !isAuthenticated });
  const [markRead] = useMarkNotificationReadMutation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const switchRoleDemo = async (newRole) => {
    const emailMap = {
      student: 'student@codearena.dev',
      trainer: 'trainer@codearena.dev',
      recruiter: 'recruiter@codearena.dev',
      admin: 'admin@codearena.dev',
    };

    try {
      const targetEmail = emailMap[newRole] || 'student@codearena.dev';
      const res = await loginApi({ email: targetEmail, password: 'password123' }).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      navigate(`/${newRole}`);
      setAnchorEl(null);
    } catch (e) {
      if (user) {
        dispatch(setCredentials({ user: { ...user, role: newRole }, token: localStorage.getItem('token') }));
        navigate(`/${newRole}`);
        setAnchorEl(null);
      }
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: mode === 'dark' ? '#3e3e3e' : '#e5e5e5',
        backgroundColor: mode === 'dark' ? '#282828' : '#ffffff',
        color: mode === 'dark' ? '#eff1f6' : '#262626',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px !important' }}>
        {/* Brand */}
        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '6px',
              backgroundColor: '#ffa116',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 10px rgba(255, 161, 22, 0.4)',
            }}
          >
            <CodeIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.5px">
            Code<span style={{ color: '#ffa116' }}>Arena</span>
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Dark / Light Toggle */}
          <IconButton onClick={toggleTheme} color="inherit" size="small">
            {mode === 'dark' ? <LightModeIcon sx={{ color: '#ffa116', fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
          </IconButton>

          {isAuthenticated && user ? (
            <>
              {/* Role Indicator Chip */}
              <Chip
                label={user.role?.toUpperCase()}
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: '4px',
                  bgcolor: user.role === 'admin' ? '#ff375f' : user.role === 'trainer' ? '#ffc01e' : user.role === 'recruiter' ? '#9c27b0' : '#ffa116',
                  color: user.role === 'trainer' || user.role === 'student' ? '#000' : '#fff',
                }}
              />

              {/* Quick Role Switch Menu */}
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" color="inherit" title="Switch Role (Demo)">
                <SwapHorizIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => switchRoleDemo('student')}>Switch to Student</MenuItem>
                <MenuItem onClick={() => switchRoleDemo('trainer')}>Switch to Trainer</MenuItem>
                <MenuItem onClick={() => switchRoleDemo('recruiter')}>Switch to Recruiter</MenuItem>
                <MenuItem onClick={() => switchRoleDemo('admin')}>Switch to Admin</MenuItem>
              </Menu>

              {/* Notifications */}
              <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} color="inherit" size="small">
                <Badge badgeContent={notifData?.data?.unreadCount || 0} color="error">
                  <NotificationsIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
              <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)} PaperProps={{ sx: { width: 320, maxHeight: 400 } }}>
                <Box p={2} borderBottom="1px solid" borderColor="divider">
                  <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
                </Box>
                {notifData?.data?.notifications?.length ? (
                  notifData.data.notifications.map((n) => (
                    <MenuItem key={n._id} onClick={() => markRead(n._id)} sx={{ whiteSpace: 'normal', opacity: n.isRead ? 0.6 : 1 }}>
                      <Typography variant="body2">{n.message}</Typography>
                    </MenuItem>
                  ))
                ) : (
                  <Box p={2} textAlign="center">
                    <Typography variant="caption" color="text.secondary">No new notifications</Typography>
                  </Box>
                )}
              </Menu>

              {/* User Avatar & User Name (Right Upper Corner) */}
              <Box display="flex" alignItems="center" gap={1} sx={{ pl: 0.5 }}>
                <Avatar src={user.avatarUrl} sx={{ width: 32, height: 32, border: '2px solid #ffa116' }} />
                <Typography variant="body2" fontWeight={700} color="#eff1f6" sx={{ display: { xs: 'none', sm: 'inline-block' } }}>
                  {user.name}
                </Typography>
              </Box>

              {/* Logout Button */}
              <IconButton onClick={handleLogout} size="small" sx={{ color: '#ff375f' }} title="Logout">
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </>
          ) : (
            <Box display="flex" gap={1}>
              <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/register')}>Sign Up</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
