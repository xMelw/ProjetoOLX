import { useEffect, useState } from "react";
import { getAdsByCategory } from "../models/adsModel";
import { getCategories } from "../models/categoryModel";
import { formatDate, formatPrice, imageUrl } from "./formatters";

export default function useCategoryController(categoryId) {
  const [ads, setAds] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getAdsByCategory(categoryId), getCategories()])
      .then(([categoryAds, categories]) => {
        if (!active) return;
        setAds(categoryAds.map((ad) => ({ id: ad.anuncio_id, imagem: imageUrl(ad.imagem), titulo: ad.titulo, preco: formatPrice(ad.preco), visualizacao: ad.visualizacao, data_hora: formatDate(ad.data_hora), categoria: ad.categoria_id, nome_user: ad.utilizador_id })));
        setCategoryName(categories.find((category) => String(category.categoria_id) === String(categoryId))?.nome || "");
      })
      .catch((error) => { console.error("Erro ao carregar a categoria:", error); if (active) { setAds([]); setCategoryName(""); } })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [categoryId]);
  return { ads, categoryName, loading };
}
