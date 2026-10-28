import api from "./apiClient";

export const getSellerConversations = () => api.get("/mensagens/anunciante", { withCredentials: true }).then(({ data }) => data);
export const getBuyerConversations = () => api.get("/mensagens/solicitante", { withCredentials: true }).then(({ data }) => data);
export const getChatMessages = (endpoint) => api.get(endpoint, { withCredentials: true }).then(({ data }) => data);
export const markChatMessagesRead = (data) => api.put("/mensagens/marcar_lidos", data, { withCredentials: true });
export const replyToConversation = (data) => api.post("/mensagens/resposta", data, { withCredentials: true });
export const sendAdMessage = (data) => api.post("/mensagens/enviar_mensagem_anuncio", data, { withCredentials: true });
export const getSellerConversationsForAd = () => api.get("/mensagens/anunciante", { withCredentials: true }).then(({ data }) => data);
export const getUserNameForChat = (userId) => api.get(`/utilizador/nome/${userId}`, { withCredentials: true }).then(({ data }) => data);
