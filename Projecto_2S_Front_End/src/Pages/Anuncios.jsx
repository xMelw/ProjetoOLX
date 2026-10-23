import Header from "../components/Header";
import Footer from "../components/Footer";
import ConjuntoAnuncios from "../components/ListingsSection";
import BotaoToTOP from "../components/ScrollToTop";

// Importação de todas as imagens
// adicionar novas imagens no file adjacente para poder exportar todos de uma só vez!
import { artigo1, artigo2, artigo3, artigo4, artigo5, artigo6, artigo7 } from "../assets/imgsArtigos";

const Anuncios = () => {

    // ---- Array de objetos de anuncios ----
  const index_anuncios = [
      { id: 1, imagem: artigo1, titulo:'Applewatch' , preco:'250€' , views:'15' , data_hora:'2025-05-14 20:02' , categoria:'Tecnologias' , nome_user:'Amélia'},
      { id: 2, imagem: artigo2, titulo: 'Cacto', preco: '30€', views: '2', data_hora:'2025-05-14 20:02', categoria:'Agricultura', nome_user: 'Joaquim' },
      { id: 3, imagem: artigo3, titulo: 'Iphone', preco: '999€', views: '100', data_hora:'2025-05-14 20:02', categoria:'Tecnologias', nome_user: 'Rita' },
      { id: 4, imagem: artigo4, titulo: 'Ipad', preco: '799€', views: '150', data_hora:'2025-05-14 20:02', categoria:'Tecnologias', nome_user: 'Joana' },
      { id: 5, imagem: artigo5, titulo: 'Macbook Pro', preco: '2399€', views: '250', data_hora:'2025-05-14 20:02', categoria:'Tecnologias', nome_user: 'Paulo' },
      { id: 6, imagem: artigo6, titulo: 'Mala', preco: '120€', views:'43', data_hora:'2025-05-14 20:02', categoria:'Moda', nome_user: 'Rita' },
      { id: 7, imagem: artigo7, titulo: 'Sapatos', preco: '80€', views: '7', data_hora:'2025-05-14 20:02', categoria:'Moda', nome_user: 'Alexandre' },
  ];

  return (
    <>
      <Header />
      <ConjuntoAnuncios anuncios={index_anuncios} h2Titulo="Anuncios"/> {/* Recebe o array de objetos dos anuncios*/}
      <BotaoToTOP />
      <Footer />
    </>
  );
}

export default Anuncios;
