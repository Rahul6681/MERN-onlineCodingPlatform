import React, { useState } from 'react';
import { Box, Typography, Card, TextField, Button, Alert, Grid, FormControlLabel, Switch } from '@mui/material';
import { useCreateAssessmentMutation, useInviteCandidatesMutation } from '../../api/apiSlice';

export default function AssessmentManager() {
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [candidateEmails, setCandidateEmails] = useState('candidate1@example.com, candidate2@example.com');
  const [message, setMessage] = useState('');

  const [createAssessmentApi, { isLoading }] = useCreateAssessmentMutation();
  const [inviteCandidatesApi] = useInviteCandidatesMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createAssessmentApi({
        title,
        durationMinutes: Number(durationMinutes),
        proctoringEnabled,
      }).unwrap();

      const assessmentId = res.data._id;
      const emails = candidateEmails.split(',').map((e) => e.trim());

      await inviteCandidatesApi({ id: assessmentId, emails }).unwrap();

      setMessage(`🎉 Assessment "${title}" created and invitations dispatched to candidates!`);
      setTitle('');
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to create assessment.');
    }
  };

  return (
    <Box p={3} maxWidth={650}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Create Candidate Assessment
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Generate timed coding test links, invite candidates via email, and enable proctoring logs.
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleCreate} display="flex" flexDirection="column" gap={2}>
          <TextField label="Assessment Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
          <TextField label="Duration (Minutes)" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} fullWidth />

          <TextField
            label="Candidate Emails (comma-separated)"
            multiline
            rows={3}
            value={candidateEmails}
            onChange={(e) => setCandidateEmails(e.target.value)}
            required
            fullWidth
          />

          <FormControlLabel
            control={<Switch checked={proctoringEnabled} onChange={(e) => setProctoringEnabled(e.target.checked)} color="secondary" />}
            label="Enable Anti-Cheating Proctoring Logs (Tab Switch & Copy-Paste Detection)"
          />

          <Button type="submit" variant="contained" color="secondary" size="large" disabled={isLoading} sx={{ py: 1.5 }}>
            {isLoading ? 'Creating Assessment...' : 'Create & Send Candidate Invites'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
