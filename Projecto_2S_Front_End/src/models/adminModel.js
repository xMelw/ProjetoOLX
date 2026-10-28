import api from "./apiClient";

export const requestAdmin = (endpoint, method = "GET", data = null) => api({ method, url: endpoint, data, withCredentials: true }).then(({ data: response }) => response);
export const getAdminStats = () => requestAdmin("/admin/stats");