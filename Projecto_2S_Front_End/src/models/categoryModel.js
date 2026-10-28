import api from "./apiClient";

export const getCategories = () => api.get("/categorias").then(({ data }) => data);
export const getLocations = () => api.get("/localizacoes").then(({ data }) => data);