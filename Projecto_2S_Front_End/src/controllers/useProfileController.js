import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getFeedbackAverage, getReceivedFeedback } from "../models/userModel";
import { getUserAds } from "../models/adsModel";
import { getCategories, getLocations } from "../models/categoryModel";
import { formatDate, formatPrice, imageUrl } from "./formatters";

export default function useProfileController() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem("filtroEstado") || "ativo");
  const userId = localStorage.getItem("utilizador_id");

  useEffect(() => {
    let active = true;
    if (!userId) { navigate("/login"); return () => { active = false; }; }
    getLocations().then((items) => active && setLocations(items)).catch((error) => { console.error("Erro ao carregar localizações:", error); if (active) setLocations([]); });
    getCategories().then((items) => active && setCategories(items)).catch((error) => { console.error("Erro ao carregar categorias:", error); if (active) setCategories([]); });
    // Se a classificação falhar, o perfil continua a abrir (com 0 estrelas).
    Promise.all([getUser(userId), getFeedbackAverage(userId).catch(() => ({ media_feedback: 0 }))])
      .then(([user, rating]) => active && setUserInfo({ id: user.user_id || user.id, imagem: imageUrl(user.imagem), nome: user.nome, email: user.email, telemovel: user.telemovel, localizacaoId: user.localizacao_id, localizacaoNome: user.localizacao, rating: Number(rating.media_feedback) || 0 }))
      .catch((error) => {
        console.error("Erro ao carregar perfil:", error);
        if ([401, 403].includes(error.response?.status)) { localStorage.removeItem("utilizador_id"); navigate("/login"); }
      });
    return () => { active = false; };
  }, [userId, navigate]);

  useEffect(() => {
    if (!userInfo?.id) return;
    let active = true;
    getUserAds(userInfo.id)
      .then((items) => active && setMyAds(items.map((ad) => ({ id: ad.anuncio_id, imagem: imageUrl(ad.imagem), titulo: ad.titulo, preco: formatPrice(ad.preco), precoValor: Number(ad.preco) || 0, views: ad.visualizacao, data_hora: formatDate(ad.data_hora), categoria: ad.categoria_id, nome_user: userInfo.nome, discricao: ad.discricao, estado: ad.estado, destaque: ad.destaque, mostrar_contact: ad.mostrar_contact }))))
      .catch((error) => { console.error("Erro ao carregar anúncios do perfil:", error); if (active) setMyAds([]); });
    getReceivedFeedback(userInfo.id)
      .then((items) => active && setFeedbacks(items.map((item) => ({ rating: item.classificacao, description: item.review, author: item.anunciante_nome || "Anónimo" }))))
      .catch((error) => { console.error("Erro ao carregar feedbacks:", error); if (active) setFeedbacks([]); });
    return () => { active = false; };
  }, [userInfo?.id, userInfo?.nome]);

  const ads = useMemo(() => {
    const categoryNames = Object.fromEntries(categories.map((category) => [category.categoria_id, category.nome]));
    // "categoria" mantém o ID (usado no formulário de edição); "categoriaNome" é o texto apresentado.
    const named = myAds.map((ad) => ({ ...ad, categoriaNome: categoryNames[ad.categoria] || "" }));
    return filterStatus === "todos" ? named : named.filter((ad) => ad.estado === filterStatus);
  }, [myAds, categories, filterStatus]);
  const changeFilter = (value) => { setFilterStatus(value); localStorage.setItem("filtroEstado", value); };
  const refreshUser = async () => {
    if (!userInfo?.id) return;
    try {
      const user = await getUser(userInfo.id);
      setUserInfo((previous) => ({ ...previous, nome: user.nome, email: user.email, telemovel: user.telemovel, localizacaoId: user.localizacao_id, localizacaoNome: user.localizacao, imagem: user.imagem ? imageUrl(user.imagem) : previous.imagem }));
    } catch (error) { console.error("Erro ao atualizar o perfil apresentado:", error); }
  };
  return { userInfo, ads, feedbacks, locations, filterStatus, changeFilter, showUserModal, setShowUserModal, refreshUser };
}
