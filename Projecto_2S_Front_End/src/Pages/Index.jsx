import { useEffect, useState } from "react";
import Header from "../components/Header";
import Categorias from "../components/categorias";
import Footer from "../components/Footer";
import Destaques from "../components/destaques";
import Anuncios from "../components/favoritos"; // este componente espera props { anuncios, h2Titulo }
import BotaoToTOP from "../components/botaoToTop";
import SubMenu from "../components/submenu";
import api from "../services/api";

const Index = () => {
  const [destaques, setDestaques] = useState([]);
  const [maisVistos, setMaisVistos] = useState([]);
  const [loadingDestaques, setLoadingDestaques] = useState(true);
  const [loadingMaisVistos, setLoadingMaisVistos] = useState(true);

  // SubMenu fixa (idem ao original)
  const subMenuIndex = [
    { nome: 'Categorias', caminho: '#Categoria' },
    { nome: 'Destaques', caminho: '#Destaques' },
    { nome: 'Mais Vistos', caminho: '#MaisVistos' }
  ];

  useEffect(() => {
    // Carregar anúncios em destaque
    api.get("/anuncios/destaque")
      .then((res) => {
        const mapped = res.data.map((a) => ({
          // o componente Destaques espera objetos { img, nome, preco, id } 
          id: a.anuncio_id,
          img: a.imagem 
            ? `http://localhost:5000/uploads/${a.imagem}` 
            : "/placeholder.png",
          nome: a.titulo,
          preco: `${parseFloat(a.preco).toFixed(2)} €`
        }));
        setDestaques(mapped);
      })
      .catch((err) => {
        console.error("Erro ao buscar destaques:", err);
        setDestaques([]);
      })
      .finally(() => {
        setLoadingDestaques(false);
      });

    // Carregar anúncios mais vistos (limite 30)
    api.get("/anuncios/maisvistos/top30")
      .then((res) => {
        const mapped = res.data.map((a) => ({
          // o componente Anuncios (“favoritos.jsx”) repassa estes objetos para AnuncioModel
          id: a.anuncio_id,
          imagem: a.imagem 
            ? `http://localhost:5000/uploads/${a.imagem}` 
            : "/placeholder.png",
          titulo: a.titulo,
          preco: `${parseFloat(a.preco).toFixed(2)} €`,
          visualizacao: a.visualizacao,
          data_hora: new Date(a.data_hora).toLocaleDateString(),
          categoria: a.categoria_id,      // o AnuncioModel pode usar apenas para backend, ou exibir depois
          nome_user: a.utilizador_id      // será trocado por nome real dentro de AnuncioModel em tempo de execução
        }));
        setMaisVistos(mapped);
      })
      .catch((err) => {
        console.error("Erro ao buscar mais vistos:", err);
        setMaisVistos([]);
      })
      .finally(() => {
        setLoadingMaisVistos(false);
      });
  }, []);

  return (
    <>
      <Header />
      <SubMenu subMenu={subMenuIndex} />

      <Categorias />

      <section id="Destaques" className="p-4">
        <h2 className="text-center text-dark mb-4">Destaques</h2>
        {loadingDestaques ? (
          <p className="text-center">A carregar destaques...</p>
        ) : (
          <Destaques artigos={destaques} h2Titulo="" />
        )}
      </section>

      <section id="MaisVistos" className="p-4">
        <h2 className="text-center text-dark mb-4">Mais Vistos</h2>
        {loadingMaisVistos ? (
          <p className="text-center">A carregar anúncios...</p>
        ) : (
          <Anuncios anuncios={maisVistos} h2Titulo="" />
        )}
      </section>

      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default Index;