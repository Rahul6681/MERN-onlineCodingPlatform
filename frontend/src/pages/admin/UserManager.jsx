import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material';

export default function UserManager() {
  const users = [
    { id: 1, name: 'Alex Student', email: 'student@codearena.dev', role: 'student', isBanned: false },
    { id: 2, name: 'Prof. Alan Turing', email: 'trainer@codearena.dev', role: 'trainer', isBanned: false },
    { id: 3, name: 'Rachel Recruiter', email: 'recruiter@codearena.dev', role: 'recruiter', isBanned: false },
    { id: 4, name: 'Spam User', email: 'spam@bad.com', role: 'student', isBanned: true },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        User Moderation & Permissions
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        View user accounts, adjust roles, and enforce moderation bans.
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell fontWeight={600}>{u.name}</TableCell>
                <TableCell color="text.secondary">{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.role.toUpperCase()} size="small" color={u.role === 'admin' ? 'error' : 'primary'} />
                </TableCell>
                <TableCell>
                  <Chip label={u.isBanned ? 'Banned' : 'Active'} color={u.isBanned ? 'error' : 'success'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined" color={u.isBanned ? 'success' : 'error'} size="small">
                    {u.isBanned ? 'Unban' : 'Ban User'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
