import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdById } from "../models/adsModel";
import { getFavorites } from "../models/favoritesModel";
import { formatDate, formatPrice, imageUrl } from "./formatters";

export default function useFavoritesController() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const userId = localStorage.getItem("utilizador_id");
    if (!userId) { navigate("/login"); return () => { active = false; }; }
    getFavorites(userId)
      // allSettled: um favorito que já não exista não pode esconder todos os outros.
      .then((favorites) => Promise.allSettled(favorites.map(({ anuncio_id }) => getAdById(anuncio_id))))
      .then((results) => active && setAds(results.filter((result) => result.status === "fulfilled").map(({ value: ad }) => ({ id: ad.anuncio_id, imagem: imageUrl(ad.imagem), titulo: ad.titulo, preco: formatPrice(ad.preco), visualizacao: ad.visualizacao, data_hora: formatDate(ad.data_hora), nome_user: ad.utilizador_id }))))
      .catch((error) => {
        console.error("Erro ao carregar favoritos:", error);
        if (error.response?.status === 401) { localStorage.removeItem("utilizador_id"); navigate("/login"); }
        if (active) setAds([]);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [navigate]);
  const removeFavoriteFromView = useCallback((adId) => setAds((previous) => previous.filter((ad) => ad.id !== adId)), []);
  return { ads, loading, removeFavoriteFromView };
}
