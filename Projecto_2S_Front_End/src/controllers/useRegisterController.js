import { useState } from "react";
import { register } from "../models/authModel";

const initialForm = { nome: "", email: "", password: "", telemovel: "" };
export default function useRegisterController() {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const setField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  const submitRegistration = async (event) => {
    event.preventDefault();
    try {
      await register(formData);
      setMessage("Obrigado pelo teu registo. A conta aguarda aprovação da administração.");
      setSuccess(true);
    } catch (error) {
      setMessage(`Erro ao registar: ${error.response?.data?.message || error.message}`);
    }
  };
  return { formData, setField, message, success, submitRegistration };
}