import api from "./apiClient";

export const getFeaturedAds = () => api.get("/anuncios/destaque").then(({ data }) => data);
export const getMostViewedAds = () => api.get("/anuncios/maisvistos/top30").then(({ data }) => data);
export const getAdsByCategory = (categoryId) => api.get(`/anuncios/categoria/${categoryId}`).then(({ data }) => data);
export const getAdById = (adId) => api.get(`/anuncios/${adId}`).then(({ data }) => data);
export const registerAdView = (adId) => api.post(`/anuncios/visualizar/${adId}`);
export const registerRecentAdView = (adId) => api.post("/recentes", { anuncio_id: Number(adId) }, { withCredentials: true });
export const getUserAds = (userId) => api.get(`/anuncios/utilizador/${userId}`, { withCredentials: true }).then(({ data }) => data);
export const createAd = (formData) => api.post("/anuncios/criar", formData, { withCredentials: true });
export const updateAd = (formData) => api.put("/anuncios/editar", formData, { withCredentials: true });
export const getAllAdminAds = () => api.get("/admin/ads/all", { withCredentials: true }).then(({ data }) => data);
export const updateAdminAdStatus = (data) => api.put("/admin/mudar_estado_anuncio", data, { withCredentials: true });
