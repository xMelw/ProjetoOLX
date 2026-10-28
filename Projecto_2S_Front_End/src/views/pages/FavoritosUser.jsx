import Header from "../components/Header";
import Footer from "../components/Footer";
import BotaoToTOP from "../components/ScrollToTop";
import FavoritosComponent from "../components/ListingsSection";
import useFavoritesController from "../../controllers/useFavoritesController";

const Favoritos = () => {
  const { ads, loading, removeFavoriteFromView } = useFavoritesController();
  if (loading) return <p className="text-center mt-5">A carregar favoritos…</p>;
  return (
    <>
      <Header />
      <FavoritosComponent anuncios={ads} h2Titulo="Meus Favoritos" onUnfavorite={removeFavoriteFromView} />
      {ads.length === 0 && <p className="text-center">Ainda não tens anúncios favoritos.</p>}
      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default Favoritos;