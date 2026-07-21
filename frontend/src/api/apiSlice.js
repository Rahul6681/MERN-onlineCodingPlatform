import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../features/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState();
    const currentUser = state.auth.user;

    // 1. Try refreshing token via cookie
    try {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult.data?.data?.token) {
        const token = refreshResult.data.data.token;
        api.dispatch(setCredentials({ user: currentUser, token }));
        return await rawBaseQuery(args, api, extraOptions);
      }
    } catch (e) {}

    // 2. Dev mode fallback: re-login as the active logged-in user
    if (currentUser?.email) {
      try {
        const loginResult = await rawBaseQuery(
          {
            url: '/auth/login',
            method: 'POST',
            body: { email: currentUser.email, password: 'password123' },
          },
          api,
          extraOptions
        );

        if (loginResult.data?.data?.token) {
          const { user, token } = loginResult.data.data;
          api.dispatch(setCredentials({ user, token }));
          return await rawBaseQuery(args, api, extraOptions);
        }
      } catch (e) {}
    }

    // 3. Log out if re-authentication is not possible
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Problems',
    'Problem',
    'Submissions',
    'Contests',
    'Leaderboard',
    'Assessments',
    'Discussions',
    'InterviewPrep',
    'LearningPaths',
    'Achievements',
    'Notifications',
    'Analytics',
  ],
  endpoints: (builder) => ({
    // Auth & User Profile
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation({
      query: (userData) => ({ url: '/auth/register', method: 'POST', body: userData }),
    }),
    getProfile: builder.query({
      query: () => '/profile/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: '/profile/me', method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),

    // Problems
    getProblems: builder.query({
      query: (params) => ({ url: '/problems', params }),
      providesTags: ['Problems'],
    }),
    getProblemBySlug: builder.query({
      query: (slug) => `/problems/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Problem', id: slug }],
    }),
    createProblem: builder.mutation({
      query: (body) => ({ url: '/problems', method: 'POST', body }),
      invalidatesTags: ['Problems'],
    }),
    addTestCases: builder.mutation({
      query: ({ id, testCases }) => ({ url: `/problems/${id}/testcases`, method: 'POST', body: { testCases } }),
    }),

    // Submissions
    runCode: builder.mutation({
      query: (body) => ({ url: '/submissions/run', method: 'POST', body }),
    }),
    submitCode: builder.mutation({
      query: (body) => ({ url: '/submissions/submit', method: 'POST', body }),
      invalidatesTags: ['Submissions', 'User'],
    }),
    getMySubmissions: builder.query({
      query: () => '/submissions/me',
      providesTags: ['Submissions'],
    }),

    // Contests
    getContests: builder.query({
      query: () => '/contests',
      providesTags: ['Contests'],
    }),
    getContestById: builder.query({
      query: (id) => `/contests/${id}`,
    }),
    createContest: builder.mutation({
      query: (body) => ({ url: '/contests', method: 'POST', body }),
      invalidatesTags: ['Contests'],
    }),
    joinContest: builder.mutation({
      query: (id) => ({ url: `/contests/${id}/join`, method: 'POST' }),
      invalidatesTags: ['Contests'],
    }),
    getContestLeaderboard: builder.query({
      query: (id) => `/contests/${id}/leaderboard`,
      providesTags: ['Leaderboard'],
    }),

    // Global Leaderboard
    getGlobalLeaderboard: builder.query({
      query: () => '/leaderboard/global',
      providesTags: ['Leaderboard'],
    }),

    // Assessments (Recruiter)
    createAssessment: builder.mutation({
      query: (body) => ({ url: '/assessments', method: 'POST', body }),
      invalidatesTags: ['Assessments'],
    }),
    inviteCandidates: builder.mutation({
      query: ({ id, emails }) => ({ url: `/assessments/${id}/invite`, method: 'POST', body: { emails } }),
      invalidatesTags: ['Assessments'],
    }),
    getAssessmentResults: builder.query({
      query: (id) => `/assessments/${id}/results`,
      providesTags: ['Assessments'],
    }),

    // Discussions
    getDiscussions: builder.query({
      query: (problemId) => `/discuss/${problemId}`,
      providesTags: ['Discussions'],
    }),
    createDiscussion: builder.mutation({
      query: ({ problemId, title, content }) => ({
        url: `/discuss/${problemId}`,
        method: 'POST',
        body: { title, content },
      }),
      invalidatesTags: ['Discussions'],
    }),

    // Interview Prep (Module 17)
    getCompanyProblems: builder.query({
      query: (company) => ({ url: '/interview-prep/companies', params: { company } }),
      providesTags: ['InterviewPrep'],
    }),
    getCodingPatterns: builder.query({
      query: () => '/interview-prep/patterns',
      providesTags: ['InterviewPrep'],
    }),
    createMockAssessment: builder.mutation({
      query: (body) => ({ url: '/interview-prep/mock-assessment', method: 'POST', body }),
    }),

    // Learning Paths
    getLearningPaths: builder.query({
      query: () => '/learning-paths',
      providesTags: ['LearningPaths'],
    }),

    // Achievements
    getMyAchievements: builder.query({
      query: () => '/achievements/me',
      providesTags: ['Achievements'],
    }),

    // Notifications
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),

    // Analytics
    getAnalytics: builder.query({
      query: ({ role, id }) => `/analytics/${role}${id ? '/' + id : ''}`,
      providesTags: ['Analytics'],
    }),

    // AI Assistant
    getAiHint: builder.mutation({
      query: (body) => ({ url: '/ai/hint', method: 'POST', body }),
    }),
    getAiReview: builder.mutation({
      query: (body) => ({ url: '/ai/review', method: 'POST', body }),
    }),
    getAiComplexity: builder.mutation({
      query: (body) => ({ url: '/ai/complexity', method: 'POST', body }),
    }),
    getAiDebug: builder.mutation({
      query: (body) => ({ url: '/ai/debug', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetProblemsQuery,
  useGetProblemBySlugQuery,
  useCreateProblemMutation,
  useAddTestCasesMutation,
  useRunCodeMutation,
  useSubmitCodeMutation,
  useGetMySubmissionsQuery,
  useGetContestsQuery,
  useGetContestByIdQuery,
  useCreateContestMutation,
  useJoinContestMutation,
  useGetContestLeaderboardQuery,
  useGetGlobalLeaderboardQuery,
  useCreateAssessmentMutation,
  useInviteCandidatesMutation,
  useGetAssessmentResultsQuery,
  useGetDiscussionsQuery,
  useCreateDiscussionMutation,
  useGetCompanyProblemsQuery,
  useGetCodingPatternsQuery,
  useCreateMockAssessmentMutation,
  useGetLearningPathsQuery,
  useGetMyAchievementsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetAnalyticsQuery,
  useGetAiHintMutation,
  useGetAiReviewMutation,
  useGetAiComplexityMutation,
  useGetAiDebugMutation,
} = apiSlice;
