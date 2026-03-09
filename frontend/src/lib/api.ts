import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器：处理 401 未授权
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const register = (username: string, password: string, email: string, role: string = 'USER') =>
  api.post('/auth/register', { username, password, email, role }).then((r) => r.data);

// Requirements
export const getRequirements = () => api.get('/requirements').then((r) => r.data);
export const getRequirement = (id: number) => api.get(`/requirements/${id}`).then((r) => r.data);
export const createRequirement = (data: { title: string; description?: string; status?: string; priority?: string; projectId: number }) =>
  api.post('/requirements', data).then((r) => r.data);
export const updateRequirement = (id: number, data: { title?: string; description?: string; status?: string; priority?: string }) =>
  api.put(`/requirements/${id}`, data).then((r) => r.data);
export const deleteRequirement = (id: number) => api.delete(`/requirements/${id}`);

// Tasks
export const getTasks = () => api.get('/tasks').then((r) => r.data);
export const getTask = (id: number) => api.get(`/tasks/${id}`).then((r) => r.data);
export const createTask = (data: {
  title: string;
  description?: string;
  status?: string;
  requirementId: number;
  assigneeId?: number;
  progress?: number;
  teamId?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  estimatedDays?: number;
  plannedDays?: number;
  remainingDays?: number;
  estimatedHours?: number;
}) => api.post('/tasks', data).then((r) => r.data);
export const updateTask = (id: number, data: {
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: number;
  progress?: number;
  teamId?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  estimatedDays?: number;
  plannedDays?: number;
  remainingDays?: number;
  estimatedHours?: number;
}) => api.put(`/tasks/${id}`, data).then((r) => r.data);
export const logTaskHours = (id: number, hours: number) =>
  api.patch(`/tasks/${id}/log-hours`, { hours }).then((r) => r.data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);

// Team Members
export const getTeamMembers = () => api.get('/team-members').then((r) => r.data);
export const getTeamMember = (id: number) => api.get(`/team-members/${id}`).then((r) => r.data);
export const createTeamMember = (data: { name: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  api.post('/team-members', data).then((r) => r.data);
export const updateTeamMember = (id: number, data: { name?: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  api.put(`/team-members/${id}`, data).then((r) => r.data);
export const deleteTeamMember = (id: number) => api.delete(`/team-members/${id}`);

// Dashboard
export const getProjectOverview = (projectId: number) =>
  api.get(`/dashboard/project/${projectId}`).then((r) => r.data);
export const getTeamLoad = (teamId: number) =>
  api.get(`/dashboard/team/${teamId}/load`).then((r) => r.data);

// Requirement Tags
export const getRequirementTags = () => api.get('/requirement-tags').then((r) => r.data);
export const createRequirementTag = (data: { name: string; color?: string; sortOrder?: number }) =>
  api.post('/requirement-tags', data).then((r) => r.data);
export const updateRequirementTag = (id: number, data: { name?: string; color?: string; sortOrder?: number }) =>
  api.put(`/requirement-tags/${id}`, data).then((r) => r.data);
export const deleteRequirementTag = (id: number) => api.delete(`/requirement-tags/${id}`);

// AI Query
export const aiQuery = (query: string) =>
  api.post('/ai/query', { query }).then((r) => r.data);

export default api;
