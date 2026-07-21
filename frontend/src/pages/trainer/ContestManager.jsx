import React, { useState } from 'react';
import { Box, Typography, Card, TextField, Button, MenuItem, Alert } from '@mui/material';
import { useCreateContestMutation } from '../../api/apiSlice';

export default function ContestManager() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Weekly');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [message, setMessage] = useState('');

  const [createContestApi, { isLoading }] = useCreateContestMutation();

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hr from now
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

      await createContestApi({
        name,
        description,
        type,
        durationMinutes: Number(durationMinutes),
        startTime,
        endTime,
      }).unwrap();

      setMessage('🏆 Contest scheduled successfully!');
      setName('');
      setDescription('');
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to schedule contest.');
    }
  };

  return (
    <Box p={3} maxWidth={600}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Contest Scheduler
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Configure upcoming competitive programming contests and time limits.
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSchedule} display="flex" flexDirection="column" gap={2}>
          <TextField label="Contest Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} fullWidth />

          <TextField select label="Contest Type" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
            <MenuItem value="Weekly">Weekly Contest</MenuItem>
            <MenuItem value="Monthly">Monthly Championship</MenuItem>
            <MenuItem value="University">University Cup</MenuItem>
            <MenuItem value="Hiring">Hiring Assessment</MenuItem>
          </TextField>

          <TextField label="Duration (Minutes)" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} fullWidth />

          <Button type="submit" variant="contained" color="primary" size="large" disabled={isLoading} sx={{ py: 1.5 }}>
            {isLoading ? 'Scheduling...' : 'Schedule Contest'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
