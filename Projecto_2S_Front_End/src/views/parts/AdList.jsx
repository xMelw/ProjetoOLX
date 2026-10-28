import { useEffect } from "react";
import { Tooltip as BootstrapTooltip } from "bootstrap";
import useListingController from "../../controllers/useListingController";
import { imageUrl } from "../../controllers/formatters";

function AdList({ anuncios = [], onUnfavorite }) {
  const { favorites: favoritos, users: utilizadores, errorMessage, toggleFavorite: handleLikeToggle, navigate } = useListingController(anuncios, onUnfavorite);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll("[data-bs-toggle='tooltip']").forEach((element) => {
        const existing = BootstrapTooltip.getInstance(element);
        if (existing) existing.dispose();
        new BootstrapTooltip(element);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [anuncios, favoritos]);

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

        // URL da imagem (ou placeholder), tratado de forma única em controllers/formatters
        const urlImagem = imageUrl(imagem);
        // Nome real do usuário que postou o anúncio
        const nomeReal = utilizadores[nome_user] || "Desconhecido";

        return (
          <div className="anuncio-card" key={id}>
            {/* Clicar em qualquer parte do card, exceto no coração, leva à página de detalhe */}
            <div
              className="artigo-link"
              onClick={() => {
                navigate(`/anuncio/${id}`);
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

export default AdList;
