import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BotaoToTOP from "../components/ScrollToTop";
import FavoritosComponent from "../components/ListingsSection";
import api from "../services/api";

const Favoritos = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem("utilizador_id");
    if (!storedId) {
      setAnuncios([]);
      setLoading(false);
      return;
    }

    const userId = parseInt(storedId, 10);

    api
      .get(`/favoritos/${userId}`, { withCredentials: true })
      .then((res) => {
        // res.data será um array de objetos { anuncio_id, utilizador_id, ... }
        // precisamos buscar detalhes de cada anúncio favorito
        const favoriteAnuncios = res.data; 

        // montar uma promise para buscar cada anúncio por ID
        return Promise.all(
          favoriteAnuncios.map((fav) =>
            api.get(`/anuncios/${fav.anuncio_id}`).then((resp) => {
              const a = resp.data;
              return {
                id: a.anuncio_id,
                imagem: a.imagem, // nome do arquivo, ex: "123.jpg", ou null
                titulo: a.titulo,
                preco: `${parseFloat(a.preco).toFixed(2)} €`,
                visualizacao: a.visualizacao,
                data_hora: new Date(a.data_hora).toLocaleDateString(),
                nome_user: a.utilizador_id, // será resolvido pelo AnuncioModel
              };
            })
          )
        );
      })
      .then((arr) => {
        setAnuncios(arr);
      })
      .catch((err) => {
        console.error("Erro ao carregar favoritos:", err);
        setAnuncios([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Callback para remover o anúncio da lista local assim que o usuário "desfavoritar"
  const handleUnfavorite = (anuncioId) => {
    setAnuncios((prev) => prev.filter((a) => a.id !== anuncioId));
  };

  if (loading) {
    return <p className="text-center mt-5">Carregando favoritos...</p>;
  }

  return (
    <>
      <Header />
      <FavoritosComponent
        anuncios={anuncios}
        h2Titulo="Meus Favoritos"
        onUnfavorite={handleUnfavorite}
      />
      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default Favoritos;
