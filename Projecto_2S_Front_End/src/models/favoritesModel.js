import api from "./apiClient";

export const getFavorites = (userId) => api.get(`/favoritos/${userId}`, { withCredentials: true }).then(({ data }) => data);
export const addFavorite = (adId, userId) => api.post("/favoritos", { anuncio_id: adId, utilizador_id: userId }, { withCredentials: true });
export const removeFavorite = (adId, userId) => api.delete("/favoritos", { data: { anuncio_id: adId, utilizador_id: userId }, withCredentials: true });