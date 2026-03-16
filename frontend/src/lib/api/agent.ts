import apiClient from './client';

export const createSession = (userId?: number, userName?: string) =>
  apiClient.post('/agent/session', { userId, userName }).then((r) => r.data);

export const sendQuery = (sessionId: string, query: string) =>
  apiClient.post('/agent/query', { sessionId, query }).then((r) => r.data);

export const endSession = (sessionId: string) =>
  apiClient.post(`/agent/session/${sessionId}/end`).then((r) => r.data);

export const getSession = (sessionId: string) =>
  apiClient.get(`/agent/session/${sessionId}`).then((r) => r.data);

export const getSessionHistory = (sessionId: string) =>
  apiClient.get(`/agent/session/${sessionId}/history`).then((r) => r.data);

export const submitFeedback = (data: {
  sessionId?: string;
  executionLogId?: number;
  skillName?: string;
  userId?: number;
  rating: number;
  comment?: string;
  isPositive: boolean;
}) => apiClient.post('/agent/feedback', data).then((r) => r.data);

export const getOptimization = () => apiClient.get('/agent/optimization').then((r) => r.data);
