import { useNavigate } from "react-router-dom";
import ListaCategorias from "../parts/CategoriasList";
import useCategoriesController from "../../controllers/useCategoriesController";

const Categorias = () => {
  const { categories } = useCategoriesController();
  const navigate = useNavigate();
  return (
    <section id="Categoria">
      <div className="categorias d-flex flex-column align-items-center justify-content-center">
        <h2 className="text-dark">Categorias</h2>
        <div className="content-categorias d-flex justify-content-center flex-wrap">
          {categories.map((category) => (
            <div key={category.categoria_id}>
              <ListaCategorias icon={category.icon} nome={category.nome} color={category.cor} onClick={() => navigate(`/categoria/${category.categoria_id}`)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categorias;