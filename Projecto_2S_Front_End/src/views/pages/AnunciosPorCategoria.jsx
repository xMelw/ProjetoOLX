import { useParams } from "react-router-dom";
import Header from "../components/Header";
import BotaoToTOP from "../components/ScrollToTop";
import Footer from "../components/Footer";
import AdList from "../parts/AdList";
import useCategoryController from "../../controllers/useCategoryController";

const AnunciosPorCategoria = () => {
  const { id } = useParams();
  const { ads, categoryName, loading } = useCategoryController(id);
  return (
    <>
      <Header />
      <main className="p-4">
        <h1 className="text-center text-dark mb-4">Anúncios{categoryName ? ` - ${categoryName}` : ""}</h1>
        {loading ? <p className="text-center">A carregar anúncios…</p> : ads.length === 0 ? <p className="text-center">Nenhum anúncio encontrado para esta categoria.</p> : (
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <AdList anuncios={ads} />
          </div>
        )}
      </main>
      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default AnunciosPorCategoria;