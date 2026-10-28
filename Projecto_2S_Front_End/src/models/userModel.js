import api from "./apiClient";

export const getUser = (userId) => api.get(`/utilizador/${userId}`, { withCredentials: true }).then(({ data }) => data);
export const getUserName = (userId) => api.get(`/utilizador/nome/${userId}`, { withCredentials: true }).then(({ data }) => data);
export const updateUser = (formData) => api.put("/utilizador/atualizar", formData, { withCredentials: true });
export const getFeedbackAverage = (userId) => api.get(`/feedbacks/media/${userId}`, { withCredentials: true }).then(({ data }) => data);
export const getReceivedFeedback = (userId) => api.get(`/feedbacks/recebidos?utilizador_id=${userId}`, { withCredentials: true }).then(({ data }) => data);