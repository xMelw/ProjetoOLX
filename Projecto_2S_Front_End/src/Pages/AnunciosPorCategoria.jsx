import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../services/api";
import AnunciosModel from "../parts/AnunciosModel";
import BotaoToTOP from "../components/ScrollToTop";
import Footer from "../components/Footer";
import Header from "../components/Header";

const AnunciosPorCategoria = () => {
  const { id } = useParams();
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaNome, setCategoriaNome] = useState("");

  useEffect(() => {
    api.get(`/anuncios/categoria/${id}`)
      .then((res) => {
        const mapped = res.data.map((anuncio) => ({
          id: anuncio.anuncio_id,
          imagem: anuncio.imagem || "/placeholder.jpg",
          titulo: anuncio.titulo,
          preco: anuncio.preco,
          visualizacao: anuncio.visualizacao,
          data_hora: new Date(anuncio.data_hora).toLocaleDateString(),
          categoria: anuncio.categoria_id,
          nome_user: anuncio.utilizador_id // ou substituir se tiveres nome
        }));
        setAnuncios(mapped);
      })
      .catch((err) => console.error("Erro ao carregar anúncios:", err));

    api.get("/categorias")
      .then((res) => {
        const cat = res.data.find(c => c.categoria_id == id);
        if (cat) setCategoriaNome(cat.nome);
      })
      .catch((err) => console.error("Erro ao carregar categoria:", err));
  }, [id]);

  return (
    <>
        <Header />
        {/* <SubMenu subMenu={subMenuIndex} /> */}
        <section className="p-4">
            <h2 className="text-center text-dark mb-4">Anúncios - {categoriaNome}</h2>
            {anuncios.length === 0 ? (
                <p className="text-center">Nenhum anúncio encontrado para esta categoria.</p>
            ) : (
                <div className="d-flex flex-wrap justify-content-center gap-4">
                {anuncios.map(anuncio => (
                  <Link key={anuncio.id} to={`/Anuncio/${anuncio.id}`} className="text-decoration-none text-dark">
                    <AnunciosModel anuncios={[anuncio]} />
                  </Link>
                ))}
                </div>
            )}
        </section>
            
        <BotaoToTOP />
        <Footer />
    </>
  );
};

export default AnunciosPorCategoria;
