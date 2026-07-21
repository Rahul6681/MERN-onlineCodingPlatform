import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getCustomTheme } from './theme';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProblemList from './pages/student/ProblemList';
import ProblemDetail from './pages/student/ProblemDetail';
import ContestList from './pages/student/ContestList';
import ContestArena from './pages/student/ContestArena';
import LeaderboardPage from './pages/student/LeaderboardPage';
import ProfilePage from './pages/student/ProfilePage';
import LearningPathsPage from './pages/student/LearningPathsPage';
import InterviewPrepPage from './pages/student/InterviewPrepPage';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import ProblemManager from './pages/trainer/ProblemManager';
import ContestManager from './pages/trainer/ContestManager';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import AssessmentManager from './pages/recruiter/AssessmentManager';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManager from './pages/admin/UserManager';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';

export default function App() {
  const [mode, setMode] = useState('dark');
  const theme = getCustomTheme(mode);

  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="background.default">
          <Navbar mode={mode} toggleTheme={toggleTheme} />

          <Box display="flex" flexGrow={1}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'trainer']} />}>
                <Route
                  path="/student/*"
                  element={
                    <Box display="flex" width="100%">
                      <Sidebar />
                      <Box flexGrow={1} overflow="auto" height="calc(100vh - 64px)">
                        <Routes>
                          <Route path="" element={<StudentDashboard />} />
                          <Route path="problems" element={<ProblemList />} />
                          <Route path="problem/:slug" element={<ProblemDetail />} />
                          <Route path="contests" element={<ContestList />} />
                          <Route path="contest/:id" element={<ContestArena />} />
                          <Route path="leaderboard" element={<LeaderboardPage />} />
                          <Route path="profile" element={<ProfilePage />} />
                          <Route path="learning-paths" element={<LearningPathsPage />} />
                          <Route path="interview-prep" element={<InterviewPrepPage />} />
                        </Routes>
                      </Box>
                    </Box>
                  }
                />
              </Route>

              {/* Trainer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['trainer', 'admin']} />}>
                <Route
                  path="/trainer/*"
                  element={
                    <Box display="flex" width="100%">
                      <Sidebar />
                      <Box flexGrow={1} overflow="auto" height="calc(100vh - 64px)">
                        <Routes>
                          <Route path="" element={<TrainerDashboard />} />
                          <Route path="problems" element={<ProblemManager />} />
                          <Route path="contests" element={<ContestManager />} />
                        </Routes>
                      </Box>
                    </Box>
                  }
                />
              </Route>

              {/* Recruiter Routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
                <Route
                  path="/recruiter/*"
                  element={
                    <Box display="flex" width="100%">
                      <Sidebar />
                      <Box flexGrow={1} overflow="auto" height="calc(100vh - 64px)">
                        <Routes>
                          <Route path="" element={<RecruiterDashboard />} />
                          <Route path="assessments" element={<AssessmentManager />} />
                        </Routes>
                      </Box>
                    </Box>
                  }
                />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route
                  path="/admin/*"
                  element={
                    <Box display="flex" width="100%">
                      <Sidebar />
                      <Box flexGrow={1} overflow="auto" height="calc(100vh - 64px)">
                        <Routes>
                          <Route path="" element={<AdminDashboard />} />
                          <Route path="users" element={<UserManager />} />
                          <Route path="analytics" element={<PlatformAnalytics />} />
                        </Routes>
                      </Box>
                    </Box>
                  }
                />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/student" replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
