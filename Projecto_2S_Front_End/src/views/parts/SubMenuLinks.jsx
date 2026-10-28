/**
 * @typedef {Object} subMenuProps
 * @property {string} nome
 * @property {string} caminho
 */

// Componente visual de links do submenu. é usado no subMenu.jsx

function SubMenuLinks({ subMenu }) {
  return (
    <>
      {subMenu.map((item) => (
        <div key={item.nome} className="SubMenu-content d-flex btn">
          <a href={item.caminho} className="SubMenu-path text-dark">
            {item.nome}
          </a>
          <style>
            {`
              .SubMenu-content {
                color: #fff;
                line-height: 2;
                position: relative;
              }

              .SubMenu-content::before {
                content: '';
                width: 0;
                height: 2px;
                border-radius: 2px;
                background-color: #1DD3B0;
                position: absolute;
                bottom: -0.25rem;
                left: 0;
                transition: width 0.4s;
              }

              .SubMenu-content:hover::before {
                width: 100%;
              }
            `}
          </style>
        </div>
      ))}
    </>
  );
}

export default SubMenuLinks;