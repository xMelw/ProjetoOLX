import Header from "../components/Header";
import Footer from "../components/Footer";
import AdList from "../parts/AdList";
import ScrollToTop from "../components/ScrollToTop";
import useCatalogController from "../../controllers/useCatalogController";
import "./Anuncios.css";

const Anuncios = () => {
  const { categories, search, setSearch, selectedCategory, setSelectedCategory, minimumPrice, setMinimumPrice, maximumPrice, setMaximumPrice, sort, setSort, loading, error, filteredAds, clearFilters } = useCatalogController();

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
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
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
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="O que estás à procura?" />
              </span>
            </label>
            <label>
              <span>Categoria</span>
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="">Todas as categorias</option>
                {categories.map((category) => <option key={category.categoria_id} value={category.categoria_id}>{category.nome}</option>)}
              </select>
            </label>
            <div className="store-price-filter">
              <span>Intervalo de preço</span>
              <div>
                <label className="visually-hidden" htmlFor="store-min-price">Preço mínimo</label>
                <input id="store-min-price" type="number" min="0" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} placeholder="Mín. €" />
                <span aria-hidden="true">—</span>
                <label className="visually-hidden" htmlFor="store-max-price">Preço máximo</label>
                <input id="store-max-price" type="number" min="0" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} placeholder="Máx. €" />
              </div>
            </div>
            <button type="button" className="store-clear-button" onClick={clearFilters}><i className="bi bi-arrow-counterclockwise" /> Limpar</button>
          </div>

          <div className="store-results-line" aria-live="polite">
            <span>{loading ? "A carregar anúncios…" : `${filteredAds.length} ${filteredAds.length === 1 ? "anúncio encontrado" : "anúncios encontrados"}`}</span>
            {(search || selectedCategory || minimumPrice || maximumPrice) && <span className="store-filter-active">Filtros ativos</span>}
          </div>

          {error ? (
            <div className="store-state store-error" role="alert"><i className="bi bi-wifi-off" /><p>{error}</p></div>
          ) : loading ? (
            <div className="store-state"><span className="spinner-border spinner-border-sm" role="status" /><p>A preparar o catálogo…</p></div>
          ) : filteredAds.length ? (
            <div className="store-products-grid"><AdList anuncios={filteredAds} /></div>
          ) : (
            <div className="store-state">
              <i className="bi bi-search-heart" />
              <h3>Não encontrámos anúncios</h3>
              <p>Experimenta alterar a pesquisa ou os filtros.</p>
              <button type="button" className="store-reset-button" onClick={clearFilters}>Ver todos os anúncios</button>
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