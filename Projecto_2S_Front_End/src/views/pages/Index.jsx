import Header from "../components/Header";
import Categorias from "../components/Categories";
import Footer from "../components/Footer";
import Destaques from "../components/FeaturedListings";
import Anuncios from "../components/ListingsSection";
import BotaoToTOP from "../components/ScrollToTop";
import SubMenu from "../components/SubMenu";
import useHomeController from "../../controllers/useHomeController";
const Index = () => {
  const { featuredAds, popularAds, loadingFeatured, loadingPopular, featuredError, popularError } = useHomeController();
  const subMenuIndex = [
    { nome: "Categorias", caminho: "#Categoria" },
    { nome: "Destaques", caminho: "#Destaques" },
    { nome: "Mais Vistos", caminho: "#MaisVistos" },
  ];
  return (
    <>
      <Header />
      <SubMenu subMenu={subMenuIndex} />

      <Categorias />

      <section id="Destaques" className="p-4">
        <h2 className="text-center text-dark mb-4">Destaques</h2>
        {loadingFeatured ? (
          <p className="text-center">A carregar destaques...</p>
        ) : (
          featuredError ? <p className="alert alert-warning text-center" role="alert">{featuredError}</p> : featuredAds.length ? <Destaques artigos={featuredAds} h2Titulo="" /> : <p className="text-center">Ainda não há anúncios em destaque.</p>
        )}
      </section>

      <section id="MaisVistos" className="p-4">
        <h2 className="text-center text-dark mb-4">Mais Vistos</h2>
        {loadingPopular ? (
          <p className="text-center">A carregar anúncios...</p>
        ) : (
          popularError ? <p className="alert alert-warning text-center" role="alert">{popularError}</p> : popularAds.length ? <Anuncios anuncios={popularAds} h2Titulo="" /> : <p className="text-center">Ainda não há anúncios para mostrar.</p>
        )}
      </section>

      <BotaoToTOP />
      <Footer />
    </>
  );
};

export default Index;

