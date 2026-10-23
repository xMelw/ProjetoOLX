import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const LoginPart = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", {
        email,
        password
      });

      
      if (res.data?.utilizador_id) {
        localStorage.setItem("utilizador_id", res.data.utilizador_id);
        if (res.data?.role) localStorage.setItem("utilizador_role", res.data.role);
        if (res.data?.nome) localStorage.setItem("utilizador_nome", res.data.nome);
      }

      setMensagem("Login efetuado com sucesso!");
      setTimeout(() => navigate(res.data?.role === "admin" ? "/dashboard" : "/"), 500);
    } catch (err) {
      setMensagem(err.response?.data?.message || "Email ou palavra-passe incorretos.");
    }
  };


  return (
    <div className="form-box login text-center position-absolute w-50 h-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn">Entrar</button>
      </form>
      {mensagem && <p className={`mt-4 ${mensagem.includes("sucesso") ? "text-green-700" : "text-red-600"}`}>{mensagem}</p>}
    </div>
  );
};

export default LoginPart;
