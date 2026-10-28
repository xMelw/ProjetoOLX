import { useState } from "react";
import useLoginController from "../../controllers/useLoginController";

const LoginPart = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { message, submitLogin } = useLoginController();
  return (
    <div className="form-box login text-center position-absolute w-50 h-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={(event) => submitLogin(event, { email, password })} className="space-y-4">
        <div className="input-box"><input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="input-box"><input type="password" placeholder="Palavra-passe" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <button type="submit" className="btn">Entrar</button>
      </form>
      {message && <p className={`mt-4 ${message.includes("sucesso") ? "text-green-700" : "text-red-600"}`}>{message}</p>}
    </div>
  );
};

export default LoginPart;