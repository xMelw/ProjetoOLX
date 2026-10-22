import tinycolor from 'tinycolor2';
import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * @param {{
 *   id: number,
 *   nome: string,
 *   icon: string,
 *   color: string
 * }} props
 */

function CategoriasList({ id, nome, icon, color }) {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navega para /categoria/:id
        navigate(`/categoria/${id}`);
    };

    const lightenColor = (color, percent) =>{
        return tinycolor(color).lighten(percent).toString();
    }

    const lightenedColor = lightenColor(color, 15);

    return(
        <div className="categorias-list d-flex flex-row align-items-center">
            <button className="icon-div d-flex justify-content-center align-items-center" style={{ backgroundColor: color, borderRadius: '5px', border: 'none' }}>
                <i className={icon} style={{ color: lightenedColor}}></i>
                <span className="categoria-overlay" onClick={handleClick}>{nome}</span>
            </button>
        </div>
    )
}

export default CategoriasList;