import tinycolor from 'tinycolor2';
import React from "react";

/**
 * @param {{
 *   id: number,
 *   nome: string,
 *   icon: string,
 *   color: string
 * }} props
 */

function CategoriasList({ nome, icon, color, onClick }) {


    const lightenColor = (color, percent) =>{
        return tinycolor(color).lighten(percent).toString();
    }

    const lightenedColor = lightenColor(color, 15);

    return(
        <div className="categorias-list d-flex flex-row align-items-center">
            <button className="icon-div d-flex justify-content-center align-items-center" type="button" onClick={onClick} aria-label={nome} style={{ backgroundColor: color, borderRadius: '5px', border: 'none' }}>
                <i className={icon} style={{ color: lightenedColor}}></i>
                <span className="categoria-overlay">{nome}</span>
            </button>
        </div>
    )
}

export default CategoriasList;