import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Container, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Container maxWidth="xs" sx={{ height: '85vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" fontWeight={700} gutterBottom>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Enter your email to receive a password reset link
          </Typography>

          {sent ? (
            <Alert severity="success">
              Password reset link sent to {email}. Please check your inbox.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" py={1.5}>
                Send Reset Link
              </Button>
            </Box>
          )}

          <Box mt={3} textAlign="center">
            <Link onClick={() => navigate('/login')} sx={{ cursor: 'pointer' }}>
              Back to Login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
