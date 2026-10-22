// src/components/ModalAnuncio.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Props:
 *  - show: boolean
 *  - handleClose: função para fechar o modal
 *  - handleSubmit: função que recebe o objeto com os campos para enviar ao backend
 *  - initialData: objeto com dados atuais do anúncio (ou null, se for “criar novo”)
 *  - categorias: array de { categoria_id, nome }
 */
const ItemModal = ({
  show,
  handleClose,
  handleSubmit,
  initialData,
  categorias = [],
}) => {
  const [formData, setFormData] = useState({
    anuncio_id: "",
    titulo: "",
    preco: "",
    discricao: "",
    categoria_id: "",
    // se vier criação (initialData undefined/null), default = "pendente"
    estado: initialData ? initialData.estado || "ativo" : "pendente",
    destaque: false,
    mostrar_contact: false,
    vendido: null,
    imagem: null,
  });

  // Estado local para guardarmos os solicitantes (quem mandou mensagem para este anúncio)
  const [solicitantes, setSolicitantes] = useState([]);

  // Quando initialData muda (modo edição), preenche o formulário
  useEffect(() => {
    if (initialData) {
      setFormData({
        anuncio_id: initialData.anuncio_id || "",
        titulo: initialData.titulo || "",
        preco: initialData.preco.replace(" €", "") || "",
        discricao: initialData.discricao || "",
        categoria_id: initialData.categoria_id || "",
        estado: initialData.estado || "ativo",
        destaque: initialData.destaque || false,
        mostrar_contact: initialData.mostrar_contact || false,
        vendido: initialData.vendido || null,
        imagem: null,
      });
    } else {
      // Se inicializar sem initialData, garantir que estado seja "pendente"
      setFormData((prev) => ({
        ...prev,
        anuncio_id: "",
        estado: "pendente",
      }));
    }
  }, [initialData]);

  // Bloqueia scroll da página quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  // Busca lista de solicitantes (para campo “Vendido para”) apenas em edição e estado = "terminado"
  useEffect(() => {
    if (!show) {
      setSolicitantes([]);
      return;
    }
    if (formData.estado === "terminado" && formData.anuncio_id) {
      api
        .get("/mensagens/anunciante", { withCredentials: true })
        .then((res) => {
          const todos = res.data;
          const filtradas = todos.filter(
            (m) => m.anuncio_id === formData.anuncio_id
          );
          const map = {};
          filtradas.forEach((m) => {
            const userId = m.utilizador_id || (m.utilizador && m.utilizador.user_id);
            const userNome = (m.utilizador && m.utilizador.nome) || "Desconhecido";
            if (userId != null) map[userId] = userNome;
          });
          const lista = Object.entries(map).map(([id, nome]) => ({
            id: parseInt(id, 10),
            nome,
          }));
          setSolicitantes(lista);
        })
        .catch((err) => {
          console.error("Erro ao buscar mensagens/anunciante:", err);
          setSolicitantes([]);
        });
    } else {
      setSolicitantes([]);
    }
  }, [show, formData.estado, formData.anuncio_id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
    handleClose();
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {formData.anuncio_id ? "Editar Anúncio" : "Criar Anúncio"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                ></button>
              </div>

              <div className="modal-body">
                {/* TÍTULO */}
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* PREÇO */}
                <div className="mb-3">
                  <label className="form-label">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* CATEGORIA */}
                <div className="mb-3">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecionar categoria...</option>
                    {categorias.map((c) => (
                      <option key={c.categoria_id} value={c.categoria_id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DISCRIÇÃO */}
                <div className="mb-3">
                  <label className="form-label">Discrição</label>
                  <textarea
                    className="form-control"
                    name="discricao"
                    rows="3"
                    value={formData.discricao}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* ESTADO – mostrar somente em edição */}
                {formData.anuncio_id && (
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="ativo">Ativo</option>
                      <option value="pendente">Pendente</option>
                      <option value="terminado">Terminado</option>
                      <option value="excluido">Excluído</option>
                    </select>
                  </div>
                )}

                {/* VENDIDO PARA (só se estado === "terminado" em edição) */}
                {formData.anuncio_id && formData.estado === "terminado" && (
                  <div className="mb-3">
                    <label className="form-label">
                      Vendido para (Solicitante)
                    </label>
                    <select
                      className="form-select"
                      name="vendido"
                      value={formData.vendido || ""}
                      onChange={handleChange}
                    >
                      <option value="">Nenhum (null)</option>
                      {solicitantes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      * Se não selecionar ninguém, será salvo como null.
                    </small>
                  </div>
                )}

                {/* DESTAQUE */}
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="destaque"
                    checked={formData.destaque}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Destacar</label>
                </div>

                {/* MOSTRAR CONTATO */}
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="mostrar_contact"
                    checked={formData.mostrar_contact}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Exibir contato do anunciante
                  </label>
                </div>

                {/* INPUT DE IMAGEM */}
                <div className="mb-3">
                  <label className="form-label">Imagem</label>
                  <input
                    type="file"
                    className="form-control"
                    name="imagem"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn shadow-sm"
                  style={{ backgroundColor: "#F5F5F5", color: "#3A3A3A" }}
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn shadow-sm"
                  style={{ backgroundColor: "#23E7B6", color: "#F5F5F5" }}
                >
                  {formData.anuncio_id ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemModal;