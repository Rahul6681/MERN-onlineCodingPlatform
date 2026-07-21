import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  MenuItem,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Send as SubmitIcon,
  SmartToy as AiIcon,
  Forum as DiscussIcon,
  CheckCircle,
  Cancel,
  CheckCircleOutline as SolvedIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import {
  useGetProblemBySlugQuery,
  useRunCodeMutation,
  useSubmitCodeMutation,
  useGetAiHintMutation,
  useGetDiscussionsQuery,
  useGetMySubmissionsQuery,
  useLoginMutation,
} from '../../api/apiSlice';
import { setCredentials } from '../../features/authSlice';
import { getSocket } from '../../sockets/socketClient';

export default function ProblemDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetProblemBySlugQuery(slug);
  const problem = data?.data;

  const { data: submissionsData, refetch: refetchSubmissions } = useGetMySubmissionsQuery(undefined, { skip: !isAuthenticated });

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Description, 1: AI Hints, 2: Discussion
  const [consoleTab, setConsoleTab] = useState(0); // 0: Test Result, 1: Custom Input
  const [customInput, setCustomInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [aiHintText, setAiHintText] = useState('');
  const [isProblemSolved, setIsProblemSolved] = useState(false);

  const [runCodeApi, { isLoading: isRunning }] = useRunCodeMutation();
  const [submitCodeApi, { isLoading: isSubmitting }] = useSubmitCodeMutation();
  const [getAiHintApi, { isLoading: isAiLoading }] = useGetAiHintMutation();
  const [loginApi] = useLoginMutation();

  const { data: discussData } = useGetDiscussionsQuery(problem?._id, { skip: !problem?._id });

  // Set default starter code
  useEffect(() => {
    if (problem?.starterCode) {
      setCode(problem.starterCode[language] || problem.starterCode['javascript'] || '// Write your solution here');
    }
  }, [problem, language]);

  // Check if user has already solved this problem
  useEffect(() => {
    if (submissionsData?.data && problem?._id) {
      const hasAccepted = submissionsData.data.some(
        (sub) => (sub.problem?._id === problem._id || sub.problem === problem._id) && sub.status === 'Accepted'
      );
      if (hasAccepted) setIsProblemSolved(true);
    }
  }, [submissionsData, problem]);

  // Listen to Socket.IO status updates
  useEffect(() => {
    const socket = getSocket();
    const handleStatusUpdate = (res) => {
      setConsoleOutput({
        type: 'submit_complete',
        status: res.status,
        passed: res.status === 'Accepted',
        score: res.score,
        executionTimeMs: res.executionTimeMs,
        memoryUsedKb: res.memoryUsedKb,
        testCaseResults: res.testCaseResults || [],
      });
      if (res.status === 'Accepted') {
        setIsProblemSolved(true);
        refetchSubmissions();
      }
    };
    socket.on('submission:statusUpdate', handleStatusUpdate);
    return () => socket.off('submission:statusUpdate', handleStatusUpdate);
  }, [refetchSubmissions]);

  const autoLoginDemo = async () => {
    try {
      const res = await loginApi({ email: 'student@codearena.dev', password: 'password123' }).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      return res.data.token;
    } catch (e) {
      return null;
    }
  };

  const handleRun = async () => {
    setConsoleOutput({ type: 'running', message: 'Executing code against sample test case...' });
    try {
      if (!isAuthenticated) {
        await autoLoginDemo();
      }
      const res = await runCodeApi({
        problemId: problem._id,
        language,
        code,
        input: customInput || undefined,
      }).unwrap();
      setConsoleOutput({ type: 'run_result', ...res.data });
    } catch (err) {
      if (err?.status === 401 || err?.data?.message?.includes('authorized')) {
        await autoLoginDemo();
        try {
          const retryRes = await runCodeApi({ problemId: problem._id, language, code, input: customInput || undefined }).unwrap();
          setConsoleOutput({ type: 'run_result', ...retryRes.data });
          return;
        } catch (e) {}
      }
      setConsoleOutput({ type: 'error', message: err?.data?.message || 'Execution failed' });
    }
  };

  const handleSubmit = async () => {
    setConsoleOutput({ type: 'running', message: 'Evaluating test cases...' });
    try {
      if (!isAuthenticated) {
        await autoLoginDemo();
      }
      const res = await submitCodeApi({
        problemId: problem._id,
        language,
        code,
      }).unwrap();

      const subData = res?.data;
      if (subData) {
        setConsoleOutput({
          type: 'submit_complete',
          status: subData.status,
          passed: subData.status === 'Accepted',
          score: subData.score ?? (subData.status === 'Accepted' ? 100 : 0),
          executionTimeMs: subData.executionTimeMs || 0,
          memoryUsedKb: subData.memoryUsedKb || 0,
          testCaseResults: subData.testCaseResults || [],
        });

        if (subData.status === 'Accepted') {
          setIsProblemSolved(true);
          refetchSubmissions();
        }
      }
    } catch (err) {
      if (err?.status === 401 || err?.data?.message?.includes('authorized')) {
        await autoLoginDemo();
        try {
          const retryRes = await submitCodeApi({ problemId: problem._id, language, code }).unwrap();
          const subData = retryRes?.data;
          if (subData) {
            setConsoleOutput({
              type: 'submit_complete',
              status: subData.status,
              passed: subData.status === 'Accepted',
              score: subData.score ?? (subData.status === 'Accepted' ? 100 : 0),
              executionTimeMs: subData.executionTimeMs || 0,
              memoryUsedKb: subData.memoryUsedKb || 0,
              testCaseResults: subData.testCaseResults || [],
            });

            if (subData.status === 'Accepted') {
              setIsProblemSolved(true);
              refetchSubmissions();
            }
            return;
          }
        } catch (e) {}
      }
      setConsoleOutput({ type: 'error', message: err?.data?.message || 'Submission failed' });
    }
  };

  const fetchAiHint = async () => {
    try {
      const res = await getAiHintApi({ problemId: problem._id, code, language }).unwrap();
      setAiHintText(res.data.hint);
    } catch (err) {
      setAiHintText('Could not fetch AI hint right now.');
    }
  };

  if (isLoading) return <Box p={4} textAlign="center"><CircularProgress sx={{ color: '#ffa116' }} /></Box>;
  if (!problem) return <Box p={4}><Alert severity="error">Problem not found.</Alert></Box>;

  return (
    <Box display="flex" height="calc(100vh - 56px)" overflow="hidden" bgcolor="#1a1a1a">
      {/* Left Pane: Description, AI Hints & Discussion Tabs */}
      <Box width="45%" borderRight="1px solid #3e3e3e" display="flex" flexDirection="column" bgcolor="#282828">
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} borderBottom="1px solid #3e3e3e" sx={{ minHeight: 44 }}>
          <Tab label="Description" sx={{ color: '#9ea0a5', '&.Mui-selected': { color: '#ffa116', fontWeight: 700 } }} />
          <Tab label="AI Hints" icon={<AiIcon fontSize="small" />} iconPosition="start" sx={{ color: '#9ea0a5', '&.Mui-selected': { color: '#ffa116', fontWeight: 700 } }} />
          <Tab label="Discussion" icon={<DiscussIcon fontSize="small" />} iconPosition="start" sx={{ color: '#9ea0a5', '&.Mui-selected': { color: '#ffa116', fontWeight: 700 } }} />
        </Tabs>

        <Box p={3} flexGrow={1} overflow="auto">
          {activeTab === 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="h5" fontWeight={700} color="#eff1f6">{problem.title}</Typography>
                  {isProblemSolved && (
                    <Chip
                      icon={<SolvedIcon sx={{ fontSize: 16, color: '#00b8a3 !important' }} />}
                      label="Solved"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: 'rgba(0, 184, 163, 0.15)',
                        color: '#00b8a3',
                        border: '1px solid #00b8a3',
                      }}
                    />
                  )}
                </Box>
                <Chip
                  label={problem.difficulty}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: problem.difficulty === 'Easy' ? '#00b8a3' : problem.difficulty === 'Medium' ? '#ffc01e' : '#ff375f',
                    color: '#fff',
                  }}
                />
              </Box>

              <Box display="flex" gap={1} mb={3}>
                {problem.tags?.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderColor: '#3e3e3e', color: '#9ea0a5' }} />
                ))}
              </Box>

              <Typography variant="body1" color="#eff1f6" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }} mb={3}>
                {problem.description}
              </Typography>

              {problem.examples?.map((ex, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: '#1e1e1e', borderColor: '#3e3e3e' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#ffa116">Example {idx + 1}:</Typography>
                  <Typography variant="body2" fontFamily="Fira Code" color="#eff1f6" mt={0.5}>Input: {ex.input}</Typography>
                  <Typography variant="body2" fontFamily="Fira Code" color="#eff1f6">Output: {ex.output}</Typography>
                  {ex.explanation && <Typography variant="caption" color="#9ea0a5" display="block" mt={0.5}>Explanation: {ex.explanation}</Typography>}
                </Paper>
              ))}
            </>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={700} color="#eff1f6" gutterBottom>AI Coding Assistant</Typography>
              <Typography variant="body2" color="#9ea0a5" mb={2}>
                Stuck? Get progressive AI hints without exposing the full answer.
              </Typography>
              <Button variant="contained" sx={{ bgcolor: '#ffa116', color: '#000', '&:hover': { bgcolor: '#ffb84d' } }} onClick={fetchAiHint} disabled={isAiLoading}>
                {isAiLoading ? 'Analyzing...' : 'Request AI Hint'}
              </Button>
              {aiHintText && (
                <Alert severity="info" sx={{ mt: 3, whiteSpace: 'pre-line', bgcolor: '#1e1e1e', color: '#eff1f6', border: '1px solid #3e3e3e' }}>
                  {aiHintText}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={700} color="#eff1f6" gutterBottom>Community Discussion</Typography>
              {discussData?.data?.unlocked || isProblemSolved ? (
                discussData?.data?.threads?.length ? (
                  discussData.data.threads.map((t) => (
                    <Paper key={t._id} sx={{ p: 2, mb: 2, bgcolor: '#1e1e1e' }}>
                      <Typography fontWeight={700} color="#eff1f6">{t.title}</Typography>
                      <Typography variant="body2" color="#9ea0a5">{t.content}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="#9ea0a5">No discussion threads yet. Be the first to post a solution!</Typography>
                )
              ) : (
                <Alert severity="warning" sx={{ bgcolor: '#282828', color: '#ffc01e', border: '1px solid #ffc01e' }}>
                  🔒 Solve this problem to unlock Community Solutions & Discussion threads!
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Right Pane: Monaco Code Editor & Console */}
      <Box width="55%" display="flex" flexDirection="column" bgcolor="#1a1a1a">
        {/* Editor Controls Toolbar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} bgcolor="#282828" borderBottom="1px solid #3e3e3e">
          <TextField
            select
            size="small"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            sx={{ width: 140, '& .MuiInputBase-root': { color: '#eff1f6', bgcolor: '#1e1e1e', borderColor: '#3e3e3e' } }}
          >
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
          </TextField>

          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              sx={{ borderColor: '#3e3e3e', color: '#eff1f6', '&:hover': { bgcolor: '#3e3e3e' } }}
              startIcon={<RunIcon />}
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              Run Code
            </Button>

            <Button
              variant="contained"
              sx={{ bgcolor: '#00b8a3', color: '#fff', '&:hover': { bgcolor: '#008e7e' } }}
              startIcon={<SubmitIcon />}
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
            >
              Submit Solution
            </Button>
          </Box>
        </Box>

        {/* Monaco Editor Component */}
        <Box flexGrow={1}>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Box>

        {/* Console / Output Panel (LeetCode Style) */}
        <Box height="240px" bgcolor="#1e1e1e" borderTop="1px solid #3e3e3e" p={2} overflow="auto">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Tabs value={consoleTab} onChange={(e, val) => setConsoleTab(val)} sx={{ minHeight: 30 }}>
              <Tab label="Test Result" sx={{ py: 0, minHeight: 30, fontSize: '0.8rem', color: '#9ea0a5', '&.Mui-selected': { color: '#ffa116' } }} />
              <Tab label="Custom Testcase Input" sx={{ py: 0, minHeight: 30, fontSize: '0.8rem', color: '#9ea0a5', '&.Mui-selected': { color: '#ffa116' } }} />
            </Tabs>
          </Box>

          {consoleTab === 0 ? (
            consoleOutput ? (
              consoleOutput.type === 'running' ? (
                <Typography color="#ffa116">{consoleOutput.message}</Typography>
              ) : consoleOutput.type === 'run_result' ? (
                <Box color={consoleOutput.passed ? '#00b8a3' : '#ff375f'}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {consoleOutput.passed ? <CheckCircle color="success" /> : <Cancel color="error" />}
                    <Typography variant="h6" fontWeight={700}>
                      {consoleOutput.status}
                    </Typography>
                  </Box>
                  <Paper sx={{ p: 1.5, bgcolor: '#282828', borderColor: '#3e3e3e', mb: 1 }}>
                    <Typography variant="caption" color="#9ea0a5" display="block">Your Output:</Typography>
                    <Typography variant="body2" fontFamily="Fira Code" color="#eff1f6">
                      {consoleOutput.stdout || '(No output)'}
                    </Typography>
                  </Paper>
                  <Typography variant="caption" color="#9ea0a5">
                    Runtime: {consoleOutput.runtimeMs} ms
                  </Typography>
                </Box>
              ) : consoleOutput.type === 'submit_complete' ? (
                <Box color={consoleOutput.passed ? '#00b8a3' : '#ff375f'}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {consoleOutput.passed ? <CheckCircle color="success" /> : <Cancel color="error" />}
                    <Typography variant="h5" fontWeight={800}>
                      {consoleOutput.status}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#eff1f6" mb={1}>
                    Test Cases Passed Score: <strong>{consoleOutput.score}%</strong>
                  </Typography>
                  {consoleOutput.testCaseResults?.length > 0 && (
                    <Box mt={1}>
                      {consoleOutput.testCaseResults.map((tc, i) => (
                        <Paper key={i} sx={{ p: 1, mb: 1, bgcolor: '#282828', borderColor: '#3e3e3e' }}>
                          <Typography variant="caption" color={tc.passed ? '#00b8a3' : '#ff375f'}>
                            Testcase {i + 1}: {tc.passed ? 'PASSED ✅' : 'FAILED ❌'}
                          </Typography>
                          {!tc.passed && (
                            <Typography variant="body2" fontFamily="Fira Code" color="#ff375f">
                              Actual: {tc.actualOutput || 'Mismatched Output'}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography color="#ff375f" mb={1}>{consoleOutput.message}</Typography>
                  {consoleOutput.message?.includes('authorized') && (
                    <Button variant="contained" size="small" sx={{ bgcolor: '#ffa116', color: '#000' }} onClick={autoLoginDemo}>
                      Quick Log In (Demo Student)
                    </Button>
                  )}
                </Box>
              )
            ) : (
              <Typography variant="body2" color="#9ea0a5">
                Run your code or Submit to test your solution against input test cases.
              </Typography>
            )
          ) : (
            <Box>
              <TextField
                placeholder="Enter custom input string or JSON..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                multiline
                rows={4}
                fullWidth
                sx={{
                  '& .MuiInputBase-root': { color: '#eff1f6', bgcolor: '#282828', fontFamily: 'Fira Code' },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
