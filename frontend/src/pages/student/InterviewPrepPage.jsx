import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Psychology as PatternIcon,
  Timer as MockIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetCompanyProblemsQuery,
  useGetCodingPatternsQuery,
  useCreateMockAssessmentMutation,
} from '../../api/apiSlice';

export default function InterviewPrepPage() {
  const [tab, setTab] = useState(0); // 0: Companies, 1: Patterns, 2: Mock Interview
  const [selectedCompany, setSelectedCompany] = useState('Amazon');
  const [openMockDialog, setOpenMockDialog] = useState(false);
  const [mockSession, setMockSession] = useState(null);

  const navigate = useNavigate();

  const { data: companyRes } = useGetCompanyProblemsQuery(selectedCompany);
  const { data: patternRes } = useGetCodingPatternsQuery();
  const [createMockApi] = useCreateMockAssessmentMutation();

  const companyProblems = companyRes?.data?.problems || [];
  const companyStats = companyRes?.data?.companyStats || {};
  const patterns = patternRes?.data || [];

  const handleStartMock = async () => {
    try {
      const res = await createMockApi({ company: selectedCompany, durationMinutes: 45 }).unwrap();
      setMockSession(res.data);
      setOpenMockDialog(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Interview Preparation Kit (Module 17)
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Target top tech companies (Amazon, Google, Microsoft, Meta), master classic coding patterns, and practice private mock assessments.
      </Typography>

      <Tabs value={tab} onChange={(e, val) => setTab(val)} borderBottom="1px solid" borderColor="divider" sx={{ mb: 4 }}>
        <Tab label="Company Tagged Problems" icon={<BusinessIcon />} iconPosition="start" />
        <Tab label="Coding Patterns" icon={<PatternIcon />} iconPosition="start" />
        <Tab label="Private Mock Assessment" icon={<MockIcon />} iconPosition="start" />
      </Tabs>

      {/* Tab 0: Company Tagged Problems */}
      {tab === 0 && (
        <Box>
          <Box display="flex" gap={2} mb={3}>
            {['Amazon', 'Google', 'Microsoft', 'Meta'].map((comp) => (
              <Button
                key={comp}
                variant={selectedCompany === comp ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSelectedCompany(comp)}
              >
                {comp} ({companyStats[comp] || 0})
              </Button>
            ))}
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="right">Solve</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companyProblems.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell fontWeight={600}>{p.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.difficulty}
                        color={p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {p.tags?.map((t) => <Chip key={t} label={t} size="small" variant="outlined" sx={{ mr: 0.5 }} />)}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CodeIcon />}
                        onClick={() => navigate(`/student/problem/${p.slug}`)}
                      >
                        Solve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Coding Patterns */}
      {tab === 1 && (
        <Grid container spacing={3}>
          {patterns.map((pat) => (
            <Grid item xs={12} md={6} key={pat.id}>
              <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{pat.name}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{pat.description}</Typography>
                  {pat.tags?.map((t) => <Chip key={t} label={t} size="small" color="secondary" sx={{ mr: 0.5, mb: 2 }} />)}
                </Box>
                <Button variant="outlined" color="primary" onClick={() => navigate('/student/problems')}>
                  Practice {pat.count || 0} Questions
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 2: Private Mock Assessment */}
      {tab === 2 && (
        <Card sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Simulated 45-Min Mock Interview
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} maxWidth={600} mx="auto">
            Experience a realistic, timed tech interview session with 2 randomized company problems without solution leaks or hints.
          </Typography>
          <Button variant="contained" color="error" size="large" startIcon={<MockIcon />} onClick={handleStartMock}>
            Launch Timed Mock Assessment ({selectedCompany})
          </Button>
        </Card>
      )}

      {/* Mock Session Dialog */}
      <Dialog open={openMockDialog} onClose={() => setOpenMockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Mock Interview Session Created!</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Session Token: <strong>{mockSession?.sessionToken}</strong>
          </Typography>
          <Typography variant="body2" mb={2}>
            Duration: <strong>{mockSession?.durationMinutes} minutes</strong>
          </Typography>
          <Typography fontWeight={700} mb={1}>Assigned Problems:</Typography>
          {mockSession?.problems?.map((p, idx) => (
            <Paper key={p._id} sx={{ p: 1.5, mb: 1 }}>
              <Typography variant="body2">
                Problem {idx + 1}: <strong>{p.title}</strong> ({p.difficulty})
              </Typography>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenMockDialog(false);
              if (mockSession?.problems?.[0]) {
                navigate(`/student/problem/${mockSession.problems[0].slug}`);
              }
            }}
          >
            Start Solving Problem 1
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
