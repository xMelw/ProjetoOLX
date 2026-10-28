import api from "./apiClient";

export const login = (credentials) => api.post("/login", credentials).then(({ data }) => data);
export const register = (formData) => api.post("/registro", formData).then(({ data }) => data);
export const logout = () => api.post("/logout");