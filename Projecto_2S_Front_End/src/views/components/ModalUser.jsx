// src/components/ModalUser.jsx
import React, { useState, useEffect } from "react";
import { updateUser } from "../../controllers/userController";

/**
 * Props:
 *  - show: boolean
 *  - handleClose: () => void
 *  - initialData: {
 *      id: number,
 *      nome: string,
 *      email: string,
 *      telemovel: string,
 *      localizacao: number, // ID do distrito
 *      imagem: string|null  // nome do arquivo atual (opcional)
 *    }
 *  - locations: array de { localizacao_id, distrito }
 *  - onUpdated: () => void  // callback para recarregar userInfo em Profile.jsx
 */
const ModalUser = ({ show, handleClose, initialData, locations, onUpdated }) => {
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    email: "",
    telemovel: "",
    localizacao: "",
    imagem: null,
  });

  // 1) Preenche o form ao receber initialData
  useEffect(() => {
    if (!initialData) return;
    setFormData({
      id: initialData.id,
      nome: initialData.nome || "",
      email: initialData.email || "",
      telemovel: initialData.telemovel || "",
      localizacao: initialData.localizacao || "",
      imagem: null,
    });
  }, [initialData]);

  // 2) Bloqueia o scroll quando modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagem") {
      setFormData((prev) => ({ ...prev, imagem: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Monta FormData para multipart/form-data
    const payload = new FormData();
    payload.append("id", formData.id);
    payload.append("nome", formData.nome);
    payload.append("email", formData.email);
    payload.append("telemovel", formData.telemovel);
    // envia “distrito” como ID numérico
    payload.append("distrito", formData.localizacao);
    if (formData.imagem) {
      payload.append("imagem", formData.imagem);
    }

    updateUser(payload)
      .then(() => {
        // Após PUT, dispara callback que vai fazer GET /utilizador/:id de novo
        onUpdated();
        handleClose();
      })
      .catch((err) => {
        console.error("Erro ao atualizar usuário:", err);
      });
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="modal-header">
              <h5 className="modal-title">Editar Perfil</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>

            <div className="modal-body">
              {/* NOME */}
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-control"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* TELEFONE */}
              <div className="mb-3">
                <label className="form-label">Telemóvel</label>
                <input
                  type="text"
                  className="form-control"
                  name="telemovel"
                  value={formData.telemovel}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* LOCALIZAÇÃO (DISTRITO) */}
              <div className="mb-3">
                <label className="form-label">Distrito</label>
                <select
                  className="form-select"
                  name="localizacao"
                  value={formData.localizacao}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecionar distrito...</option>
                  {locations.map((loc) => (
                    <option
                      key={loc.localizacao_id}
                      value={loc.localizacao_id}
                    >
                      {loc.distrito}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGEM */}
              <div className="mb-3">
                <label className="form-label">Imagem de Perfil</label>
                <input
                  type="file"
                  className="form-control"
                  name="imagem"
                  accept="image/*"
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Se não carregar nenhuma, a imagem atual será mantida.
                </small>
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalUser;
