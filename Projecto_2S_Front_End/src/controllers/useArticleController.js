import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdView, registerRecentAdView } from "../models/adsModel";
import { addFavorite, getFavorites, removeFavorite } from "../models/favoritesModel";

export default function useArticleController(adId) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(() => localStorage.getItem("utilizador_id"));
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { registerAdView(adId).catch((error) => console.error("Erro ao registar visualização:", error)); }, [adId]);
  useEffect(() => {
    if (!userId) return;
    registerRecentAdView(adId).catch((error) => console.error("Erro ao registar anúncio recente:", error));
    getFavorites(userId).then((items) => setIsFavorite(items.some((item) => item.anuncio_id === Number(adId)))).catch((error) => console.error("Erro ao consultar favoritos:", error));
  }, [adId, userId]);

  const toggleFavorite = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!userId) { setErrorMessage("Inicia sessão para adicionar anúncios aos favoritos."); return; }
    try {
      if (isFavorite) { await removeFavorite(adId, userId); setIsFavorite(false); }
      else { await addFavorite(adId, userId); setIsFavorite(true); }
      setErrorMessage("");
    } catch (error) {
      if (error.response?.status === 409) setIsFavorite(true);
      else if (error.response?.status === 401) { localStorage.removeItem("utilizador_id"); setUserId(null); navigate("/login"); }
      else setErrorMessage("Não foi possível atualizar os favoritos. Tenta novamente.");
    }
  }, [adId, isFavorite, navigate, userId]);

  return { isFavorite, errorMessage, toggleFavorite };
}