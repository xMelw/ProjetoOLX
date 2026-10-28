import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ItemModal from "../components/ModalAnuncio";
import { getCategories } from "../../controllers/adController";
import { updateAd } from "../../controllers/adController";

/**
 * @typedef {Object} UserAnuncioProps
 * @property {number} id          // ID do anúncio (anuncio_id)
 * @property {string} titulo
 * @property {string} preco
 * @property {string} discricao
 * @property {string|null} imagem // URL da imagem completa (prefixada pelo frontend)
 * @property {number} views
 * @property {number} categoria   // ID da categoria
 * @property {string} data_hora   // data já formatada em toLocaleDateString()
 * @property {string} estado      // "ativo" | "pendente" | "terminado" | "excluido"
 * @property {boolean} destaque
 * @property {number|null} vendido
 */

const User_Anuncios = ({ useranuncio }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // Carrega a lista de categorias para popular o <select>
  useEffect(() => {
    getCategories()
      .then((data) => setCategorias(data))
      .catch((err) => {
        console.error("Erro ao carregar categorias:", err);
        setCategorias([]);
      });
  }, []);

  const handleEditClick = (e) => {
    // Impede que o clique no botão dispare o Link de navegação
    e.preventDefault();
    e.stopPropagation();

    // Passa ao modal todos os dados atuais do anúncio
    setSelectedAnuncio({
      anuncio_id: useranuncio.id,
      titulo: useranuncio.titulo,
      preco: String(useranuncio.precoValor ?? ""), // valor numérico, sem símbolo nem formatação
      discricao: useranuncio.discricao || "",
      categoria_id: useranuncio.categoria,
      estado: useranuncio.estado,
      destaque: useranuncio.destaque,
      vendido: useranuncio.vendido || null,
      mostrar_contact: Boolean(useranuncio.mostrar_contact),
      imagem: null, // só preenche quando o usuário escolher um arquivo novo
    });
    setShowModal(true);
  };

  const handleFormSubmit = (formData) => {
    const fd = new FormData();
    fd.append("anuncio_id", formData.anuncio_id);
    fd.append("titulo", formData.titulo);
    fd.append("discricao", formData.discricao);
    fd.append("preco", formData.preco);
    fd.append("mostrar_contact", formData.mostrar_contact ? "true" : "false");
    fd.append("destaque", formData.destaque ? "true" : "false");
    fd.append("categoria_id", formData.categoria_id);
    fd.append("vendido", formData.vendido || "");
    fd.append("estado", formData.estado);

    // Esta chave "imagem" deve bater com upload.single("imagem")
    if (formData.imagem) {
      fd.append("imagem", formData.imagem);
    }

    // ATENÇÃO: rota PLURAL "/anuncios/editar"
    updateAd(fd)
      .then(() => {
        setShowModal(false);
        // Recarrega para mostrar a atualização (nova foto, etc)
        window.location.reload();
      })
      .catch((err) => {
        console.error("Erro ao atualizar anúncio:", err);
      });
  };

  // Conteúdo do card (sem Link)
  const CardContent = (
    <StyledWrapper estado={useranuncio.estado}>
      <div className="card d-flex rounded-3 justify-content-center align-items-center shadow-sm">
        <div className="estado-badge rounded-circle" />
        <img
          className="card__image object-fit-cover w-100 h-100"
          src={useranuncio.imagem}
          alt={useranuncio.titulo}
        />
        <div className="card__content w-100 h-100 rounded-3">
          <div className="d-flex flex-column h-100 justify-content-between">
            <div className="d-flex flex-column gap-1">
              <p className="card__title mb-2">
                <b>Título:</b> {useranuncio.titulo}
              </p>
              <p className="card__preco m-0">Preço: {useranuncio.preco}</p>
              <hr />
              <p className="card__views m-0">Views: {useranuncio.views}</p>
              <hr />
              <p className="card__categoria m-0">
                Categoria: {useranuncio.categoriaNome || useranuncio.categoria}
              </p>
              <hr />
              <p className="card__data_hora m-0">
                Publicado: {useranuncio.data_hora}
              </p>
              <hr />
            </div>
            <div className="d-flex flex-row align-items-center justify-content-between gap-3">
              <div className="w-auto h-auto">
                <p className="card__estado fs-6 m-0">
                  Estado: {useranuncio.estado}
                </p>
              </div>
              <button
                className="button-edit bg-transparent border-0 d-flex shadow-sm rounded-circle"
                onClick={handleEditClick}
              >
                <i
                  className="bi bi-pencil m-0 p-0"
                  style={{ color: "#aaaaaa" }}
                ></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );

  return (
    <>
      {useranuncio.estado === "ativo" ? (
        <Link
          to={`/anuncio/${useranuncio.id}`}
          className="text-decoration-none"
        >
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}

      {/* Modal de criar/editar anúncio */}
      <ItemModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleFormSubmit}
        initialData={selectedAnuncio}
        categorias={categorias}
      />
    </>
  );
};

const StyledWrapper = styled.div`
  .card { position: relative; width: 250px; height: 350px; aspect-ratio: 16/9; background: #f4f7f6; overflow: hidden; perspective: 1000px; border: 1px solid rgba(20, 52, 48, 0.08); box-shadow: 0 8px 22px rgba(20, 52, 48, 0.12); transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease; opacity: ${(props) => (props.estado === "ativo" ? 1 : 0.68)}; }
  .estado-badge { position: absolute; top: 14px; right: 14px; width: 12px; height: 12px; border-radius: 50%; background-color: ${(props) => props.estado === "ativo" ? "#1DD3B0" : props.estado === "pendente" ? "#FFB547" : props.estado === "terminado" ? "#6C8CF5" : props.estado === "excluido" ? "#E76F6F" : "#A9B3B1"}; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.82); z-index: 2; transition: opacity 0.2s ease; }
  .card:hover { transform: translateY(-4px) scale(1.025); box-shadow: 0 16px 32px rgba(20, 52, 48, 0.2); opacity: 1; }
  .card__content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; box-sizing: border-box; color: #243a37; background: linear-gradient(145deg, rgba(250, 253, 252, 0.97), rgba(238, 247, 244, 0.96)); backdrop-filter: blur(10px); border: 1px solid rgba(29, 211, 176, 0.3); opacity: 0; transform: translateY(12px); transition: opacity 0.28s ease, transform 0.32s ease; }
  .card:hover .card__content, .card:focus-within .card__content { opacity: 1; transform: translateY(0); }
  .card:hover .estado-badge { opacity: 0; }
  .card__title { font-size: 20px; color: #203a36; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card__preco { color: #0b9f83; font-size: 17px; font-weight: 700; }
  .card__views, .card__categoria, .card__data_hora { color: #52635f; font-size: 13px; }
  .card__content hr { margin: 6px 0; border-color: rgba(36, 58, 55, 0.12); opacity: 1; }
  .card__estado { padding: 5px 10px; border-radius: 999px; color: ${(props) => props.estado === "ativo" ? "#087e68" : props.estado === "pendente" ? "#98610b" : props.estado === "excluido" ? "#a43d3d" : "#4f639f"}; background: ${(props) => props.estado === "ativo" ? "#d8f7ef" : props.estado === "pendente" ? "#fff0d6" : props.estado === "excluido" ? "#fde3e3" : "#e5eafe"}; font-size: 12px; font-weight: 700; text-transform: capitalize; }
  .button-edit { width: 38px; height: 38px; align-items: center; justify-content: center; color: #fff; background: #ff6b1a !important; border: 0; box-shadow: 0 5px 12px rgba(255, 107, 26, 0.24) !important; transition: background 0.2s ease, transform 0.2s ease; cursor: pointer; }
  .button-edit:hover { background: #e95a0b !important; transform: translateY(-2px); }
  .button-edit i { color: inherit !important; }
  @media (prefers-reduced-motion: reduce) { .card, .card__content, .button-edit { transition: none; } }
`
export default User_Anuncios;