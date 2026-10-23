import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip as BootstrapTooltip } from "bootstrap";
import api from "../services/api";

/**
 * @typedef {Object} AnuncioProps
 * @property {string} id
 * @property {string|null} imagem
 * @property {string} titulo
 * @property {string} preco
 * @property {string} visualizacao
 * @property {string} data_hora
 * @property {string} categoria
 * @property {number} nome_user
 *
 * @param {{
 *   anuncios: AnuncioProps[],
 *   onUnfavorite?: (id: number) => void
 * }} props
 */
function AnuncioModel({ anuncios = [], onUnfavorite }) {
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [favoritos, setFavoritos] = useState({});
  const [favoritosCarregados, setFavoritosCarregados] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [utilizadores, setUtilizadores] = useState({});

  // Verifica se o usuário está logado e lê o ID do localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("utilizador_id");
    if (storedId) {
      setUserLoggedIn(true);
      setUserId(parseInt(storedId, 10));
    } else {
      setUserLoggedIn(false);
    }
  }, []);

  // Carrega a lista de favoritos do usuário (só se estiver logado)
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
      // não está logado → consideramos carregado sem favoritos
      setFavoritos({});
      setFavoritosCarregados(true);
    }
  }, [userLoggedIn, userId]);

  // Busca o nome “real” de cada usuário (vai só ids em anuncio.nome_user)
  useEffect(() => {
    const ids = [...new Set(anuncios.map((a) => a.nome_user))];
    if (ids.length === 0) return;

    Promise.all(
      ids.map((id) =>
        api
          .get(`/utilizador/nome/${id}`, { withCredentials: true })
          .then((res) => ({ id, nome: res.data?.nome || res.data }))
          .catch(() => ({ id, nome: "Desconhecido" }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ id, nome }) => {
        map[id] = nome;
      });
      setUtilizadores(map);
    });
  }, [anuncios]);

  // Função para tratar clique no coração (toggle favorito)
  const handleLikeToggle = (e, anuncioId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userLoggedIn || !userId) {
        navigate('/login');
        return;
    }

    const jaFavoritado = !!favoritos[anuncioId];
    if (jaFavoritado) {
      // Se já era favorito, remove
      api
        .delete(`/favoritos`, {
          data: { anuncio_id: anuncioId, utilizador_id: userId },
          withCredentials: true,
        })
        .then(() => {
          setFavoritos((prev) => ({ ...prev, [anuncioId]: false }));
          // notifica o pai (FavoritosUser) para remover da lista
          if (typeof onUnfavorite === "function") {
            onUnfavorite(anuncioId);
          }
        })
        .catch((err) => console.error("Erro ao remover favorito", err));
    } else {
      // Caso contrário, adiciona
      api
        .post(
          `/favoritos`,
          { anuncio_id: anuncioId, utilizador_id: userId },
          { withCredentials: true }
        )
        .then(() => {
          setFavoritos((prev) => ({ ...prev, [anuncioId]: true }));
        })
        .catch((err) => {
          console.error("Erro ao adicionar favorito", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("utilizador_id");
            setUserLoggedIn(false);
            setUserId(null);
            navigate('/login');
          } else if (err.response?.status === 409) {
            setFavoritos((prev) => ({ ...prev, [anuncioId]: true }));
          } else if (err.response?.status === 403) {
            setErrorMessage("Ação não permitida. Verifique sua sessão.");
            setTimeout(() => setErrorMessage(""), 3000);
          }
        });
    }
  };

  // Reinicializa tooltips do Bootstrap
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
  }, [anuncios, favoritos]);

  // Enquanto não terminar de carregar os favoritos do usuário, não exibe nada
  if (!favoritosCarregados) return null;

  return (
    <>
      {errorMessage && (
        <div className="alert alert-warning text-center py-1">{errorMessage}</div>
      )}

      {anuncios.map((anuncio) => {
        const {
          id,
          imagem,
          titulo,
          preco,
          visualizacao,
          data_hora,
          nome_user,
        } = anuncio;

        // Monta a URL da imagem (ou placeholder)
        // — Se “imagem” já começa com http (ou “/uploads”), usa direto
        // — Caso contrário (por ex. “1748739102719_tr.jpg”), prefixa “http://localhost:5000/uploads/”
        let urlImagem;
        if (
          imagem?.startsWith("http://") ||
          imagem?.startsWith("https://") ||
          imagem?.startsWith("/uploads")
        ) {
          urlImagem = imagem;
        } else if (imagem) {
          urlImagem = `http://localhost:5000/uploads/${imagem}`;
        } else {
          urlImagem = "/placeholder.png";
        }
        // Nome real do usuário que postou o anúncio
        const nomeReal = utilizadores[nome_user] || "Desconhecido";

        return (
          <div className="anuncio-card" key={id}>
            {/* Clicar em qualquer parte do card, exceto no coração, leva à página de detalhe */}
            <div
              className="artigo-link"
              onClick={() => {
                navigate(`/Anuncio/${id}`);
              }}
            >
              <div className="anuncio-card-inner">
                <div className="anuncio-card-front">
                  <img
                    className="object-fit-cover"
                    src={urlImagem}
                    alt={titulo}
                  />
                </div>
                <div className="anuncio-card-back">
                  <p>{titulo}</p>
                </div>
              </div>
            </div>

            <div className="artigo-card-footer d-flex justify-content-between ms-1 align-items-center">
              <p className="anuncio-preco m-0 fw-bold">{preco}</p>
              <div className="div-buttons d-flex gap-2">
                <button
                  type="button"
                  className="eye-button border-0 bg-transparent"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title={`${visualizacao} Views`}
                >
                  <i className="bi bi-eye-fill"></i>
                </button>
                <button
                  type="button"
                  className="heart-icon border-0 bg-transparent p-0"
                  aria-label={favoritos[id] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  aria-pressed={Boolean(favoritos[id])}
                  title={favoritos[id] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
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
                </button>
              </div>
            </div>

            <div className="div-anuncio-details d-flex justify-content-start ms-1">
              <p className="d-flex anuncio-details text-start mt-2">
                {nomeReal}
                <br />
                {data_hora}
              </p>
            </div>
          </div>
        );
      })}

      <style>
        {`
          .custom-tooltip {
            --bs-tooltip-bg: var(--bd-violet-bg);
            --bs-tooltip-color: var(--bs-white);
          }
          .anuncio-card-front, .anuncio-card-back {
            height: 100%! important;
            padding: 2px !important;
          }
          .anuncio-card-inner {
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

export default AnuncioModel;
