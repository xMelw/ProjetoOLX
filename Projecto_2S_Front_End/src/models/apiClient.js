import axios from "axios";

// URL da API: configurável com VITE_API_URL (ex.: .env.local); por omissão, a API local.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;
