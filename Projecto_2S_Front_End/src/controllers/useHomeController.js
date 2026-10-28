import { useEffect, useState } from "react";
import { getFeaturedAds, getMostViewedAds } from "../models/adsModel";
import { formatDate, formatPrice, imageUrl } from "./formatters";

export default function useHomeController() {
  const [featuredAds, setFeaturedAds] = useState([]);
  const [popularAds, setPopularAds] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [popularError, setPopularError] = useState("");

  useEffect(() => {
    let active = true;
    getFeaturedAds()
      .then((ads) => active && setFeaturedAds(ads.map((ad) => ({ id: ad.anuncio_id, img: imageUrl(ad.imagem), nome: ad.titulo, preco: formatPrice(ad.preco) }))))
      .catch((error) => { console.error("Erro ao carregar destaques:", error); if (active) { setFeaturedAds([]); setFeaturedError(error.response?.data?.message || error.message || "Não foi possível carregar os destaques."); } })
      .finally(() => active && setLoadingFeatured(false));
    getMostViewedAds()
      .then((ads) => active && setPopularAds(ads.slice(0, 12).map((ad) => ({ id: ad.anuncio_id, imagem: imageUrl(ad.imagem), titulo: ad.titulo, preco: formatPrice(ad.preco), visualizacao: ad.visualizacao, data_hora: formatDate(ad.data_hora), categoria: ad.categoria_id, nome_user: ad.utilizador_id }))))
      .catch((error) => { console.error("Erro ao carregar anúncios populares:", error); if (active) { setPopularAds([]); setPopularError(error.response?.data?.message || error.message || "Não foi possível carregar os anúncios."); } })
      .finally(() => active && setLoadingPopular(false));
    return () => { active = false; };
  }, []);

  return { featuredAds, popularAds, loadingFeatured, loadingPopular, featuredError, popularError };
}
