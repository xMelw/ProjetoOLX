import AnuncioModel from "../parts/AnunciosModel";
import Filter from "./FilterBar";
import FilterButton from "./FilterButton";

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
        <div className="Button-filter d-flex justify-content-end w-100 me-5">
          <a
            href="#offcanvasExample"
            className="text-decoration-none text-dark fs-5"
            data-bs-toggle="offcanvas"
            role="button"
            aria-controls="offcanvasExample"
          >
            <FilterButton />
          </a>
        </div>
        <div className="content-anuncios d-flex justify-content-center flex-wrap">
          {/* Passamos o callback onUnfavorite para o AnuncioModel */}
          <AnuncioModel anuncios={anuncios} onUnfavorite={onUnfavorite} />
        </div>
      </div>
      <Filter />
    </section>
  );
}

export default FavoritosComponent;
