import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Container,
  Chip,
  Divider,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../api/apiSlice';
import { setCredentials } from '../../features/authSlice';

export default function Login() {
  const [email, setEmail] = useState('student@codearena.dev');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const handleLoginSubmit = async (emailToSubmit, passwordToSubmit) => {
    setErrorMsg('');
    try {
      const res = await loginApi({ email: emailToSubmit, password: passwordToSubmit }).unwrap();
      const userName = res.data.user.name || 'User';
      
      // Store credentials
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      
      // Trigger login pop-up message
      setToastMsg(`Logged in as ${userName}`);
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate(`/${res.data.user.role}`);
      }, 1000);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const fillDemoAndLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    handleLoginSubmit(demoEmail, 'password123');
  };

  return (
    <Container maxWidth="xs" sx={{ height: '85vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%', p: 2, bgcolor: '#282828', borderColor: '#3e3e3e', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" fontWeight={800} color="#eff1f6" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="#9ea0a5" textAlign="center" mb={3}>
            Login to your CodeArena account
          </Typography>

          {errorMsg && <Alert severity="error" sx={{ mb: 2, bgcolor: '#1e1e1e', border: '1px solid #ff375f' }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{ '& .MuiInputBase-root': { color: '#eff1f6', bgcolor: '#1e1e1e' }, '& .MuiInputLabel-root': { color: '#9ea0a5' } }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={{ '& .MuiInputBase-root': { color: '#eff1f6', bgcolor: '#1e1e1e' }, '& .MuiInputLabel-root': { color: '#9ea0a5' } }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 1, py: 1.5, bgcolor: '#ffa116', color: '#000', '&:hover': { bgcolor: '#ffb84d' } }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#3e3e3e', color: '#9ea0a5', fontSize: '0.8rem' }}>
            OR 1-CLICK DEMO LOGIN
          </Divider>

          <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
            <Chip
              label="Student Demo"
              onClick={() => fillDemoAndLogin('student@codearena.dev')}
              sx={{ bgcolor: '#ffa116', color: '#000', fontWeight: 700, cursor: 'pointer' }}
            />
            <Chip
              label="Trainer Demo"
              onClick={() => fillDemoAndLogin('trainer@codearena.dev')}
              sx={{ bgcolor: '#ffc01e', color: '#000', fontWeight: 700, cursor: 'pointer' }}
            />
            <Chip
              label="Recruiter Demo"
              onClick={() => fillDemoAndLogin('recruiter@codearena.dev')}
              sx={{ bgcolor: '#9c27b0', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            />
            <Chip
              label="Admin Demo"
              onClick={() => fillDemoAndLogin('admin@codearena.dev')}
              sx={{ bgcolor: '#ff375f', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            />
          </Box>

          <Box mt={3} textAlign="center" display="flex" justifyContent="space-between">
            <Link color="#ffa116" variant="body2" onClick={() => navigate('/forgot-password')} sx={{ cursor: 'pointer' }}>
              Forgot Password?
            </Link>
            <Link color="#ffa116" variant="body2" onClick={() => navigate('/register')} sx={{ cursor: 'pointer' }}>
              Create Account
            </Link>
          </Box>
        </CardContent>
      </Card>

      {/* Pop-up notification toast */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ bgcolor: '#00b8a3', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
          🎉 {toastMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
