import apiClient from './client';

export const getSkills = () => apiClient.get('/skills').then((r) => r.data);
export const getSkill = (name: string) => apiClient.get(`/skills/${name}`).then((r) => r.data);
export const getSkillsByCategory = (category: string) => apiClient.get(`/skills/category/${category}`).then((r) => r.data);
export const getSkillNames = () => apiClient.get('/skills/names').then((r) => r.data);
export const getSkillAnalytics = (name: string) => apiClient.get(`/skills/analytics/${name}`).then((r) => r.data);

export const createSkill = (data: {
  name: string;
  description: string;
  category: string;
  intentPatterns: string;
  parameters?: string;
  outputSchema?: string;
}) => apiClient.post('/skills', data).then((r) => r.data);

export const updateSkill = (name: string, data: {
  description?: string;
  category?: string;
  intentPatterns?: string;
  parameters?: string;
  outputSchema?: string;
  status?: string;
}) => apiClient.put(`/skills/${name}`, data).then((r) => r.data);

export const deleteSkill = (name: string) => apiClient.delete(`/skills/${name}`);

export const addExternalSkill = (data: {
  name: string;
  description: string;
  category: string;
  externalUrl: string;
  apiKey?: string;
}) => apiClient.post('/skills/external', data).then((r) => r.data);
