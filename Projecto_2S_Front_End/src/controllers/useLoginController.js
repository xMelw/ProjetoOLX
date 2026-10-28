import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../models/authModel";

export default function useLoginController() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const submitLogin = async (event, credentials) => {
    event.preventDefault();
    try {
      const session = await login(credentials);
      if (session.utilizador_id) localStorage.setItem("utilizador_id", session.utilizador_id);
      if (session.role) localStorage.setItem("utilizador_role", session.role);
      if (session.nome) localStorage.setItem("utilizador_nome", session.nome);
      setMessage("Login efetuado com sucesso!");
      setTimeout(() => navigate(session.role === "admin" ? "/dashboard" : "/"), 500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Email ou palavra-passe incorretos.");
    }
  };
  return { message, submitLogin };
}