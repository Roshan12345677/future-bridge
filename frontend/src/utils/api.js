/**
 * API Service - Axios instance with interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('API URL:', API_BASE_URL); // Remove after debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('fb_token');
      localStorage.removeItem('fb_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('You are not authorized to perform this action');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// API methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  verify: () => api.get('/auth/verify'),
  checkEmail: (data) => api.post('/auth/check-email', data),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
  addLesson: (id, data) => api.post(`/courses/${id}/lessons`, data),
};

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
};

export const dsaAPI = {
  getAll: (params) => api.get('/dsa', { params }),
  getOne: (slug) => api.get(`/dsa/${slug}`),
  updateProgress: (data) => api.post('/dsa/progress', data),
  getStats: () => api.get('/dsa/stats'),
  create: (data) => api.post('/dsa', data),
};

export const chatAPI = {
  getMessages: (params) => api.get('/chat', { params }),
  sendMessage: (data) => api.post('/chat', data),
  deleteMessage: (id) => api.delete(`/chat/${id}`),
};

export const compilerAPI = {
  execute: (data) => api.post('/compiler/execute', data),
  getTemplates: () => api.get('/compiler/templates'),
};

export const aiAPI = {
  interview: (data) => api.post('/ai/interview', data),
  generateResume: (data) => api.post('/ai/resume', data),
  coverLetter: (data) => api.post('/ai/cover-letter', data),
  codeReview: (data) => api.post('/ai/code-review', data),
  chat: (data) => api.post('/ai/chat', data),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export const ssbtAPI = {
  // Courses
  getCourses: () => api.get('/ssbt/courses'),
  getCourse: (id) => api.get(`/ssbt/courses/${id}`),
  createCourse: (data) => api.post('/ssbt/courses', data),
  updateCourse: (id, data) => api.put(`/ssbt/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/ssbt/courses/${id}`),
  enrollStudent: (id, data) => api.post(`/ssbt/courses/${id}/enroll`, data),
  getCourseStudents: (id, params) => api.get(`/ssbt/courses/${id}/students`, { params }),
  // Semesters & Subjects
  getSemester: (id, sem) => api.get(`/ssbt/courses/${id}/semester/${sem}`),
  addSemester: (id, data) => api.post(`/ssbt/courses/${id}/semester`, data),
  addSubject: (id, sem, data) => api.post(`/ssbt/courses/${id}/semester/${sem}/subject`, data),
  // Notes
  addNote: (id, sem, subId, data) => api.post(`/ssbt/courses/${id}/semester/${sem}/subject/${subId}/notes`, data),
  deleteNote: (id, sem, subId, noteId) => api.delete(`/ssbt/courses/${id}/semester/${sem}/subject/${subId}/notes/${noteId}`),
  // Videos
  addVideo: (id, sem, subId, data) => api.post(`/ssbt/courses/${id}/semester/${sem}/subject/${subId}/videos`, data),
  deleteVideo: (id, sem, subId, videoId) => api.delete(`/ssbt/courses/${id}/semester/${sem}/subject/${subId}/videos/${videoId}`),
  // Papers
  addPaper: (id, sem, subId, data) => api.post(`/ssbt/courses/${id}/semester/${sem}/subject/${subId}/papers`, data),
  deletePaper: (id, sem, subId, paperId) => api.delete(`/ssbt/courses/${id}/semester/${sem}/subject/${subId}/papers/${paperId}`),
  // Attendance
  createSession: (data) => api.post('/ssbt/attendance', data),
  getSessions: (params) => api.get('/ssbt/attendance/sessions', { params }),
  getSession: (id) => api.get(`/ssbt/attendance/sessions/${id}`),
  updateSession: (id, data) => api.put(`/ssbt/attendance/sessions/${id}`, data),
  getMyAttendance: (params) => api.get('/ssbt/attendance/my-attendance', { params }),
  getSubjectReport: (params) => api.get('/ssbt/attendance/subject-report', { params }),
  getAttendanceStats: () => api.get('/ssbt/attendance/stats'),
};

export const assignmentsAPI = {
  getAll: () => api.get('/assignments'),
  create: (data) => api.post('/assignments', data),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (id, subId, data) => api.patch(`/assignments/${id}/submissions/${subId}/grade`, data),
};

export default api;
