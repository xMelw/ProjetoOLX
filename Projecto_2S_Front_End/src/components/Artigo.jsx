import { useEffect, useState } from "react";
import { Tooltip as BootstrapTooltip } from "bootstrap";
import api from "../services/api";

/**
 * @typedef {Object} ArtigoProps
 * @property {string} id          // ID do anúncio
 * @property {string} imagem
 * @property {string} titulo
 * @property {string} preco
 * @property {string} views       // número de visualizações (apenas para exibir no tooltip)
 * @property {string} data_hora
 * @property {string} categoria
 * @property {string} nome_user
 * @property {string} descricao
 * @property {string|null} contacto
 * @property {boolean} destaque   // indica se o anúncio está destacado
 */

function Artigo(props) {
  const {
    id,
    imagem,
    titulo,
    preco,
    views,
    data_hora,
    categoria,
    nome_user,
    descricao,
    contacto,
    destaque = false,
  } = props;

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isFavorito, setIsFavorito] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verifica se o utilizador está logado (procura ID no localStorage)
  useEffect(() => {
    const storedId = localStorage.getItem("utilizador_id");
    if (storedId) {
      setUserLoggedIn(true);
      setUserId(parseInt(storedId, 10));
    } else {
      setUserLoggedIn(false);
      setUserId(null);
    }
  }, []);

  // Ao montar, dispara as duas publicações:
  //    a) incrementar visualização (/anuncios/visualizar/{id})
  //    b) registar em recentes (somente se utilizador estiver logado)
  useEffect(() => {
    // incrementar visualização
    api.post(`/anuncios/visualizar/${id}`)
      .catch(err => {
        console.error("Erro ao incrementar visualização:", err);
      });

    // se estiver logado, envia a visão a /recentes
    if (userLoggedIn && userId !== null) {
      api.post(
        `/recentes`,
        { anuncio_id: parseInt(id) },
        { withCredentials: true }
      ).catch(err => {
        console.error("Erro ao registar em recentes:", err);
      });
    }
  }, [id, userLoggedIn, userId]);

  // Se o utilizador estiver logado e tiver ID, verifica se já está favorit
  useEffect(() => {
    if (userLoggedIn && userId !== null) {
      api
        .get(`/favoritos/${userId}`, { withCredentials: true })
        .then((res) => {
          const jaFavorito = res.data.some(
            (fav) => fav.anuncio_id === parseInt(id, 10)
          );
          setIsFavorito(jaFavorito);
        })
        .catch((err) => {
          console.error("Não foi possível verificar favorito:", err);
        });
    }
  }, [userLoggedIn, userId, id]);

  // Inicializa tooltips (views e estrela)
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      "[data-bs-toggle=\"tooltip\"]"
    );
    tooltipTriggerList.forEach((el) => {
      const existing = BootstrapTooltip.getInstance(el);
      if (existing) existing.dispose();
      new BootstrapTooltip(el);
    });
  }, []);

  // Alterna favorito/remoção
  const handleLikeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userLoggedIn || userId === null) {
      setErrorMessage("Apenas utilizadores logados podem adicionar aos favoritos.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (isFavorito) {
      // já era favorito → remove
      api
        .delete(
          `/favoritos`,
          {
            data: { anuncio_id: parseInt(id, 10), utilizador_id: userId },
          },
          { withCredentials: true }
        )
        .then(() => setIsFavorito(false))
        .catch((err) => {
          console.error("Erro ao remover favorito:", err);
          if (err.response?.status === 403) {
            setErrorMessage("Ação não permitida. Verifique sua sessão.");
            setTimeout(() => setErrorMessage(""), 3000);
          }
        });
    } else {
      // não era favorito → adiciona
      api
        .post(
          `/favoritos`,
          { anuncio_id: parseInt(id, 10), utilizador_id: userId },
          { withCredentials: true }
        )
        .then(() => setIsFavorito(true))
        .catch((err) => {
          console.error("Erro ao adicionar favorito:", err);
          if (err.response?.status === 409) {
            // já existia no backend, marca como favorito localmente
            setIsFavorito(true);
          } else if (err.response?.status === 403) {
            setErrorMessage("Ação não permitida. Verifique sua sessão.");
            setTimeout(() => setErrorMessage(""), 3000);
          }
        });
    }
  };

  return (
    <>
      {/* Alerta de erro */}
      {errorMessage && (
        <div className="alert alert-warning text-center py-1">
          {errorMessage}
        </div>
      )}

      <div className="artigo d-flex flex-column align-items-center justify-content-center">
        <div className="content-artigo d-flex flex-wrap">
          <div className="d-flex w-100 h-100 justify-content-between align-items-start gap-5">
            {/* Imagem */}
            <div className="artigo-imagem w-50">
                <img
                    className="object-fit-cover"
                    src={imagem ? `http://localhost:5000/uploads/${imagem}` : "/placeholder.png"}
                    alt={titulo}
                />
            </div>

            {/* Detalhes */}
            <div className="artigo-details w-50 d-flex flex-column justify-content-between">
              <div className="p-3 bg-white rounded">
                <h1 className="mb-5">{titulo}</h1>
                <div className="d-flex justify-content-between">
                  <a className="text-decoration-none" href="#">
                    <p>{nome_user}</p>
                  </a>
                  <p>Contacto: {contacto}</p>
                </div>
                <p className="fw-bolder fs-5">{preco}</p>
                <hr />
                <p>{data_hora}</p>
                <p>{categoria}</p>
              </div>

              {/* Botões */}
              <div className="artigo-buttons p-3 rounded">
                <div className="div-buttons d-flex align-items-center gap-3">
                  {/* Comprar (sem lógica adicional aqui) */}
                  <button type="button" className="btn bg-light">
                    Contactar
                  </button>

                  {/* Coração - alterna favorito/remoção */}
                  <span
                    className="heart-icon"
                    onClick={handleLikeToggle}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        isFavorito ? "bi-heart-fill text-danger" : "bi-heart text-white"
                      }`}
                    ></i>
                  </span>

                  {/* Tooltip de visualizações */}
                  <button
                    type="button"
                    className="eye-button border-0 bg-transparent"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    title={`${views} Views`}
                  >
                    <i className="bi bi-eye-fill"></i>
                  </button>
                  

                  {/* Estrela só se 'destaque' for true */}
                  {destaque && (
                    <button
                      type="button"
                      className="destacar-button border-0 bg-transparent text-danger"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Produto destacado"
                    >
                      <i className="bi bi-star-fill text-orange"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="d-flex flex-column w-100">
            <hr />
            <div className="artigo-descricao">
              <p>
                <b>Descrição:</b>
              </p>
              <p>{descricao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos internos */}
      <style>
        {`
          .artigo-imagem, .artigo-details {
            width: 450px;
            height: 450px;
          }

          .artigo-buttons {
            background-color: #02282c;
          }

          .eye-button {
            background: none;
          }

          .heart-icon i {
            font-size: 1.4rem;
          }

          .alert-warning {
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
          }
        `}
      </style>
    </>
  );
}

export default Artigo;