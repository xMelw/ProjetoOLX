import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BotaoToTOP from "../components/botaoToTop";
import ArtigoContent from "../components/Artigo";
import Relacionados from "../components/destaques";
import api from "../services/api";

const AnuncioDetalhe = () => {
  const { id } = useParams();
  const [anuncio, setAnuncio] = useState(null);
  const [relacionados, setRelacionados] = useState([]);

  useEffect(() => {
    api.get(`/anuncios/${id}`)
      .then(res => {
        const a = res.data;

        setAnuncio({
          id: a.anuncio_id,
          imagem: a.imagem || "/placeholder.jpg",
          titulo: a.titulo,
          preco: `${parseFloat(a.preco).toFixed(2)} €`,
          views: a.visualizacao,
          data_hora: new Date(a.data_hora).toLocaleDateString(),
          categoria: a.categoria?.nome || "",
          nome_user: a.utilizador?.nome || "Desconhecido",
          descricao: a.discricao,
          contacto: a.mostrar_contact ? a.utilizador?.telemovel : null,
          email: a.mostrar_contact ? a.utilizador?.email : null,
          distrito: a.utilizador?.localizacao?.distrito || "",
          destaque: a.destaque
        });

        
        api.get(`/anuncios/categoria/${a.categoria_id}`).then((res) => {
          const outros = res.data
            .filter(x => x.anuncio_id !== a.anuncio_id)
            .slice(0, 4)
            .map((x) => ({
              id: x.anuncio_id,
              img: x.imagem || "/placeholder.jpg",
              nome: x.titulo,
              preco: `${parseFloat(x.preco).toFixed(2)} €`,
            }));
          setRelacionados(outros);
        });

      })
      .catch((err) => console.error("Erro ao carregar o anúncio:", err));
  }, [id]);

  if (!anuncio) return <p className="text-center mt-5">A carregar anúncio...</p>;

  return (
    <>
      <Header />
      <ArtigoContent {...anuncio} />
      <Relacionados artigos={relacionados} h2Titulo="Relacionados" />
      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default AnuncioDetalhe;
