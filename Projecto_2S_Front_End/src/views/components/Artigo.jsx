import useArticleController from "../../controllers/useArticleController";
import { imageUrl } from "../../controllers/formatters";

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
    email,
    destaque = false,
  } = props;

  const { isFavorite: isFavorito, errorMessage, toggleFavorite: handleLikeToggle } = useArticleController(id);

  const contactHref = email
    ? `mailto:${email}`
    : contacto
    ? `tel:${String(contacto).replace(/[^0-9+]/g, "")}`
    : null;

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
                    src={imageUrl(imagem)}
                    alt={titulo}
                />
            </div>

            {/* Detalhes */}
            <div className="artigo-details w-50 d-flex flex-column justify-content-between">
              <div className="p-3 bg-white rounded">
                <h1 className="mb-5">{titulo}</h1>
                <div className="d-flex justify-content-between">
                  <p className="mb-0">{nome_user}</p>
                  <p className="mb-0">{contacto || email ? `Contacto: ${contacto || email}` : "Contacto não partilhado"}</p>
                </div>
                <p className="fw-bolder fs-5">{preco}</p>
                <hr />
                <p>{data_hora}</p>
                <p>{categoria}</p>
              </div>

              {/* Botões */}
              <div className="artigo-buttons p-3 rounded">
                <div className="div-buttons d-flex align-items-center gap-3">
                  {contactHref ? (
                    <a className="btn bg-light" href={contactHref}>Contactar vendedor</a>
                  ) : (
                    <button type="button" className="btn bg-light" disabled title="O vendedor não partilhou os contactos.">Contacto indisponível</button>
                  )}

                  {/* Coração - alterna favorito/remoção */}
                  <button
                    type="button"
                    className="heart-icon border-0 bg-transparent p-0"
                    aria-label={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    aria-pressed={isFavorito}
                    onClick={handleLikeToggle}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        isFavorito ? "bi-heart-fill text-danger" : "bi-heart text-white"
                      }`}
                    ></i>
                  </button>

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
                      className="destacar-button border-0 bg-transparent"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Produto destacado"
                    >
                      <i className="bi bi-star-fill text-warning"></i>
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