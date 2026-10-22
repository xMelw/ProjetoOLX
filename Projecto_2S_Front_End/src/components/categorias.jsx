import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ListaCategorias from "../parts/CategoriasList";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categorias")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Erro ao carregar categorias:", err));
  }, []);

  const handleClick = (id) => {
    navigate(`/categoria/${id}`);
  };

  return (
    <section id="Categoria">
      <div className="categorias d-flex flex-column align-items-center justify-content-center">
        <h2 className="text-dark">Categorias</h2>
        <div className="content-categorias d-flex justify-content-center flex-wrap">
          {categorias.map((categoria, index) => (
            <div key={index} onClick={() => handleClick(categoria.categoria_id)} className="cursor-pointer">
              <ListaCategorias
                icon={categoria.icon}
                nome={categoria.nome}
                color={categoria.cor}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categorias;
