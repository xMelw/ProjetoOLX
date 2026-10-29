import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BotaoToTOP from "../components/ScrollToTop";
import ArtigoContent from "../components/Artigo";
import Relacionados from "../components/FeaturedListings";
import useAdDetailController from "../../controllers/useAdDetailController";

const AnuncioDetalhe = () => {
  const { id } = useParams();
  const { ad, relatedAds, loading, goBack } = useAdDetailController(id);
  if (loading) return <p className="text-center mt-5">A carregar anúncio…</p>;
  if (!ad) return (
    <>
      <Header />
      <main className="container py-5 text-center">
        <p>Anúncio não encontrado ou indisponível.</p>
        <Link to="/anuncios" className="btn btn-outline-secondary">Ver todos os anúncios</Link>
      </main>
      <Footer />
    </>
  );
  return (
    <>
      <Header />
      <main className="destaques-container d-flex flex-column justify-content-left mb-0 mt-0 ml-0 p-0" style={{ backgroundColor: "transparent"}}>
        <div className="content-artigo d-flex flex-wrap pl-0" style={{ marginLeft: "0"}}>
          <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center" onClick={goBack}>
          <i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos anúncios
        </button>
        </div>
      </main>
      <ArtigoContent {...ad} />
      <Relacionados artigos={relatedAds} h2Titulo="Relacionados" />
      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default AnuncioDetalhe;