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
  MenuItem,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../api/apiSlice';
import { setCredentials } from '../../features/authSlice';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerApi, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await registerApi({ name: name.trim(), email: email.trim(), password, role }).unwrap();
      const userName = res.data.user.name || name;
      
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));

      setToastMsg(`Registered & logged in as ${userName}`);
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate(`/${res.data.user.role}`);
      }, 1000);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Registration failed.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '85vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%', p: 2, bgcolor: '#282828', borderColor: '#3e3e3e', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" fontWeight={800} color="#eff1f6" gutterBottom>
            Join CodeArena
          </Typography>
          <Typography variant="body2" color="#9ea0a5" textAlign="center" mb={3}>
            Select your role & start coding
          </Typography>

          {errorMsg && <Alert severity="error" sx={{ mb: 2, bgcolor: '#1e1e1e', border: '1px solid #ff375f' }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              sx={{ '& .MuiInputBase-root': { color: '#eff1f6', bgcolor: '#1e1e1e' }, '& .MuiInputLabel-root': { color: '#9ea0a5' } }}
            />
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
            <TextField
              select
              label="Account Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputBase-root': { color: '#eff1f6', bgcolor: '#1e1e1e' }, '& .MuiInputLabel-root': { color: '#9ea0a5' } }}
            >
              <MenuItem value="student">Student / Candidate</MenuItem>
              <MenuItem value="trainer">Trainer / Instructor</MenuItem>
              <MenuItem value="recruiter">Recruiter / Hiring Manager</MenuItem>
              <MenuItem value="admin">Platform Admin</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 1, py: 1.5, bgcolor: '#ffa116', color: '#000', '&:hover': { bgcolor: '#ffb84d' } }}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Box>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="#9ea0a5">
              Already have an account?{' '}
              <Link color="#ffa116" onClick={() => navigate('/login')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
                Sign In
              </Link>
            </Typography>
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
