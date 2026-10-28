import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdById, getAdsByCategory } from "../models/adsModel";
import { formatDate, formatPrice, imageUrl } from "./formatters";

export default function useAdDetailController(adId) {
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [relatedAds, setRelatedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setAd(null);
    setRelatedAds([]);
    getAdById(adId)
      .then(async (item) => {
        if (!active) return;
        setAd({ id: item.anuncio_id, imagem: imageUrl(item.imagem), titulo: item.titulo, preco: formatPrice(item.preco), views: item.visualizacao, data_hora: formatDate(item.data_hora), categoria: item.categoria?.nome || "", nome_user: item.utilizador?.nome || "Desconhecido", descricao: item.discricao, contacto: item.mostrar_contact ? item.utilizador?.telemovel : null, email: item.mostrar_contact ? item.utilizador?.email : null, distrito: item.utilizador?.localizacao?.distrito || "", destaque: item.destaque });
        setLoading(false);
        try {
          const categoryAds = await getAdsByCategory(item.categoria_id);
          if (active) setRelatedAds(categoryAds.filter((candidate) => candidate.anuncio_id !== item.anuncio_id).slice(0, 4).map((candidate) => ({ id: candidate.anuncio_id, img: imageUrl(candidate.imagem), nome: candidate.titulo, preco: formatPrice(candidate.preco) })));
        } catch (error) { console.error("Erro ao carregar anúncios relacionados:", error); }
      })
      .catch((error) => { console.error("Erro ao carregar o anúncio:", error); if (active) { setAd(null); setLoading(false); } });
    return () => { active = false; };
  }, [adId]);
  const goBack = () => { const historyIndex = window.history.state?.idx; if (Number.isInteger(historyIndex) && historyIndex > 0) navigate(-1); else navigate("/anuncios"); };
  return { ad, relatedAds, loading, goBack };
}
