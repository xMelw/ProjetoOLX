import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories } from "../models/categoryModel";
import { getAdsByCategory, getMostViewedAds } from "../models/adsModel";
import { formatDate, formatPrice, imageUrl, toTimestamp } from "./formatters";

const toCatalogAd = (ad) => ({
  id: ad.anuncio_id,
  imagem: imageUrl(ad.imagem),
  titulo: ad.titulo,
  precoValor: Number(ad.preco) || 0,
  preco: formatPrice(ad.preco),
  visualizacao: Number(ad.visualizacao) || 0,
  timestamp: toTimestamp(ad.data_hora),
  data_hora: formatDate(ad.data_hora),
  categoria: ad.categoria_id,
  nome_user: ad.utilizador_id,
});

export default function useCatalogController() {
  const [searchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get("pesquisa") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sort, setSort] = useState("recentes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setSearch(searchParams.get("pesquisa") || ""); }, [searchParams]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // "Todos os anúncios": o endpoint dos mais vistos só devolve os 30 primeiros,
        // por isso o catálogo junta os anúncios ativos de todas as categorias.
        let categoryList = [];
        try {
          categoryList = await getCategories();
          if (active) setCategories(categoryList);
        } catch (requestError) {
          console.error("Erro ao carregar categorias:", requestError);
        }
        const lists = categoryList.length
          ? await Promise.all(categoryList.map(({ categoria_id: categoryId }) => getAdsByCategory(categoryId)))
          : [await getMostViewedAds()];
        if (active) setAds(lists.flat().map(toCatalogAd));
      } catch (requestError) {
        console.error("Erro ao carregar anúncios:", requestError);
        if (active) setError("Não foi possível carregar os anúncios. Tenta novamente mais tarde.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filteredAds = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-PT");
    const results = ads.filter((ad) => (!term || ad.titulo.toLocaleLowerCase("pt-PT").includes(term)) && (!selectedCategory || String(ad.categoria) === selectedCategory) && (minimumPrice === "" || ad.precoValor >= Number(minimumPrice)) && (maximumPrice === "" || ad.precoValor <= Number(maximumPrice)));
    return results.sort((a, b) => sort === "preco-crescente" ? a.precoValor - b.precoValor : sort === "preco-decrescente" ? b.precoValor - a.precoValor : sort === "popularidade" ? b.visualizacao - a.visualizacao : (b.timestamp - a.timestamp) || (b.id - a.id));
  }, [ads, search, selectedCategory, minimumPrice, maximumPrice, sort]);

  const clearFilters = () => { setSearch(""); setSelectedCategory(""); setMinimumPrice(""); setMaximumPrice(""); setSort("recentes"); };
  return { categories, search, setSearch, selectedCategory, setSelectedCategory, minimumPrice, setMinimumPrice, maximumPrice, setMaximumPrice, sort, setSort, loading, error, filteredAds, clearFilters };
}
