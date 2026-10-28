import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Tooltip as BootstrapTooltip } from "bootstrap";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import useListingController from "../../controllers/useListingController";
import { imageUrl } from "../../controllers/formatters";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function DestaquesSwiper({ artigos = [] }) {
  const { favorites: favoritos, errorMessage, toggleFavorite: handleLikeToggle, navigate } = useListingController(artigos);
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll("[data-bs-toggle='tooltip']").forEach((element) => {
        const existing = BootstrapTooltip.getInstance(element);
        if (existing) existing.dispose();
        new BootstrapTooltip(element);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [artigos, favoritos]);
  return (
    <>
      {errorMessage && (
        <div className="alert alert-warning text-center py-1">{errorMessage}</div>
      )}

      <Swiper
        key={artigos.length}
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={"auto"}
        spaceBetween={20}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={artigos.length > 5} // o modo loop só funciona com mais slides do que os visíveis (máx. 5)
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 1 },
          853: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 5 },
        }}
      >
        {artigos.map((artigo) => {
          const { img, nome, preco, id } = artigo;
          // img pode ser o nome do ficheiro devolvido pela API ou já um URL completo
          const urlImagem = imageUrl(img);

          return (
            <SwiperSlide key={id} style={{ width: "auto", height: "400px" }}>
              <div className="artigo-card">
                {/*  NÃO colocamos mais href="#" pois não queremos a âncora “#” 
                     Chamamos o navigate() direto ao clicar em qualquer parte, exceto coração */}
                <div
                  className="artigo-link"
                  onClick={() => navigate(`/anuncio/${id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="artigo-card-inner">
                    <div className="artigo-card-front">
                      <img
                        className="object-fit-cover"
                        src={urlImagem}
                        alt={nome}
                      />
                    </div>
                    <div className="artigo-card-back">
                      <p>{nome}</p>
                    </div>
                  </div>
                </div>

                <div className="artigo-card-footer d-flex justify-content-between">
                  <p className="artigo-preco m-0 fw-bold">{preco}</p>
                  <button
                    type="button"
                    className="heart-icon border-0 bg-transparent p-0"
                    aria-label={favoritos[id] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    aria-pressed={Boolean(favoritos[id])}
                    title={favoritos[id] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    onClick={(e) => handleLikeToggle(e, id)}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        favoritos[id]
                          ? "bi-heart-fill text-danger"
                          : "bi-heart text-dark"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style>
        {`
          .custom-tooltip {
            --bs-tooltip-bg: var(--bd-violet-bg);
            --bs-tooltip-color: var(--bs-white);
          }
          .anuncio-card-front, .anuncio-card-back {
            height: 100%!important;
            padding: 2px!important;
          }
          .artigo-card-inner {
            height: 250px!important;
          }
          .anuncio-details {
            font-size: 10px;
          }
          .div-buttons {
            width: max-content;
          }
          .eye-button {
            background: none;
          }
        `}
      </style>
    </>
  );
}

export default DestaquesSwiper;
