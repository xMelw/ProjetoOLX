import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnuncioModel from "../parts/AnunciosModel";
import ScrollToTop from "../components/ScrollToTop";
import api from "../services/api";
import "./Anuncios.css";

const formatPrice = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const Anuncios = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [precoMinimo, setPrecoMinimo] = useState("");
  const [precoMaximo, setPrecoMaximo] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    api.get("/anuncios/maisvistos/top30")
      .then(({ data }) => {
        if (!ativo) return;
        setAnuncios(data.map((anuncio) => ({
          id: anuncio.anuncio_id,
          imagem: anuncio.imagem
            ? `http://localhost:5000/uploads/${anuncio.imagem}`
            : "/placeholder.png",
          titulo: anuncio.titulo,
          precoValor: Number(anuncio.preco) || 0,
          preco: formatPrice.format(Number(anuncio.preco) || 0),
          visualizacao: Number(anuncio.visualizacao) || 0,
          dataOriginal: anuncio.data_hora,
          data_hora: new Date(anuncio.data_hora).toLocaleDateString("pt-PT"),
          categoria: anuncio.categoria_id,
          nome_user: anuncio.utilizador_id,
        })));
      })
      .catch((requestError) => {
        console.error("Erro ao carregar anúncios:", requestError);
        if (ativo) setErro("Não foi possível carregar os anúncios. Tenta novamente mais tarde.");
      })
      .finally(() => {
        if (ativo) setACarregar(false);
      });

    api.get("/categorias")
      .then(({ data }) => {
        if (ativo) setCategorias(data);
      })
      .catch((requestError) => console.error("Erro ao carregar categorias:", requestError));

    return () => {
      ativo = false;
    };
  }, []);

  const anunciosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-PT");
    const resultado = anuncios.filter((anuncio) => {
      const correspondePesquisa = !termo || anuncio.titulo.toLocaleLowerCase("pt-PT").includes(termo);
      const correspondeCategoria = !categoriaSelecionada || String(anuncio.categoria) === categoriaSelecionada;
      const correspondeMinimo = precoMinimo === "" || anuncio.precoValor >= Number(precoMinimo);
      const correspondeMaximo = precoMaximo === "" || anuncio.precoValor <= Number(precoMaximo);
      return correspondePesquisa && correspondeCategoria && correspondeMinimo && correspondeMaximo;
    });

    return resultado.sort((a, b) => {
      if (ordenacao === "preco-crescente") return a.precoValor - b.precoValor;
      if (ordenacao === "preco-decrescente") return b.precoValor - a.precoValor;
      if (ordenacao === "popularidade") return b.visualizacao - a.visualizacao;
      return new Date(b.dataOriginal).getTime() - new Date(a.dataOriginal).getTime();
    });
  }, [anuncios, pesquisa, categoriaSelecionada, precoMinimo, precoMaximo, ordenacao]);

  const limparFiltros = () => {
    setPesquisa("");
    setCategoriaSelecionada("");
    setPrecoMinimo("");
    setPrecoMaximo("");
    setOrdenacao("recentes");
  };

  return (
    <>
      <Header />
      <main className="store-page">
        <section className="store-hero">
          <span className="store-eyebrow"><i className="bi bi-shop-window" /> Mercado Anúncios Tuga</span>
          <div className="store-hero-copy">
            <div>
              <h1>Encontra o que procuras.</h1>
              <p>Explora artigos únicos, compara preços e fala diretamente com quem vende.</p>
            </div>
            <div className="store-hero-icon" aria-hidden="true"><i className="bi bi-bag-heart" /></div>
          </div>
        </section>

        <section className="store-catalog" aria-label="Catálogo de anúncios">
          <div className="store-toolbar">
            <div>
              <p className="store-section-kicker">Catálogo</p>
              <h2>Todos os anúncios</h2>
            </div>
            <label className="store-sort">
              <span>Ordenar por</span>
              <select value={ordenacao} onChange={(event) => setOrdenacao(event.target.value)}>
                <option value="recentes">Mais recentes</option>
                <option value="popularidade">Mais vistos</option>
                <option value="preco-crescente">Preço: mais baixo</option>
                <option value="preco-decrescente">Preço: mais alto</option>
              </select>
            </label>
          </div>

          <div className="store-filter-panel">
            <label className="store-search-field">
              <span>Pesquisar</span>
              <span className="store-input-wrap">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  type="search"
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  placeholder="O que estás à procura?"
                />
              </span>
            </label>
            <label>
              <span>Categoria</span>
              <select value={categoriaSelecionada} onChange={(event) => setCategoriaSelecionada(event.target.value)}>
                <option value="">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.categoria_id} value={categoria.categoria_id}>{categoria.nome}</option>
                ))}
              </select>
            </label>
            <div className="store-price-filter">
              <span>Intervalo de preço</span>
              <div>
                <label className="visually-hidden" htmlFor="store-min-price">Preço mínimo</label>
                <input id="store-min-price" type="number" min="0" value={precoMinimo} onChange={(event) => setPrecoMinimo(event.target.value)} placeholder="Mín. €" />
                <span aria-hidden="true">—</span>
                <label className="visually-hidden" htmlFor="store-max-price">Preço máximo</label>
                <input id="store-max-price" type="number" min="0" value={precoMaximo} onChange={(event) => setPrecoMaximo(event.target.value)} placeholder="Máx. €" />
              </div>
            </div>
            <button type="button" className="store-clear-button" onClick={limparFiltros}>
              <i className="bi bi-arrow-counterclockwise" /> Limpar
            </button>
          </div>

          <div className="store-results-line" aria-live="polite">
            <span>{aCarregar ? "A carregar anúncios…" : `${anunciosFiltrados.length} ${anunciosFiltrados.length === 1 ? "anúncio encontrado" : "anúncios encontrados"}`}</span>
            {(pesquisa || categoriaSelecionada || precoMinimo || precoMaximo) && <span className="store-filter-active">Filtros ativos</span>}
          </div>

          {erro ? (
            <div className="store-state store-error" role="alert"><i className="bi bi-wifi-off" /><p>{erro}</p></div>
          ) : aCarregar ? (
            <div className="store-state"><span className="spinner-border spinner-border-sm" role="status" /><p>A preparar o catálogo…</p></div>
          ) : anunciosFiltrados.length ? (
            <div className="store-products-grid">
              <AnuncioModel anuncios={anunciosFiltrados} />
            </div>
          ) : (
            <div className="store-state">
              <i className="bi bi-search-heart" />
              <h3>Não encontrámos anúncios</h3>
              <p>Experimenta alterar a pesquisa ou os filtros.</p>
              <button type="button" className="store-reset-button" onClick={limparFiltros}>Ver todos os anúncios</button>
            </div>
          )}
        </section>
      </main>
      <ScrollToTop />
      <Footer />
    </>
  );
};

export default Anuncios;
