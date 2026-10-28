import Header from "../components/Header";
import Footer from "../components/Footer";
import BotaoToTOP from "../components/ScrollToTop";
import ProfileInfo from "../components/ProfileInfo";
import SubMenu from "../components/SubMenu";
import User_Anuncios from "../components/UserAnuncio";
import FeedbackSlider from "../parts/FeedBackSwiper";
import ModalUser from "../components/ModalUser";
import useProfileController from "../../controllers/useProfileController";

const Profile = () => {
  const { userInfo, ads: anunciosFiltrados, feedbacks, locations, filterStatus: filtroEstado, changeFilter: onChangeFiltro, showUserModal, setShowUserModal, refreshUser: handleUserUpdated } = useProfileController();
  if (!userInfo) return <p className="text-center mt-5">A carregar perfil...</p>;

  const subMenuProfile = [
    { nome: "Feedbacks", caminho: "#Feedback" },
    { nome: "Meus Anúncios", caminho: "#MeusAnúncios" },
  ];
  return (
    <>
      <Header />

      <div
        className="profile-container d-flex flex-row justify-content-between align-items-start flex-wrap p-2 h-100 w-100"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="profile-info p-5 h-100 justify-content-center align-items-center"
          style={{ width: "35%" }}
        >
          <div
            className="d-flex flex-column gap-2 justify-content-center align-items-center h-100 p-5 rounded-3 shadow-sm"
            style={{ backgroundColor: "#F5F5F5", width: "100%" }}
          >
            <ProfileInfo
              user={{
                ...userInfo,
                localizacao: userInfo.localizacaoNome,
              }}
              onEdit={() => setShowUserModal(true)}
            />
          </div>

          <section id="Feedback" className="mt-4">
            <div className="feedback d-flex flex-column align-items-center justify-content-center w-100 h-100">
              <h2 className="text-dark align-self-center m-4">Feedbacks</h2>
              {feedbacks.length === 0 ? (
                <p className="text-center">Sem feedback registrado.</p>
              ) : (
                <FeedbackSlider feedback={feedbacks} />
              )}
            </div>
          </section>
        </div>

        {/*     COLUNA PRINCIPAL (sub-menu + Meus Anúncios) */}
        <div
          className="profile-anuncios d-flex flex-column h-100 p-2"
          style={{ width: "65%" }}
        >
          <SubMenu subMenu={subMenuProfile} />

          <section id="MeusAnúncios" className="">
            <div className="anuncios d-flex flex-column align-items-center justify-content-center w-100 m-0">
              <h2
                className="text-dark align-self-center mb-3"
                style={{ margin: 0 }}
              >
                Meus Anúncios
              </h2>

              {/*    FILTRO POR ESTADO */}
              <div
                className="w-100 d-flex justify-content-center mb-4"
                style={{ maxWidth: "300px" }}
              >
                <select
                  className="form-select w-auto"
                  value={filtroEstado}
                  onChange={(e) => onChangeFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="terminado">Terminados</option>
                  <option value="excluido">Excluídos</option>
                </select>
              </div>

              {/*    LISTA FILTRADA */}
              <div className="d-flex flex-row flex-wrap justify-content-start align-items-center w-100 h-100 gap-3">
                {anunciosFiltrados.length === 0 ? (
                  <p className="text-center">Não possui anúncios.</p>
                ) : (
                  anunciosFiltrados.map((anuncio) => (
                    <User_Anuncios key={anuncio.id} useranuncio={anuncio} />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <BotaoToTOP />
      <Footer />

      {/*       MODAL DE EDIÇÃO DE USUÁRIO */}
      <ModalUser
        show={showUserModal}
        handleClose={() => setShowUserModal(false)}
        initialData={{
          id: userInfo.id,
          nome: userInfo.nome,
          email: userInfo.email,
          telemovel: userInfo.telemovel,
          localizacao: userInfo.localizacaoId, // envia o ID
          imagem: null,
        }}
        locations={locations}
        onUpdated={handleUserUpdated}
      />

      <style>
        {`
        .profile-info img {
          border-radius: 50%;
        }
      `}
      </style>
    </>
  );
};

export default Profile;
