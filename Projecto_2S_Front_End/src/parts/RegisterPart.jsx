import { useState } from "react";
import api from "../services/api";

const RegisterPart = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    telemovel: ""
  });
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/registro", formData);
      setMensagem("Obrigado pelo seu registo. Sua conta será aprovada em breve pela administração.");
      setSucesso(true);
      console.log("Resposta registo:", res.data);
    } catch (err) {
      console.error("Erro registo:", err);
      setMensagem("Erro ao registar: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="form-box register overflow-y-auto max-h-full text-center position-absolute w-50 h-100">
      {sucesso ? (
        <div className="flex flex-col justify-center items-center h-full p-4">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Registo submetido</h2>
          <p className="mb-4">{mensagem}</p>
          <a href="/" className="btn w-auto px-6">Voltar ao site</a>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Registar</h1>
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="input-box">
              <input
                type="text"
                placeholder="Nome"
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Palavra-passe"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={8}
                required
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Telemóvel"
                onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn">Registar</button>
          </form>
          {mensagem && <p className={`mt-4 ${sucesso ? "text-green-700" : "text-red-600"}`}>{mensagem}</p>}
        </>
      )}
    </div>
  );
};

export default RegisterPart;
