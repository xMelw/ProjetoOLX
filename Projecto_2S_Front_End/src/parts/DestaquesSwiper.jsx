import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Tooltip as BootstrapTooltip } from "bootstrap";
import api from "../services/api";

// Estilos Swiper (obrigatórios)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Módulos que vamos usar
import { Navigation, Pagination, Autoplay } from "swiper/modules";

function DestaquesSwiper({ artigos = [] }) {
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [favoritos, setFavoritos] = useState({});
  const [favoritosCarregados, setFavoritosCarregados] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verifica se o user está logado e carrega o ID
  useEffect(() => {
    const storedId = localStorage.getItem("utilizador_id");
    if (storedId) {
      setUserLoggedIn(true);
      setUserId(parseInt(storedId, 10));
    } else {
      setUserLoggedIn(false);
    }
  }, []);

  // Carrega todos os favoritos do user (ou marca carregado se não estiver logado)
  useEffect(() => {
    if (userLoggedIn && userId) {
      api
        .get(`/favoritos/${userId}`, { withCredentials: true })
        .then((res) => {
          const favMap = {};
          res.data.forEach((fav) => {
            favMap[fav.anuncio_id] = true;
          });
          setFavoritos(favMap);
          setFavoritosCarregados(true);
        })
        .catch(() => {
          setFavoritos({});
          setFavoritosCarregados(true);
        });
    } else {
      // se não está logado, considera carregado sem favoritos
      setFavoritos({});
      setFavoritosCarregados(true);
    }
  }, [userLoggedIn, userId]);

  // Trata clique no coração (favorito / desfavorito)
  const handleLikeToggle = (e, artigoId) => {
    e.preventDefault();
    e.stopPropagation(); // evita interferir em qualquer clique no slide

    if (!userLoggedIn || !userId) {
      // Apenas utilizadores logados podem adicionar aos favoritos.
      return;
    }

    const jaFavoritado = !!favoritos[artigoId];
    if (jaFavoritado) {
      api
        .delete(`/favoritos`, {
          data: { anuncio_id: artigoId, utilizador_id: userId },
          withCredentials: true,
        })
        .then(() => {
          setFavoritos((prev) => ({ ...prev, [artigoId]: false }));
        })
        .catch((err) => console.error("Erro ao remover favorito", err));
    } else {
      api
        .post(
          `/favoritos`,
          { anuncio_id: artigoId, utilizador_id: userId },
          { withCredentials: true }
        )
        .then(() => {
          setFavoritos((prev) => ({ ...prev, [artigoId]: true }));
        })
        .catch((err) => {
          console.error("Erro ao adicionar favorito", err);
          if (err.response?.status === 409) {
            // já existia favorito, apenas marcamos localmente
            setFavoritos((prev) => ({ ...prev, [artigoId]: true }));
          } else if (err.response?.status === 403) {
            setErrorMessage("Ação não permitida. Verifique sua sessão.");
            setTimeout(() => setErrorMessage(""), 3000);
          }
        });
    }
  };

  // Inicializa ou reinicializa tooltips do Bootstrap
  useEffect(() => {
    setTimeout(() => {
      document
        .querySelectorAll("[data-bs-toggle='tooltip']")
        .forEach((el) => {
          const existing = BootstrapTooltip.getInstance(el);
          if (existing) existing.dispose();
          new BootstrapTooltip(el);
        });
    }, 100);
  }, [artigos, favoritos]);

  // Se ainda não carregou favoritos, retorna null (ou pode exibir um loader)
  if (!favoritosCarregados) return null;

  return (
    <>
      {errorMessage && (
        <div className="alert alert-warning text-center py-1">{errorMessage}</div>
      )}

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={"auto"}
        spaceBetween={20}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 1 },
          853: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 5 },
        }}
      >
        {artigos.map((artigo) => {
          const { img, nome, preco, id } = artigo;
          // img: nome do arquivo no backend, ex: "1748739102719_tr.jpg"
          const urlImagem = img
          ? img.startsWith("http")
            ? img
            : `http://localhost:5000/uploads/${img}`
          : "/placeholder.png";

          return (
            <SwiperSlide key={id} style={{ width: "auto", height: "400px" }}>
              <div className="artigo-card">
                {/*  NÃO colocamos mais href="#" pois não queremos a âncora “#” 
                     Chamamos o navigate() direto ao clicar em qualquer parte, exceto coração */}
                <div
                  className="artigo-link"
                  onClick={() => navigate(`/Anuncio/${id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="artigo-card-inner">
                    <div className="artigo-card-front">
                      <img
                        className="object-fit-cover"
                        src={urlImagem}
                        alt={nome}
                      />
                    </div>
                    <div className="artigo-card-back">
                      <p>{nome}</p>
                    </div>
                  </div>
                </div>

                <div className="artigo-card-footer d-flex justify-content-between">
                  <p className="artigo-preco m-0 fw-bold">{preco}</p>
                  <span
                    className="heart-icon"
                    onClick={(e) => handleLikeToggle(e, id)}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        favoritos[id]
                          ? "bi-heart-fill text-danger"
                          : "bi-heart text-dark"
                      }`}
                    ></i>
                  </span>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style>
        {`
          .custom-tooltip {
            --bs-tooltip-bg: var(--bd-violet-bg);
            --bs-tooltip-color: var(--bs-white);
          }
          .anuncio-card-front, .anuncio-card-back {
            height: 100%!important;
            padding: 2px!important;
          }
          .artigo-card-inner {
            height: 250px!important;
          }
          .anuncio-details {
            font-size: 10px;
          }
          .div-buttons {
            width: max-content;
          }
          .eye-button {
            background: none;
          }
        `}
      </style>
    </>
  );
}

export default DestaquesSwiper;