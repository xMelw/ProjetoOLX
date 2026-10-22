import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BotaoToTOP from "../components/botaoToTop";
import ProfileInfo from "../components/ProfileInfo";
import SubMenu from "../components/submenu";
import User_Anuncios from "../components/UserAnuncio";
import FeedbackSlider from "../parts/FeedBackSwiper";
import ModalUser from "../components/ModalUser";
import api from "../services/api";


const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [meusAnuncios, setMeusAnuncios] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const savedFiltro = localStorage.getItem("filtroEstado") || "ativo";
  const [filtroEstado, setFiltroEstado] = useState(savedFiltro);
  const [showUserModal, setShowUserModal] = useState(false);
  const [locations, setLocations] = useState([]); // lista de { localizacao_id, distrito }

  // Carrega lista de distritos (GET /localizacoes)
  useEffect(() => {
    api
      .get("/localizacoes")
      .then((res) => setLocations(res.data))
      .catch((err) => {
        console.error("Erro ao carregar localizações:", err);
        setLocations([]);
      });
  }, []);

  // Busca inicial de dados do usuário (GET /utilizador/:id + GET /feedbacks/media/:id)
  useEffect(() => {
    const storedId = localStorage.getItem("utilizador_id");
    if (!storedId || locations.length === 0) return;

    api
      .get(`/utilizador/${storedId}`, { withCredentials: true })
      .then((res) => {
        const u = res.data;
        return api
          .get(`/feedbacks/media/${storedId}`, { withCredentials: true })
          .then((respMedia) => {
            const mediaFeedback = respMedia.data.media_feedback;
            setUserInfo({
              id: u.user_id,
              imagem: u.imagem
                ? `http://localhost:5000/uploads/${u.imagem}`
                : "http://localhost:5000/uploads/placeholder.png",
              nome: u.nome,
              email: u.email,
              telemovel: u.telemovel,
              localizacaoId: u.localizacao_id,
              localizacaoNome: u.localizacao, // string “Porto”, etc.
              rating: parseFloat(mediaFeedback) || 0,
            });
          });
      })
      .catch((err) => {
        console.error("Erro ao obter dados do utilizador ou média de feedback:", err);
      });
  }, [locations]);

  // “Meus Anúncios” (GET /anuncios/utilizador/:id)
  useEffect(() => {
    if (!userInfo?.id) return;
    api
      .get(`/anuncios/utilizador/${userInfo.id}`, { withCredentials: true })
      .then((res) => {
        const mapped = res.data.map((a) => ({
          id: a.anuncio_id,
          imagem: a.imagem
            ? `http://localhost:5000/uploads/${a.imagem}`
            : "/placeholder.png",
          titulo: a.titulo,
          preco: `${parseFloat(a.preco).toFixed(2)} €`,
          views: a.visualizacao,
          data_hora: new Date(a.data_hora).toLocaleDateString(),
          categoria: a.categoria_id,
          nome_user: userInfo.nome,
          discricao: a.discricao,
          estado: a.estado,
          destaque: a.destaque,
        }));
        setMeusAnuncios(mapped);
      })
      .catch((err) => {
        console.error("Erro ao buscar meus anúncios:", err);
        setMeusAnuncios([]);
      });
  }, [userInfo?.id, userInfo?.nome]);

  // “Feedbacks recebidos” (GET /feedbacks/recebidos?utilizador_id=:id)
  useEffect(() => {
    if (!userInfo?.id) return;
    api
      .get(`/feedbacks/recebidos?utilizador_id=${userInfo.id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const mappedFeedbacks = res.data.map((f) => ({
          rating: f.classificacao,
          description: f.review,
          author: f.anunciante_nome || "Anónimo",
        }));
        setFeedbacks(mappedFeedbacks);
      })
      .catch((err) => {
        console.error("Erro ao buscar feedbacks:", err);
        setFeedbacks([]);
      });
  }, [userInfo?.id]);

  if (!userInfo) {
    return <p className="text-center mt-5">A carregar perfil...</p>;
  }

  const subMenuProfile = [
    { nome: "Feedbacks", caminho: "#Feedback" },
    { nome: "Meus Anúncios", caminho: "#MeusAnúncios" },
  ];

  // Filtro de “estado” aplicado à lista de anúncios
  const anunciosFiltrados =
    filtroEstado === "todos"
      ? meusAnuncios
      : meusAnuncios.filter((anuncio) => anuncio.estado === filtroEstado);

  // Quando o usuário for atualizado (PUT), buscar de volta o /utilizador/:id
  const handleUserUpdated = () => {
    api
      .get(`/utilizador/${userInfo.id}`, { withCredentials: true })
      .then((resUser) => {
        const u = resUser.data;
        setUserInfo((prev) => ({
          ...prev,
          nome: u.nome,
          email: u.email,
          telemovel: u.telemovel,
          localizacaoId: u.localizacao_id,
          localizacaoNome: u.localizacao, // string do distrito
          imagem: u.imagem
            ? `http://localhost:5000/uploads/${u.imagem}`
            : prev.imagem,
        }));
      })
      .catch((err) => {
        console.error("Erro ao recarregar usuário após update:", err);
      });
  };

  // Lida com mudança de filtro e armazena no localStorage
  const onChangeFiltro = (novo) => {
    setFiltroEstado(novo);
    localStorage.setItem("filtroEstado", novo);
  };

  return (
    <>
      <Header />

      <div
        className="profile-container d-flex flex-row justify-content-between align-items-start flex-wrap p-2 h-100 w-100"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="profile-info p-5 h-100 justify-content-center align-items-center"
          style={{ width: "35%" }}
        >
          <div
            className="d-flex flex-column gap-2 justify-content-center align-items-center h-100 p-5 rounded-3 shadow-sm"
            style={{ backgroundColor: "#F5F5F5", width: "100%" }}
          >
            <ProfileInfo
              user={{
                ...userInfo,
                localizacao: userInfo.localizacaoNome,
              }}
              onEdit={() => setShowUserModal(true)}
            />
          </div>

          <section id="Feedback" className="mt-4">
            <div className="feedback d-flex flex-column align-items-center justify-content-center w-100 h-100">
              <h2 className="text-dark align-self-center m-4">Feedbacks</h2>
              {feedbacks.length === 0 ? (
                <p className="text-center">Sem feedback registrado.</p>
              ) : (
                <FeedbackSlider feedback={feedbacks} />
              )}
            </div>
          </section>
        </div>

        {/*     COLUNA PRINCIPAL (sub-menu + Meus Anúncios) */}
        <div
          className="profile-anuncios d-flex flex-column h-100 p-2"
          style={{ width: "65%" }}
        >
          <SubMenu subMenu={subMenuProfile} />

          <section id="MeusAnúncios" className="">
            <div className="anuncios d-flex flex-column align-items-center justify-content-center w-100 m-0">
              <h2
                className="text-dark align-self-center mb-3"
                style={{ margin: 0 }}
              >
                Meus Anúncios
              </h2>

              {/*    FILTRO POR ESTADO */}
              <div
                className="w-100 d-flex justify-content-center mb-4"
                style={{ maxWidth: "300px" }}
              >
                <select
                  className="form-select w-auto"
                  value={filtroEstado}
                  onChange={(e) => onChangeFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="terminado">Terminados</option>
                  <option value="excluido">Excluídos</option>
                </select>
              </div>

              {/*    LISTA FILTRADA */}
              <div className="d-flex flex-row flex-wrap justify-content-start align-items-center w-100 h-100 gap-3">
                {anunciosFiltrados.length === 0 ? (
                  <p className="text-center">Não possui anúncios.</p>
                ) : (
                  anunciosFiltrados.map((anuncio) => (
                    <User_Anuncios key={anuncio.id} useranuncio={anuncio} />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <BotaoToTOP />
      <Footer />

      {/*       MODAL DE EDIÇÃO DE USUÁRIO */}
      <ModalUser
        show={showUserModal}
        handleClose={() => setShowUserModal(false)}
        initialData={{
          id: userInfo.id,
          nome: userInfo.nome,
          email: userInfo.email,
          telemovel: userInfo.telemovel,
          localizacao: userInfo.localizacaoId, // envia o ID
          imagem: null,
        }}
        locations={locations}
        onUpdated={handleUserUpdated}
      />

      <style>
        {`
        .profile-info img {
          border-radius: 50%;
        }
      `}
      </style>
    </>
  );
};

export default Profile;
