import AdList from "../parts/AdList";
import FilterIcon from "./FilterIcon";
import { Link } from "react-router-dom";

/**
 * @param {{
 *   anuncios: any[],
 *   h2Titulo: string,
 *   onUnfavorite?: (id: number) => void
 * }} props
 */
function FavoritosComponent({ anuncios, h2Titulo, onUnfavorite }) {
  return (
    <section id="Anuncios">
      <div className="anuncios d-flex flex-column align-items-center justify-content-center">
        <h2 className="text-dark align-self-center">{h2Titulo}</h2>
        <div className="content-anuncios d-flex justify-content-center flex-wrap">
          {/* Passamos o callback onUnfavorite para o AdList */}
          <AdList anuncios={anuncios} onUnfavorite={onUnfavorite} />
        </div>
        <div className="d-flex justify-content-center w-100 me-5">
          {!onUnfavorite && (
            <Link to="/anuncios" className="text-decoration-none text-dark fs-5" aria-label="Mais Anúncios" title="Mais Anúncios">
              <FilterIcon />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default FavoritosComponent;
