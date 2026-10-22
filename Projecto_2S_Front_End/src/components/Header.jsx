import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/anunciosTuga.png";
import ItemModal from "../components/ModalAnuncio";
import api from "../services/api";

function Header() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [flashMessage, setFlashMessage] = useState("");

  // Ao montar, verifica se há flashMessage no localStorage e carrega
  useEffect(() => {
    const storedId = localStorage.getItem("utilizador_id");
    setUserLoggedIn(!!storedId);

    api
      .get("/categorias", { withCredentials: true })
      .then((res) => {
        setCategorias(res.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar categorias:", err);
      });

    // Verifica se existe mensagem armazenada para exibir
    const msg = localStorage.getItem("flashMessage");
    if (msg) {
      setFlashMessage(msg);
      localStorage.removeItem("flashMessage");
    }
  }, []);

  const handleFormSubmit = async (data) => {
    try {
      const formCreate = new FormData();
      formCreate.append("titulo", data.titulo);
      formCreate.append("categoria_id", data.categoria_id);
      formCreate.append("preco", data.preco);
      formCreate.append("discricao", data.discricao);
      formCreate.append("mostrar_contact", data.mostrar_contact);
      formCreate.append("destaque", data.destaque);
      formCreate.append("estado", data.estado);
      if (data.imagem) {
        formCreate.append("imagem", data.imagem);
      }

      await api.post("/anuncios/criar", formCreate, {
        withCredentials: true,
      });

      // Fecha o modal
      setShowModal(false);

      // Armazena a mensagem para exibir após reload
      const mensagem = "Anúncio criado com sucesso e aguarda validação da administração.";
      localStorage.setItem("flashMessage", mensagem);

      // Recarrega a página
      window.location.reload();
    } catch (err) {
      console.error("Erro ao criar anúncio:", err.response?.data || err.message);
    }
  };

  return (
    <>
      {/* Se houver flashMessage, exibe alerta verde no topo */}
      {flashMessage && (
        <div className="alert alert-success text-center mb-0" role="alert">
          {flashMessage}
        </div>
      )}

      <header className="header">
        <div className="content-header d-flex justify-content-between align-items-center">
          {/* Logo */}
          <div className="logo d-flex justify-content-end">
            <Link to="/">
              <img src={Logo} alt="Logo" />
            </Link>
          </div>

          {/* Botões de navegação */}
          <nav className="buttons-info d-flex align-items-center justify-content-end">
            {userLoggedIn && (
              <button type="button" className="btn">
                <Link to="/chat" className="icon text-decoration-none text-dark">
                  <i className="bi bi-chat"></i>&nbsp; Chat
                </Link>
              </button>
            )}

            {userLoggedIn && (
              <button type="button" className="btn">
                <Link
                  to="/favoritos"
                  className="icon text-decoration-none text-dark"
                >
                  <i className="bi bi-heart"></i>&nbsp; Favoritos
                </Link>
              </button>
            )}

            {userLoggedIn ? (
              <button type="button" className="btn">
                <Link
                  to="/profile"
                  className="icon text-decoration-none text-dark"
                >
                  <i className="bi bi-person"></i>&nbsp; A tua conta
                </Link>
              </button>
            ) : (
              <button type="button" className="btn">
                <Link
                  to="/login"
                  className="icon text-decoration-none text-dark"
                >
                  <i className="bi bi-person"></i>&nbsp; Login
                </Link>
              </button>
            )}

            {userLoggedIn && (
              <button
                type="button"
                className="btn color"
                onClick={() => setShowModal(true)}
              >
                Anunciar e Vender
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Modal de criação de anúncio */}
      <ItemModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleFormSubmit}
        initialData={null}
        categorias={categorias}
      />

      <style>
        {`
          .header .color {
            background-color: #FF6B1A;
            color: white;
          }
          .header .color:hover {
            transform: scale(1.1);
          }
        `}
      </style>
    </>
  );
}

export default Header;