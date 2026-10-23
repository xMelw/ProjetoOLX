import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// este componente faz duas coisas:
// 1) controla a exibição do botão de voltar ao topo conforme o usuário rola a página
// 2) quando a rota muda, move o scroll para o topo automaticamente
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  // ao rolar, controla se o botão aparece ou não
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // quando a rota (pathname) mudar, manda pro topo sem animação
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`TopButton w-[50px] h-[50px] ${visible ? "show" : "hide"}`}
    >
      <i className="bi bi-chevron-up"></i>
    </button>
  );
}