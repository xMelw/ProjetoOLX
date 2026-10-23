// src/Pages/Chat.jsx

import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import BotaoToTOP from "../components/ScrollToTop";
import Mensage from "../parts/ModelMensage";
import styled from "styled-components";
import api from "../services/api";

/**
 * Retorna URL completa da imagem ou placeholder padrão.
 * O arquivo placeholder.png deve estar na pasta `public/placeholder.png`.
 */
function formatarUrlImagem(imagem) {
  if (
    imagem?.startsWith("http://") ||
    imagem?.startsWith("https://") ||
    imagem?.startsWith("/uploads")
  ) {
    return imagem;
  } else if (imagem) {
    return `http://localhost:5000/uploads/${imagem}`;
  } else {
    return "http://localhost:5000/uploads/placeholder.png";
  }
}

const Chat = () => {
  const [tipoUsuario, setTipoUsuario] = useState("anunciante");
  const [anunciosVendendo, setAnunciosVendendo] = useState([]);
  const [anunciosComprando, setAnunciosComprando] = useState([]);
  const [anuncioSelecionado, setAnuncioSelecionado] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [novaMensagem, setNovaMensagem] = useState("");

  // Ref para o contêiner de mensagens, para rolar ao fim
  const messagesEndRef = useRef(null);

  //  Funções para carregar listas (Anunciar/Comprar)
  const loadAnunciosVendendo = async () => {
    try {
      const res = await api.get("/mensagens/anunciante", { withCredentials: true });
      const listaRaw = res.data;

      // Buscar nome do solicitante em /utilizador/nome/{id}
      const lista = await Promise.all(
        listaRaw.map(async (item) => {
          let nomeDoSolicitante = "";
          try {
            const userRes = await api.get(`/utilizador/nome/${item.id_solicitante}`, { withCredentials: true });
            nomeDoSolicitante = userRes.data.nome || "";
          } catch (e) {
            console.error("Não foi possível obter nome do solicitante:", e);
          }
          return {
            anuncio_id: item.anuncio_id,
            titulo: item.anuncio,
            preco: item.preco || "",
            imagem: formatarUrlImagem(item.imagem),
            id_contraface: item.id_solicitante,
            nome_contraface: nomeDoSolicitante,
            mensagens_novas: item.mensagens_novas,
            dono_anuncio: item.id_anunciante, // adiciona o anunciante para usar na marcação
          };
        })
      );

      setAnunciosVendendo(lista);

      // Se anúncio selecionado existir e for anunciante, atualiza contador dele
      if (anuncioSelecionado?.tipo === "anunciante") {
        const found = lista.find((a) => a.anuncio_id === anuncioSelecionado.anuncio_id);
        if (found) {
          setAnuncioSelecionado((prev) => ({
            ...prev,
            mensagens_novas: found.mensagens_novas,
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens como anunciante:", err);
    }
  };

  const loadAnunciosComprando = async () => {
    try {
      const res = await api.get("/mensagens/solicitante", { withCredentials: true });
      const listaRaw = res.data;

      // Buscar nome do anunciante em /utilizador/nome/{id}
      const lista = await Promise.all(
        listaRaw.map(async (item) => {
          let nomeDoAnunciante = "";
          try {
            const userRes = await api.get(`/utilizador/nome/${item.id_anunciante}`, { withCredentials: true });
            nomeDoAnunciante = userRes.data.nome || "";
          } catch (e) {
            console.error("Não foi possível obter nome do anunciante:", e);
          }
          return {
            anuncio_id: item.anuncio_id,
            titulo: item.anuncio,
            preco: item.preco || "",
            imagem: formatarUrlImagem(item.imagem),
            id_contraface: item.id_anunciante,
            nome_contraface: nomeDoAnunciante,
            mensagens_novas: item.mensagens_novas,
            dono_anuncio: item.id_anunciante, // para consistência
          };
        })
      );

      setAnunciosComprando(lista);

      if (anuncioSelecionado?.tipo === "solicitante") {
        const found = lista.find((a) => a.anuncio_id === anuncioSelecionado.anuncio_id);
        if (found) {
          setAnuncioSelecionado((prev) => ({
            ...prev,
            mensagens_novas: found.mensagens_novas,
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens como solicitante:", err);
    }
  };

  // Inicialmente e a cada 5s, recarregar as duas listas
  useEffect(() => {
    loadAnunciosVendendo();
    loadAnunciosComprando();
    const interval = setInterval(() => {
      loadAnunciosVendendo();
      loadAnunciosComprando();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  Troca de separador Anunciar/Comprar
  const handleTipoUsuario = (tipo) => {
    setTipoUsuario(tipo);
    if (tipo === "anunciante") {
      if (anunciosVendendo.length > 0) {
        setAnuncioSelecionado({ ...anunciosVendendo[0], tipo: "anunciante" });
      } else {
        setAnuncioSelecionado(null);
      }
    } else {
      if (anunciosComprando.length > 0) {
        setAnuncioSelecionado({ ...anunciosComprando[0], tipo: "solicitante" });
      } else {
        setAnuncioSelecionado(null);
      }
    }
  };

  // 3) Carregar chat para o anúncio selecionado
  const loadChatForSelection = async ({ anuncio_id, id_contraface, tipo, dono_anuncio }) => {
    if (!anuncio_id) return;
    try {
      const endpoint =
        tipo === "anunciante"
          ? `/mensagens/anunciante/chat/${anuncio_id}/${id_contraface}`
          : `/mensagens/solicitante/chat/${anuncio_id}`;

      const res = await api.get(endpoint, { withCredentials: true });
      setChatMessages((prev) => ({
        ...prev,
        [anuncio_id]: res.data,
      }));

      // Marcar como lidas apenas as mensagens enviadas pelo outro lado:
      // – Se o usuário for anunciante, quem enviou foi o solicitante (emissor='s'),
      //   então mandamos como utilizador_id o próprio solicitante (id_contraface).
      // – Se for solicitante, quem enviou foi o anunciante (emissor='a'),
      //   então mandamos como utilizador_id o dono do anúncio (dono_anuncio).
      const marcarId = tipo === "anunciante" ? id_contraface : dono_anuncio;

      await api.put(
        "/mensagens/marcar_lidos",
        {
          anuncio_id,
          utilizador_id: marcarId,
        },
        { withCredentials: true }
      );

      // Atualiza contagem de não lidas localmente, dependendo do tipo de usuário
      if (tipo === "anunciante") {
        setAnunciosVendendo((prev) =>
          prev.map((item) =>
            item.anuncio_id === anuncio_id
              ? { ...item, mensagens_novas: 0 }
              : item
          )
        );
      } else {
        setAnunciosComprando((prev) =>
          prev.map((item) =>
            item.anuncio_id === anuncio_id
              ? { ...item, mensagens_novas: 0 }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Erro ao carregar chat:", err.response?.data || err.message);
    }
  };

  // Sempre que a seleção mudar, carrega o chat e limpa input
  useEffect(() => {
    if (anuncioSelecionado) {
      loadChatForSelection(anuncioSelecionado);
      setNovaMensagem("");
    }
  }, [anuncioSelecionado]);

  // Enviar nova mensagem (diferencia Anunciante x Solicitante)
  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !anuncioSelecionado) return;

    const { anuncio_id, id_contraface, tipo } = anuncioSelecionado;

    try {
      if (tipo === "anunciante") {
        await api.post(
          "/mensagens/resposta",
          {
            anuncio_id,
            utilizador_id: id_contraface,
            mensagem: novaMensagem.trim(),
          },
          { withCredentials: true }
        );
      } else {
        await api.post(
          "/mensagens/enviar_mensagem_anuncio",
          {
            anuncio_id,
            mensagem: novaMensagem.trim(),
          },
          { withCredentials: true }
        );
      }
      setNovaMensagem("");
      // Recarrega somente o chat do anúncio em questão
      loadChatForSelection(anuncioSelecionado);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err.response?.data || err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enviarMensagem();
    }
  };

  // Rola o chat para o fim sempre que houver nova lista de mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatMessages, anuncioSelecionado]);

  return (
    <>
      <Header />
      <StyledWrapper>
        <div className="Chat-container">
          <div className="Chat-content d-flex flex-row w-100 h-100 gap-3">
            {/* LISTA DE CONVERSAS */}
            <div className="Chat-anuncios d-flex flex-column w-25 h-100 bg-body-tertiary p-2 rounded-3">
              <div className="d-flex flex-row justify-content-around">
                <button
                  className={`btn ${
                    tipoUsuario === "anunciante"
                      ? "btn-light"
                      : "btn-outline-light text-body-tertiary"
                  }`}
                  onClick={() => handleTipoUsuario("anunciante")}
                >
                  Anunciar
                </button>
                <button
                  className={`btn ${
                    tipoUsuario === "solicitante"
                      ? "btn-light"
                      : "btn-outline-light text-body-tertiary"
                  }`}
                  onClick={() => handleTipoUsuario("solicitante")}
                >
                  Comprar
                </button>
              </div>
              <hr className="mt-1" />
              <div className="d-flex flex-column w-100 h-100 gap-1 overflow-auto">
                {(tipoUsuario === "anunciante"
                  ? anunciosVendendo
                  : anunciosComprando
                ).map((item) => (
                  <button
                    key={item.anuncio_id}
                    className={`btn decoration-none p-1 m-0 text-start ${
                      anuncioSelecionado?.anuncio_id === item.anuncio_id
                        ? "btn-light border-white shadow"
                        : ""
                    }`}
                    onClick={() =>
                      setAnuncioSelecionado({
                        ...item,
                        tipo: tipoUsuario,
                      })
                    }
                  >
                    <div className="d-flex flex-row h-auto w-100 mb-3 p-1 gap-3">
                      <img
                        className="anuncio-chat d-flex object-fit-cover"
                        src={item.imagem}
                        alt={item.titulo}
                      />
                      <div className="d-flex flex-column align-items-start justify-content-center">
                        <p className="m-0">
                          <b>{item.titulo}</b>
                        </p>
                        <p className="m-0 text-truncate">
                          {tipoUsuario === "anunciante"
                            ? `Comprador: ${item.nome_contraface || item.id_contraface}`
                            : `Vendedor: ${item.nome_contraface || item.id_contraface}`}
                        </p>
                        {item.mensagens_novas > 0 && (
                          <span className="badge bg-danger">
                            {item.mensagens_novas}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ÁREA DE CHAT */}
            <div className="Chat-mensagens d-flex flex-column justify-content-between w-75 h-100 bg-body-tertiary p-5 rounded-3">
              {anuncioSelecionado ? (
                <>
                  {/* Cabeçalho do chat */}
                  <div className="mensagem-anuncio-chat d-flex flex-row h-auto w-100 mb-3 p-1 gap-3">
                    <img
                      className="anuncio-chat d-flex object-fit-cover"
                      src={anuncioSelecionado.imagem}
                      alt={anuncioSelecionado.titulo}
                    />
                    <div className="d-flex flex-column align-items-start justify-content-center">
                      <p className="m-0">
                        <b>{anuncioSelecionado.titulo}</b>{" "}
                        <small>- {anuncioSelecionado.preco}</small>
                      </p>
                      <p className="m-0">
                        {tipoUsuario === "anunciante"
                          ? `Comprador: ${anuncioSelecionado.nome_contraface || anuncioSelecionado.id_contraface}`
                          : `Vendedor: ${anuncioSelecionado.nome_contraface || anuncioSelecionado.id_contraface}`}
                      </p>
                    </div>
                  </div>
                  <hr />

                  {/* Lista de mensagens (com altura fixa e scroll interno) */}
                  <div
                    className="chat-messages-list d-flex flex-column"
                    ref={messagesEndRef}
                  >
                    {chatMessages[anuncioSelecionado.anuncio_id]?.map(
                      (message, idx) => (
                        <Mensage
                          key={`${message.data_hora}-${idx}`}
                          de={message.de}
                          user={message.user}
                          data_hora={message.data_hora}
                          mensagem={message.mensagem}
                          modo={tipoUsuario}
                        />
                      )
                    )}
                  </div>

                  {/* Campo de envio */}
                  <div className="d-flex flex-row w-100 h-auto mt-4 align-items-center">
                    <input
                      type="text"
                      className="form-control m-2"
                      placeholder={
                        tipoUsuario === "anunciante"
                          ? "Responder ao comprador..."
                          : "Enviar mensagem ao anunciante..."
                      }
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      className="button-edit border-0 d-flex shadow-sm rounded-circle m-2"
                      onClick={enviarMensagem}
                      disabled={!novaMensagem.trim()}
                    >
                      <i className="bi bi-send m-0 p-0 text-body-tertiary"></i>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center">Selecione um anúncio para ver o chat.</p>
              )}
            </div>
          </div>
        </div>
      </StyledWrapper>
      <BotaoToTOP />
    </>
  );
};

const StyledWrapper = styled.div`
  .Chat-container {
    height: 700px;
    padding: 25px;
    background-color: rgba(255, 255, 255, 0.8);
  }

  .anuncio-chat {
    width: 65px;
    height: 65px;
    object-fit: cover;
  }

  .chat-messages-list {
    flex: 1 1 auto;
    overflow-y: auto;
    margin-bottom: 10px;
  }
`;

export default Chat;
