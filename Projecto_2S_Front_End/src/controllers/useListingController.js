import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFavorite, getFavorites, removeFavorite } from "../models/favoritesModel";
import { getUserName } from "../models/userModel";

export default function useListingController(ads = [], onUnfavorite) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("utilizador_id");
  // Chave estável com os donos dos anúncios: evita voltar a pedir nomes quando o array "ads" é recriado.
  const ownerKey = useMemo(() => [...new Set(ads.map((ad) => ad.nome_user).filter(Boolean))].join(","), [ads]);
  const [favorites, setFavorites] = useState({});
  const [users, setUsers] = useState({});
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    if (!userId) { setFavorites({}); setLoadingFavorites(false); return () => { active = false; }; }
    setLoadingFavorites(true);
    getFavorites(userId)
      .then((items) => { if (!active) return; setFavorites(Object.fromEntries(items.map((item) => [item.anuncio_id, true]))); })
      .catch(() => active && setFavorites({}))
      .finally(() => active && setLoadingFavorites(false));
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    let active = true;
    const ownerIds = ownerKey ? ownerKey.split(",") : [];
    if (!ownerIds.length) { setUsers({}); return () => { active = false; }; }
    Promise.all(ownerIds.map(async (ownerId) => {
      try { const user = await getUserName(ownerId); return [ownerId, user.nome || "Desconhecido"]; }
      catch { return [ownerId, "Desconhecido"]; }
    })).then((entries) => { if (active) setUsers(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, [ownerKey]);

  const toggleFavorite = useCallback(async (event, adId) => {
    event.preventDefault();
    event.stopPropagation();
    if (!userId) { navigate("/login"); return; }
    try {
      if (favorites[adId]) {
        await removeFavorite(adId, userId);
        setFavorites((current) => ({ ...current, [adId]: false }));
        onUnfavorite?.(adId);
      } else {
        await addFavorite(adId, userId);
        setFavorites((current) => ({ ...current, [adId]: true }));
      }
    } catch (error) {
      if (error.response?.status === 409) setFavorites((current) => ({ ...current, [adId]: true }));
      else if (error.response?.status === 401) { localStorage.removeItem("utilizador_id"); navigate("/login"); }
      else setErrorMessage("Não foi possível atualizar os favoritos. Tenta novamente.");
    }
  }, [favorites, navigate, onUnfavorite, userId]);

  return { favorites, users, loadingFavorites, errorMessage, toggleFavorite, navigate };
}