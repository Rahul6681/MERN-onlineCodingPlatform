import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { useCreateProblemMutation, useAddTestCasesMutation } from '../../api/apiSlice';

export default function ProblemManager() {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tags, setTags] = useState('Arrays, HashTable');
  const [companies, setCompanies] = useState('Amazon, Google');
  const [description, setDescription] = useState('');

  // Sample & Hidden Testcases
  const [sampleInput, setSampleInput] = useState('nums = [2,7,11,15], target = 9');
  const [sampleOutput, setSampleOutput] = useState('[0,1]');
  const [hiddenInput, setHiddenInput] = useState('nums = [3,2,4], target = 6');
  const [hiddenOutput, setHiddenOutput] = useState('[1,2]');

  const [message, setMessage] = useState('');

  const [createProblemApi, { isLoading }] = useCreateProblemMutation();
  const [addTestCasesApi] = useAddTestCasesMutation();

  const handlePublish = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const tagArray = tags.split(',').map((t) => t.trim());
      const companyArray = companies.split(',').map((c) => c.trim());

      const res = await createProblemApi({
        title,
        difficulty,
        tags: tagArray,
        companies: companyArray,
        description,
        examples: [{ input: sampleInput, output: sampleOutput }],
      }).unwrap();

      const problemId = res.data._id;
      await addTestCasesApi({
        id: problemId,
        testCases: [
          { type: 'sample', input: sampleInput, expectedOutput: sampleOutput },
          { type: 'hidden', input: hiddenInput, expectedOutput: hiddenOutput },
        ],
      }).unwrap();

      setMessage('✨ Problem & Test Cases published successfully!');
      setTitle('');
      setDescription('');
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to create problem.');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Problem Authoring Studio
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Create new coding problems, define constraints, and configure sample/hidden test cases.
      </Typography>

      {message && <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box component="form" onSubmit={handlePublish} display="flex" flexDirection="column" gap={2}>
              <TextField label="Problem Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} fullWidth>
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Companies" value={companies} onChange={(e) => setCompanies(e.target.value)} fullWidth />
                </Grid>
              </Grid>

              <TextField
                label="Problem Description (Markdown)"
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
              />

              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" fontWeight={700}>Test Case Configuration</Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography fontWeight={700} mb={1}>Sample Test Case (Public)</Typography>
                    <TextField label="Input" value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} multiline rows={2} fullWidth sx={{ mb: 1 }} />
                    <TextField label="Expected Output" value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} fullWidth />
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography fontWeight={700} mb={1}>Hidden Test Case (Judge Only)</Typography>
                    <TextField label="Input" value={hiddenInput} onChange={(e) => setHiddenInput(e.target.value)} multiline rows={2} fullWidth sx={{ mb: 1 }} />
                    <TextField label="Expected Output" value={hiddenOutput} onChange={(e) => setHiddenOutput(e.target.value)} fullWidth />
                  </Paper>
                </Grid>
              </Grid>

              <Button type="submit" variant="contained" color="primary" size="large" disabled={isLoading} sx={{ mt: 2, py: 1.5 }}>
                {isLoading ? 'Publishing...' : 'Publish Problem'}
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Authoring Tips</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              1. Provide clear constraints (e.g. 1 &le; N &le; 10<sup>5</sup>).
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              2. Add at least one hidden edge-case (empty array, negative numbers, single element).
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3. Published problems immediately appear in student lists and contest pickers.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
