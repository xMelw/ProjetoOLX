// Este ficheiro é um modelo (é uma sidebar) de filtros é usado na parte (do conjunto de anuncios, "AnunciosComprar")

function Filter() {
    const categorias = [ // Array de objetos de categorias
        { id: 1, nome: "Agricultura" },
        { id: 2, nome: "Animais" },
        { id: 3, nome: "Crianças" },
        { id: 4, nome: "Desporto" },
        { id: 5, nome: "Ferramentas" },
        { id: 6, nome: "Imóveis" },
        { id: 7, nome: "Lazer" },
        { id: 8, nome: "Moda" },
        { id: 9, nome: "Móveis" },
        { id: 10, nome: "Serviços" },
        { id: 11, nome: "Tecnologias" },
        { id: 12, nome: "Veículos" },
        { id: 13, nome: "Outros" }
    ];

    const filtros = [ // outro array de objetos de outro tipo de filtros
        {id: 1, tipo: "Ascendente"},
        {id: 2, tipo: "Descendente"}
    ]

    return (
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasExampleLabel">Filtros</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body"> {/* Aqui é adicionado os tipos de filtros */}
                
                <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                    {filtros.map((filtroTipo) => ( // aqui faz um ciclo for para adicionar os tipos de filtros
                        <div key={filtroTipo.id}> 
                            <input type="radio" className="btn-check b" name="btnradio" id={filtroTipo.id} autoComplete="off" />
                            <label className="btn" htmlFor={filtroTipo.id}>{filtroTipo.tipo}</label>
                        </div>
                    ))}
                </div>

                <hr />
                
                <h6>Categorias</h6>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="radioDefault" id="radioTodos" />
                    <label className="form-check-label" htmlFor="radioTodos">
                        Todos
                    </label>
                </div>

                {categorias.map((categoria) => ( // aqui tambem faz outro ciclo for, aqui aplica os filtros de categorias
                    <div className="form-check" key={categoria.id}>
                        <input className="form-check-input" type="radio" name="radioDefault" id={`categoria-${categoria.id}`} />
                        <label className="form-check-label" htmlFor={`categoria-${categoria.id}`}>
                            {categoria.nome}
                        </label>
                    </div>
                ))}

                <hr/>

                <div>
                    <h6>Preço</h6>
                    <div className="d-flex justify-content-between mt-3"><p>0€</p><p>+ 1000€</p></div>
                    <input type="range" className="form-range" min="0" max="10" id="customRange2" />
                </div>

                <br />

                <div className="col-12 d-flex justify-content-end mt-5">
                    <button className="btn btn-outline-success" type="submit">Submeter</button>
                </div>
            </div>
        </div>
    );
}


// ---- Exportação do componente Filter ----
export default Filter;
