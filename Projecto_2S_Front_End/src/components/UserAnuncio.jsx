import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ItemModal from "../components/ModalAnuncio";
import api from "../services/api";

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
    api
      .get("/categorias")
      .then((res) => setCategorias(res.data))
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
      preco: useranuncio.preco.replace(" €", ""), // remove símbolo, se necessário
      discricao: useranuncio.discricao || "",
      categoria_id: useranuncio.categoria,
      estado: useranuncio.estado,
      destaque: useranuncio.destaque,
      vendido: useranuncio.vendido || null,
      mostrar_contact: useranuncio.mostrar_contact || false,
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
    api
      .put("/anuncios/editar", fd, {
        withCredentials: true,
      })
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
                Categoria: {useranuncio.categoria}
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
  .card {
    position: relative;
    width: 250px;
    height: 350px;
    aspect-ratio: 16/9;
    background-color: #f2f2f2;
    overflow: hidden;
    perspective: 1000px;
    box-shadow: 0 0 0 5px #ffffff80;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    opacity: ${(props) => (props.estado === "ativo" ? 1 : 0.5)};
  }
  .estado-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 10px;
    height: 10px;
    background-color: ${(props) =>
      props.estado === "ativo"
        ? "#00FF00"
        : props.estado === "pendente"
        ? "#FFA500"
        : props.estado === "terminado"
        ? "#00BFFF"
        : props.estado === "excluido"
        ? "#FF0000"
        : "transparent"};
    z-index: 2;
    transition: opacity 0.25s ease;
  }

  .card:hover .estado-badge {
    opacity: 0;
    pointer-events: none;
  }

  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(255, 255, 255, 0.2);
    opacity: 1;
  }

  .card__content {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px;
    box-sizing: border-box;
    backdrop-filter: blur(8px) !important;
    background-color: rgba(1, 1, 1, 0.65);
    transform: rotateX(-90deg);
    transform-origin: bottom;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 2px solid
      ${(props) =>
        props.estado === "ativo"
          ? "#00FF00"
          : props.estado === "pendente"
          ? "#FFA500"
          : props.estado === "terminado"
          ? "#00BFFF"
          : props.estado === "excluido"
          ? "#FF0000"
          : "transparent"};
  }

  .card:hover .card__content {
    transform: rotateX(0deg);
  }

  .card__title {
    font-size: 20px;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card__preco,
  .card__views,
  .card__categoria,
  .card__data_hora,
  .card__estado {
    font-size: 13.5px;
    color: #ffffff;
  }
`;

export default User_Anuncios;