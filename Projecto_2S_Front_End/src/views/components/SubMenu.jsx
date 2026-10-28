import SubMenuLinks from "../parts/SubMenuLinks";
import SearchButton from "./SearchButton";

// Neste componente, do submenu, ficam todos os links para navegar dentro da propria pagina

function SubMenu({subMenu}){

    return(
        <>
            <div className="SubMenu-container d-flex justify-content-between w-auto m-0">
               <div className="d-flex flex-row gap-3">
                    <SubMenuLinks subMenu={subMenu}/>
                </div>
                    <SearchButton/>
                </div>
            <style>{`

            div.SubMenu-container{
                border-bottom: 2px solid #F5F5F5;
                padding-bottom: 10px;
                margin-top:0px;
                border-radius: 0px;
            }
            `}</style>        
        </>
    );
}

export default SubMenu;