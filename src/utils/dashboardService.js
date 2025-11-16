import api from './api';

export const dashboardService = {
  getAdminStats: async () => {
    return await api.get('/dashboard/admin/stats');
  },
  getAdminActivity: async () => {
    return await api.get('/dashboard/admin/recent-activity');
  },
  getDoctorStats: async () => {
    return await api.get('/dashboard/doctor/stats');
  },
  getDoctorQueue: async () => {
    return await api.get('/dashboard/doctor/queue');
  },
  getReceptionistStats: async () => {
    return await api.get('/dashboard/receptionist/stats');
  },
  getReceptionistAppointments: async () => {
    return await api.get('/dashboard/receptionist/appointments');
  },
};