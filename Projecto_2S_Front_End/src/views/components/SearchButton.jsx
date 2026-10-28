import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchButton() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/anuncios?pesquisa=${encodeURIComponent(term)}`);
  };

  return (
    <div className="submenu-search">
      <style>{`
        .search-form { position: relative; width: 42px; height: 42px; background: #f8f9fa; border-radius: 24px; transition: width .25s ease; }
        .search-form:hover, .search-form:focus-within { width: min(300px, 72vw); }
        .search-input { display: block; width: 100%; height: 42px; padding: 0 48px 0 16px; color: #243a37; background: transparent; border: 0; border-radius: 24px; outline: 0; opacity: 0; transition: opacity .2s ease; }
        .search-form:hover .search-input, .search-form:focus-within .search-input { opacity: 1; }
        .search-submit { position: absolute; top: 0; right: 0; display: grid; width: 42px; height: 42px; place-items: center; color: #243a37; background: #f8f9fa; border: 0; border-radius: 50%; cursor: pointer; }
        .search-form:focus-within .search-submit, .search-submit:hover { color: #fff; background: #1dd3b0; }
      `}</style>
      <form className="search-form" role="search" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="submenu-search-input">Pesquisar anúncios</label>
        <input
          id="submenu-search-input"
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar anúncios…"
        />
        <button className="search-submit" type="submit" aria-label="Pesquisar">
          <i className="bi bi-search" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

export default SearchButton;