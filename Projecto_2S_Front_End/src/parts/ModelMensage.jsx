import React from "react";
import styled from "styled-components";

/**
 * @typedef {Object} Props
 * @property {string} de          // 'a' ou 's'
 * @property {string} user        // nome do remetente
 * @property {string} data_hora   // timestamp ISO ou string
 * @property {string} mensagem    // texto da mensagem
 * @property {string} modo        // 'anunciante' ou 'solicitante'
 */

const Mensage = ({ de, user, data_hora, mensagem, modo }) => {
  // Determina se é a própria mensagem (alinha à direita) ou do outro (alinha à esquerda)
  const isOwn =
    (modo === "anunciante" && de === "a") ||
    (modo === "solicitante" && de === "s");

  // Formata data e hora para DD/MM/YYYY HH:MM
  const dt = new Date(data_hora);
  const dataFormatada = dt.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaFormatada = dt.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Wrapper $isOwn={isOwn}>
      <div className="msg-header">
        <strong>{user}</strong> • {dataFormatada} {horaFormatada}
      </div>
      <div className="msg-body">{mensagem}</div>
    </Wrapper>
  );
};

// Usamos $isOwn para que essa prop não seja passada para o DOM
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  max-width: 60%;
  margin-bottom: 12px;

  .msg-header {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 4px;
  }

  .msg-body {
    padding: 10px;
    border-radius: 8px;
    background-color: ${({ $isOwn }) => ($isOwn ? "#D1E7DD" : "#F8D7DA")};
    color: #000;
    word-wrap: break-word;
  }
`;

export default Mensage;