import React from "react";
// Importação do componente de um modelo de destaque (apenas um modelo de 1 artigo)
import DestaquesSwiper from "../parts/DestaquesSwiper";

function Destaques({ artigos, h2Titulo }) {
  return (
    <div>
      <div className="destaques-container d-flex flex-column justify-content-center">
        {h2Titulo && <h2 className="text-dark align-self-center">{h2Titulo}</h2>}
        <div className="div-destaques">
          <DestaquesSwiper artigos={artigos} />
        </div>
      </div>
      <style>
        {`
        .destaques-container{
          // background-color: transparent!important;
        }
        `}
      </style>
    </div>
  );
}

export default Destaques;
