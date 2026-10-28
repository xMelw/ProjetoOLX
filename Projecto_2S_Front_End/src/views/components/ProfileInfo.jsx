// src/components/ProfileInfo.jsx
import React from "react";
import Rating from "../parts/Rating";

/**
 * @typedef {Object} profileInfoProps
 * @property {number} id
 * @property {string} imagem
 * @property {string} nome
 * @property {string} email
 * @property {string} telemovel
 * @property {string} localizacao   // nome do distrito
 * @property {number} rating
 * @property {() => void} onEdit     // callback para abrir modal
 */

function ProfileInfo({ user, onEdit }) {
  return (
    <>
      <div className="userImage">
        <img
          className="rounded-circle"
          src={user.imagem}
          alt={user.nome}
          style={{ width: 220, height: 220, objectFit: "cover" }}
        />
      </div>

      <div className="text-center mt-3">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <p className="fs-4 m-0">{user.nome}</p>
        </div>
        <div className="d-flex align-items-center justify-content-center mb-3 mt-2">
          <Rating size={24} rating={user.rating} />
          <p className="ms-2 mb-0">({user.rating.toFixed(1)})</p>
        </div>
        <p className="fs-6 m-0 cor_text">{user.email}</p>
        <p className="fs-6 m-0 cor_text">{user.telemovel}</p>
        <p className="fs-6 m-0 cor_text">{user.localizacao}</p>
      </div>
      
        <button
          onClick={onEdit}
          className="btn btn-sm btn-outline-secondary mt-3"
          style={{ padding: "0.25rem 0.5rem" }}
        >
          <i className="bi bi-gear-fill me-1"></i>Editar perfil
        </button>

      
      <hr />

      <style>
        {`
          .userImage {
            width: 220px;
            height: 220px;
          }
          .cor_text{
            color: #a0a0a0;
          }
        `}
      </style>
    </>
  );
}

export default ProfileInfo;
